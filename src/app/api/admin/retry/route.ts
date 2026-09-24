import { z } from "zod";
import { retryOrder } from "@/lib/pipeline";
import { handle, json } from "@/lib/http";

export const maxDuration = 120;

// Protected by src/proxy.ts (admin basic auth).
export const POST = handle(async (req: Request) => {
  const { orderId } = z.object({ orderId: z.string().uuid() }).parse(await req.json());
  await retryOrder(orderId);
  return json({ ok: true });
});
