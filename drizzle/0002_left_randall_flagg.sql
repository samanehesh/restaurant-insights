CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"address_line_1" varchar(200) NOT NULL,
	"address_line_2" varchar(200),
	"city" varchar(100) NOT NULL,
	"region" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(2) NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL,
	"day_of_week" "day_of_week" NOT NULL,
	"open_time" time,
	"close_time" time,
	"is_closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_hours_time_consistency" CHECK (
        (
          "business_hours"."is_closed" = true
          AND "business_hours"."open_time" IS NULL
          AND "business_hours"."close_time" IS NULL
        )
        OR
        (
          "business_hours"."is_closed" = false
          AND "business_hours"."open_time" IS NOT NULL
          AND "business_hours"."close_time" IS NOT NULL
        )
      )
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_restaurant_id_idx" ON "branches" USING btree ("restaurant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_restaurant_name_unique" ON "branches" USING btree ("restaurant_id","name");--> statement-breakpoint
CREATE INDEX "business_hours_branch_id_idx" ON "business_hours" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_hours_branch_day_unique" ON "business_hours" USING btree ("branch_id","day_of_week");