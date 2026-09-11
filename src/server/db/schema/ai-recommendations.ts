import { sql } from "drizzle-orm";

import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { menuItems } from "./menu-items";
import { profiles } from "./profiles";
import { restaurants } from "./restaurants";

export const recommendationType = pgEnum(
  "recommendation_type",
  [
    "price_change",
    "description_improvement",
    "category_change",
    "availability_change",
    "new_menu_item",
  ],
);

export const recommendationStatus = pgEnum(
  "recommendation_status",
  ["pending", "accepted", "rejected"],
);

export type RecommendationValue = Record<string, unknown>;

export const aiRecommendations = pgTable(
  "ai_recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    menuItemId: uuid("menu_item_id").references(
      () => menuItems.id,
      {
        onDelete: "cascade",
      },
    ),

    type: recommendationType("type").notNull(),

    currentValue: jsonb("current_value")
      .$type<RecommendationValue>(),

    suggestedValue: jsonb("suggested_value")
      .$type<RecommendationValue>()
      .notNull(),

    explanation: text("explanation").notNull(),

    status: recommendationStatus("status")
      .default("pending")
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
    }),

    reviewedBy: uuid("reviewed_by").references(
      () => profiles.id,
      {
        onDelete: "set null",
      },
    ),
  },
  (table) => [

    index("ai_recommendations_menu_item_id_idx").on(
      table.menuItemId,
    ),

    index("ai_recommendations_restaurant_status_idx").on(
      table.restaurantId,
      table.status,
    ),

    check(
      "ai_recommendations_target_consistency",
      sql`
        (
          ${table.type} = 'new_menu_item'
          AND ${table.menuItemId} IS NULL
        )
        OR
        (
          ${table.type} <> 'new_menu_item'
          AND ${table.menuItemId} IS NOT NULL
        )
      `,
    ),

    check(
    "ai_recommendations_review_consistency",
    sql`
        (
        ${table.status} = 'pending'
        AND ${table.reviewedAt} IS NULL
        AND ${table.reviewedBy} IS NULL
        )
        OR
        (
        ${table.status} IN ('accepted', 'rejected')
        AND ${table.reviewedAt} IS NOT NULL
        )
    `,
    ),
  ],
);

export type AiRecommendation =
  typeof aiRecommendations.$inferSelect;

export type NewAiRecommendation =
  typeof aiRecommendations.$inferInsert;