import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";
import { restaurants } from "./restaurants";

export const restaurantRole = pgEnum("restaurant_role", [
  "owner",
  "manager",
  "staff",
]);

export const restaurantMembers = pgTable(
  "restaurant_members",
  {
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    role: restaurantRole("role")
      .default("staff")
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.restaurantId, table.userId],
    }),
  ],
);

export type RestaurantMember =
  typeof restaurantMembers.$inferSelect;

export type NewRestaurantMember =
  typeof restaurantMembers.$inferInsert;