import { sql } from "drizzle-orm";

import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { branches } from "./branches";

export const dayOfWeek = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const businessHours = pgTable(
  "business_hours",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, {
        onDelete: "cascade",
      }),

    dayOfWeek: dayOfWeek("day_of_week").notNull(),

    openTime: time("open_time"),

    closeTime: time("close_time"),

    isClosed: boolean("is_closed")
      .default(false)
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
    index("business_hours_branch_id_idx").on(table.branchId),

    uniqueIndex("business_hours_branch_day_unique").on(
      table.branchId,
      table.dayOfWeek,
    ),

    check(
      "business_hours_time_consistency",
      sql`
        (
          ${table.isClosed} = true
          AND ${table.openTime} IS NULL
          AND ${table.closeTime} IS NULL
        )
        OR
        (
          ${table.isClosed} = false
          AND ${table.openTime} IS NOT NULL
          AND ${table.closeTime} IS NOT NULL
        )
      `,
    ),
  ],
);

export type BusinessHours = typeof businessHours.$inferSelect;
export type NewBusinessHours = typeof businessHours.$inferInsert;