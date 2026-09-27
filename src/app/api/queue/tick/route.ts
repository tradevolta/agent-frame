import { claimSlot, processQueue, syncAllStale } from "@/lib/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Public heartbeat for the retry queue (pinged every 10 minutes by
// .github/workflows/queue-tick.yml). It only submits work that is already due,
// so anyone calling it can't cause extra spend; a shared rate limit keeps it
// to one run per minute.
export async function GET() {
  if (!(await claimSlot("queue:tick", 55))) return Response.json({ skipped: "ran less than a minute ago" });
  const queue = await processQueue();
  const synced = await syncAllStale();
  return Response.json({ ...queue, synced }, { headers: { "Cache-Control": "no-store" } });
}
