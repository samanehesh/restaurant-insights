import { sql } from "drizzle-orm";

import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";
import { restaurants } from "./restaurants";

export const menuImportStatus = pgEnum("menu_import_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export type MenuImportError = {
  row: number;
  field?: string;
  message: string;
};

export const menuImports = pgTable(
  "menu_imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, {
        onDelete: "cascade",
      }),

    importedBy: uuid("imported_by")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "restrict",
      }),

    fileName: varchar("file_name", {
      length: 255,
    }).notNull(),

    status: menuImportStatus("status")
      .default("pending")
      .notNull(),

    totalRows: integer("total_rows")
      .default(0)
      .notNull(),

    successfulRows: integer("successful_rows")
      .default(0)
      .notNull(),

    failedRows: integer("failed_rows")
      .default(0)
      .notNull(),

    errorDetails: jsonb("error_details")
      .$type<MenuImportError[]>(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("menu_imports_imported_by_idx").on(
      table.importedBy,
    ),

    index("menu_imports_restaurant_status_idx").on(
      table.restaurantId,
      table.status,
    ),

    check(
      "menu_imports_row_counts_non_negative",
      sql`
        ${table.totalRows} >= 0
        AND ${table.successfulRows} >= 0
        AND ${table.failedRows} >= 0
      `,
    ),

    check(
      "menu_imports_processed_rows_valid",
      sql`
        ${table.successfulRows} + ${table.failedRows}
        <= ${table.totalRows}
      `,
    ),
  ],
);

export type MenuImport = typeof menuImports.$inferSelect;
export type NewMenuImport = typeof menuImports.$inferInsert;