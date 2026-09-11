CREATE TYPE "public"."recommendation_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."recommendation_type" AS ENUM('price_change', 'description_improvement', 'category_change', 'availability_change', 'new_menu_item');--> statement-breakpoint
CREATE TYPE "public"."menu_import_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"type" "recommendation_type" NOT NULL,
	"current_value" jsonb,
	"suggested_value" jsonb NOT NULL,
	"explanation" text NOT NULL,
	"status" "recommendation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	CONSTRAINT "ai_recommendations_target_consistency" CHECK (
        (
          "ai_recommendations"."type" = 'new_menu_item'
          AND "ai_recommendations"."menu_item_id" IS NULL
        )
        OR
        (
          "ai_recommendations"."type" <> 'new_menu_item'
          AND "ai_recommendations"."menu_item_id" IS NOT NULL
        )
      ),
	CONSTRAINT "ai_recommendations_review_consistency" CHECK (
        (
        "ai_recommendations"."status" = 'pending'
        AND "ai_recommendations"."reviewed_at" IS NULL
        AND "ai_recommendations"."reviewed_by" IS NULL
        )
        OR
        (
        "ai_recommendations"."status" IN ('accepted', 'rejected')
        AND "ai_recommendations"."reviewed_at" IS NOT NULL
        )
    )
);
--> statement-breakpoint
CREATE TABLE "menu_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"imported_by" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"status" "menu_import_status" DEFAULT 'pending' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"successful_rows" integer DEFAULT 0 NOT NULL,
	"failed_rows" integer DEFAULT 0 NOT NULL,
	"error_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "menu_imports_row_counts_non_negative" CHECK (
        "menu_imports"."total_rows" >= 0
        AND "menu_imports"."successful_rows" >= 0
        AND "menu_imports"."failed_rows" >= 0
      ),
	CONSTRAINT "menu_imports_processed_rows_valid" CHECK (
        "menu_imports"."successful_rows" + "menu_imports"."failed_rows"
        <= "menu_imports"."total_rows"
      )
);
--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_imports" ADD CONSTRAINT "menu_imports_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_imports" ADD CONSTRAINT "menu_imports_imported_by_profiles_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_recommendations_menu_item_id_idx" ON "ai_recommendations" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "ai_recommendations_restaurant_status_idx" ON "ai_recommendations" USING btree ("restaurant_id","status");--> statement-breakpoint
CREATE INDEX "menu_imports_imported_by_idx" ON "menu_imports" USING btree ("imported_by");--> statement-breakpoint
CREATE INDEX "menu_imports_restaurant_status_idx" ON "menu_imports" USING btree ("restaurant_id","status");