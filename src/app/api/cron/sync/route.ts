import { isCronAuthorized } from "@/lib/cron";
import { syncAllStale } from "@/lib/pipeline";

export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401 });
  return Response.json({ synced: await syncAllStale() });
}
