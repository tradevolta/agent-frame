import "server-only";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { ConfigError } from "../config-error";
import { cleanPgUrl, databaseUrl, isNeon } from "./url";

// Production: Supabase (POSTGRES_URL, via postgres.js through its pooler) or
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
 */
async function connectPostgres(primary: string): Promise<DB> {
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const candidates = [primary, process.env.POSTGRES_URL_NON_POOLING].filter(
    (u, i, all): u is string => !!u && all.indexOf(u) === i,
  );
  const errors: string[] = [];
  for (const candidate of candidates) {
    const { url: clean, ssl } = cleanPgUrl(candidate);
    const host = new URL(clean).host;
    // prepare:false is required behind transaction-mode poolers (Supabase :6543).
    const client = postgres(clean, { ssl, prepare: false, max: 3, idle_timeout: 20, connect_timeout: 8 });
    try {
      await client`select 1`;
      dbDiagnostics.host = host;
      dbDiagnostics.error = errors.length ? errors.join(" | ") : undefined;
      return drizzle(client, { schema }) as unknown as DB;
    } catch (err) {
      errors.push(`${host}: ${String((err as Error)?.message ?? err).slice(0, 200)}`);
      console.error("[db] connection failed", host, err);
      await client.end({ timeout: 1 }).catch(() => {});
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
