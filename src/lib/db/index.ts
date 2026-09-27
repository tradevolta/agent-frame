import "server-only";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { ConfigError } from "../config-error";
import { cleanPgUrl, databaseUrl, isNeon } from "./url";

// Production: Supabase (POSTGRES_URL, via node-postgres through its pooler) or
// Neon (DATABASE_URL, via its HTTP driver). Local dev / tests: embedded PGlite,
// auto-migrated, so no Postgres install is needed.
export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { __db?: Promise<DB> };

async function create(): Promise<DB> {
  const url = databaseUrl();
  if (url && isNeon(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(url), { schema }) as unknown as DB;
  }
  if (url) {
    return connectPostgres(url);
  }
  if (process.env.VERCEL) {
    // PGlite needs a writable, persistent disk; serverless has neither.
    throw new ConfigError("database", "No database URL. Connect Supabase (or Neon) in the Vercel project's Storage tab, then redeploy.");
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

/** Last connection problem, shown on /admin so failures are diagnosable without logs. */
export const dbDiagnostics: { host?: string; error?: string } = {};

/**
 * Supabase gives a pooled URL (POSTGRES_URL) and a direct/session one
 * (POSTGRES_URL_NON_POOLING). Use the pooled one, but verify it answers
 * quickly and fall back to the other if it doesn't.
 *
 * node-postgres + attachDatabasePool: Vercel suspends functions between
 * requests, and a pooled socket can die while suspended. The next query on it
 * would hang. attachDatabasePool closes idle clients before suspension, and the
 * timeouts below turn any remaining hang into an error instead of a stuck page.
 */
async function connectPostgres(primary: string): Promise<DB> {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const candidates = [primary, process.env.POSTGRES_URL_NON_POOLING].filter(
    (u, i, all): u is string => !!u && all.indexOf(u) === i,
  );
  const errors: string[] = [];
  for (const candidate of candidates) {
    const { url: clean, ssl } = cleanPgUrl(candidate);
    const host = new URL(clean).host;
    const pool = new Pool({
      connectionString: clean,
      // Supabase's pooler certificate isn't publicly trusted; same as sslmode=require.
      ssl: ssl ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 8_000,
      query_timeout: 20_000,
    });
    pool.on("error", (err) => console.error("[db] idle client error", err)); // don't crash on a dropped idle socket
    try {
      await pool.query("select 1");
      if (process.env.VERCEL) {
        const { attachDatabasePool } = await import("@vercel/functions");
        attachDatabasePool(pool);
      }
      dbDiagnostics.host = host;
      dbDiagnostics.error = errors.length ? errors.join(" | ") : undefined;
      return drizzle(pool, { schema }) as unknown as DB;
    } catch (err) {
      errors.push(`${host}: ${String((err as Error)?.message ?? err).slice(0, 200)}`);
      console.error("[db] connection failed", host, err);
      await pool.end().catch(() => {});
    }
  }
  dbDiagnostics.error = errors.join(" | ");
  throw new Error(`Database connection failed. ${dbDiagnostics.error}`);
}

export function getDb(): Promise<DB> {
  globalForDb.__db ??= create().catch((err) => {
    globalForDb.__db = undefined; // don't cache a failed connection
    throw err;
  });
  return globalForDb.__db;
}

export { schema };
