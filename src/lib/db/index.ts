import "server-only";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { ConfigError } from "../config-error";

// Production: Neon serverless Postgres (Vercel Marketplace integration sets DATABASE_URL).
// Local dev / tests: embedded PGlite, auto-migrated, so no Postgres install is needed.
export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { __db?: Promise<DB> };

async function create(): Promise<DB> {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(process.env.DATABASE_URL), { schema }) as unknown as DB;
  }
  if (process.env.VERCEL) {
    // PGlite needs a writable, persistent disk; serverless has neither.
    throw new ConfigError("database", "DATABASE_URL is not set. Add Neon Postgres in the Vercel project's Storage tab.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { mkdir } = await import("node:fs/promises");
  const dir = process.env.PGLITE_DIR || ".data/pglite";
  await mkdir(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as DB;
}

export function getDb(): Promise<DB> {
  globalForDb.__db ??= create().catch((err) => {
    globalForDb.__db = undefined; // don't cache a failed connection
    throw err;
  });
  return globalForDb.__db;
}

export { schema };
