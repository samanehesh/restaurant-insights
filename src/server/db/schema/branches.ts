import {
  boolean,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { restaurants } from "./restaurants";

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    addressLine1: varchar("address_line_1", {
      length: 200,
    }).notNull(),

    addressLine2: varchar("address_line_2", {
      length: 200,
    }),

    city: varchar("city", {
      length: 100,
    }).notNull(),

    region: varchar("region", {
      length: 100,
    }).notNull(),

    postalCode: varchar("postal_code", {
      length: 20,
    }).notNull(),

    country: varchar("country", {
      length: 2,
    }).notNull(),

    timezone: varchar("timezone", {
      length: 100,
    }).notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("branches_restaurant_id_idx").on(table.restaurantId),

    uniqueIndex("branches_restaurant_name_unique").on(
      table.restaurantId,
      table.name,
    ),
  ],
);

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;