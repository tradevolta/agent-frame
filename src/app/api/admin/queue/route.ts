import { z } from "zod";
import { processQueue, retryAllFailed } from "@/lib/pipeline";
import { handle, json } from "@/lib/http";

export const maxDuration = 300;

// Protected by src/proxy.ts (admin session).
export const POST = handle(async (req: Request) => {
  const { action } = z.object({ action: z.enum(["run", "retry_failed"]) }).parse(await req.json());
  if (action === "retry_failed") return json({ retried: await retryAllFailed() });
  return json(await processQueue({ force: true }));
});
