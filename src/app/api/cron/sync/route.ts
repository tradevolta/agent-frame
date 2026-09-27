import { isCronAuthorized } from "@/lib/cron";
import { processQueue, syncAllStale } from "@/lib/pipeline";

export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401 });
  const queue = await processQueue();
  return Response.json({ ...queue, synced: await syncAllStale() });
}
