import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });

const migrationUrl = process.env.DATABASE_MIGRATION_URL;

if (!migrationUrl) {
  throw new Error("DATABASE_MIGRATION_URL is not configured");
}

const migrationClient = postgres(migrationUrl, {
  max: 1,
  ssl: "require",
});

const migrationDb = drizzle(migrationClient);

async function runMigrations() {
  try {
    console.log("Applying pending database migrations...");

    await migrate(migrationDb, {
      migrationsFolder: "./drizzle",
    });

    console.log("Database migrations completed successfully.");
  } finally {
    await migrationClient.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error("Database migration failed:", error);
  process.exit(1);
});