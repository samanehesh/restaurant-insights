import { sql } from "drizzle-orm";

import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { menuCategories } from "./menu-categories";
import { restaurants } from "./restaurants";

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id").notNull(),

    sku: varchar("sku", {
      length: 100,
    }),

    price: numeric("price", {
      precision: 10,
      scale: 2,
    }).notNull(),

    cost: numeric("cost", {
      precision: 10,
      scale: 2,
    }),

    imageUrl: text("image_url"),

    isAvailable: boolean("is_available")
      .default(true)
      .notNull(),

    displayOrder: integer("display_order")
      .default(0)
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
    index("menu_items_restaurant_id_idx").on(
      table.restaurantId,
    ),

    index("menu_items_category_id_idx").on(
      table.categoryId,
    ),

    foreignKey({
      name: "menu_items_category_restaurant_fk",
      columns: [table.categoryId, table.restaurantId],
      foreignColumns: [
        menuCategories.id,
        menuCategories.restaurantId,
      ],
    }).onDelete("cascade"),

    check(
      "menu_items_price_non_negative",
      sql`${table.price} >= 0`,
    ),

    check(
      "menu_items_cost_non_negative",
      sql`${table.cost} IS NULL OR ${table.cost} >= 0`,
    ),
  ],
);

export const menuItemTranslations = pgTable(
  "menu_item_translations",
  {
    menuItemId: uuid("menu_item_id")
      .notNull()
      .references(() => menuItems.id, {
        onDelete: "cascade",
      }),

    locale: varchar("locale", {
      length: 10,
    }).notNull(),

    name: varchar("name", {
      length: 200,
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
      columns: [table.menuItemId, table.locale],
    }),
  ],
);

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type MenuItemTranslation =
  typeof menuItemTranslations.$inferSelect;

export type NewMenuItemTranslation =
  typeof menuItemTranslations.$inferInsert;