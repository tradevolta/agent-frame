// Applies drizzle/ migrations before each build (npm run build).
// Supabase: prefers the direct/session connection (POSTGRES_URL_NON_POOLING) for
// schema changes, falling back to the pooled POSTGRES_URL if it can't connect
// (some direct hosts are IPv6-only). Neon: DATABASE_URL. Skipped when no
// database is configured (local dev uses auto-migrated PGlite).
const candidates = [process.env.POSTGRES_URL_NON_POOLING, process.env.DATABASE_URL, process.env.POSTGRES_URL].filter(Boolean);

async function migrateWith(url) {
  if (/\.neon\.tech\b/.test(url)) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(drizzle(neon(url)), { migrationsFolder: "drizzle" });
    return;
  }
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const u = new URL(url);
  const local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname);
  const ssl = local || u.searchParams.get("sslmode") === "disable" ? false : "require";
  u.search = "";
  const client = postgres(u.toString(), { ssl, max: 1, prepare: false, connect_timeout: 15, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  } finally {
    await client.end({ timeout: 5 });
  }
}

if (candidates.length === 0) {
  console.log("[migrate] no database URL; skipping (local PGlite migrates itself)");
} else {
  let lastError;
  for (const url of candidates) {
    const host = new URL(url).hostname;
    try {
      await migrateWith(url);
      console.log(`[migrate] database is up to date (${host})`);
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[migrate] ${host} failed: ${err?.message ?? err}`);
    }
  }
  if (lastError) throw lastError;
}
