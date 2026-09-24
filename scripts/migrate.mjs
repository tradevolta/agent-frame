// Applies drizzle/ migrations to the Neon database before each build.
// Skipped when DATABASE_URL isn't set (local dev uses auto-migrated PGlite).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

if (!process.env.DATABASE_URL) {
  console.log("[migrate] DATABASE_URL not set; skipping (local PGlite migrates itself)");
} else {
  await migrate(drizzle(neon(process.env.DATABASE_URL)), { migrationsFolder: "drizzle" });
  console.log("[migrate] database is up to date");
}
