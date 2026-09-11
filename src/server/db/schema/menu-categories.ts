import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { restaurants } from "./restaurants";

export const menuCategories = pgTable(
  "menu_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    displayOrder: integer("display_order")
      .default(0)
      .notNull(),

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
    index("menu_categories_restaurant_id_idx").on(
      table.restaurantId,
    ),

    uniqueIndex("menu_categories_id_restaurant_unique").on(
      table.id,
      table.restaurantId,
    ),
  ],
);

export const menuCategoryTranslations = pgTable(
  "menu_category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, {
        onDelete: "cascade",
      }),

    locale: varchar("locale", {
      length: 10,
    }).notNull(),

    name: varchar("name", {
      length: 150,
    }).notNull(),

    description: text("description"),

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
    primaryKey({
      columns: [table.categoryId, table.locale],
    }),
  ],
);

export type MenuCategory =
  typeof menuCategories.$inferSelect;

export type NewMenuCategory =
  typeof menuCategories.$inferInsert;

export type MenuCategoryTranslation =
  typeof menuCategoryTranslations.$inferSelect;

export type NewMenuCategoryTranslation =
  typeof menuCategoryTranslations.$inferInsert;