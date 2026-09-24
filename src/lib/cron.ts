import "server-only";
import { env } from "./env";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export function isCronAuthorized(req: Request): boolean {
  if (!env.cronSecret) return !env.isProd;
  return req.headers.get("authorization") === `Bearer ${env.cronSecret}`;
}
