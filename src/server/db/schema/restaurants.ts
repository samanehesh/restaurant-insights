import {
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 200,
  }).notNull(),

  country: varchar("country", {
    length: 2,
  }).notNull(),

  timezone: varchar("timezone", {
    length: 100,
  }).notNull(),

  currency: varchar("currency", {
    length: 3,
  })
    .default("CAD")
    .notNull(),

  defaultLocale: varchar("default_locale", {
    length: 10,
  })
    .default("en")
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
});

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;