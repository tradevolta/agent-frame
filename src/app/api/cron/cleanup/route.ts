import { isCronAuthorized } from "@/lib/cron";
import { env } from "@/lib/env";
import { purgeOldUploads } from "@/lib/pipeline";

export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401 });
  // ?days= override exists for local testing only.
  const override = env.isProd ? null : new URL(req.url).searchParams.get("days");
  return Response.json({ purged: await purgeOldUploads(override ? Number(override) : 7) });
}
