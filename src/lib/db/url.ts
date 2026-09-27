/**
 * Database URL from whichever integration set it: DATABASE_URL (Neon / manual)
 * or POSTGRES_URL (Supabase and Vercel Postgres integrations).
 */
export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export const isNeon = (url: string) => /\.neon\.tech\b/.test(url);

/**
 * postgres.js forwards unknown query params (e.g. Supabase's `supa=base-pooler.x`)
 * to the server as settings, which Postgres rejects. Keep the URL clean and pass
 * SSL separately.
 */
export function cleanPgUrl(url: string): { url: string; ssl: "require" | false } {
  const u = new URL(url);
  const local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname);
  const sslParam = u.searchParams.get("sslmode");
  u.search = "";
  return { url: u.toString(), ssl: local || sslParam === "disable" ? false : "require" };
}
