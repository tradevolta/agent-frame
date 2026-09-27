import { getOrderByToken, orderJobsSummary, orderPhotos, processQueue, syncOrder } from "@/lib/pipeline";
import { orderFromParams } from "@/lib/studio-auth";
import { reconcileOrder } from "@/lib/payments";
import { handle, json } from "@/lib/http";

export const maxDuration = 60;

export const GET = handle(async (_req: Request, { params }: { params: Promise<{ token: string }> }) => {
  let order = await orderFromParams(params);
  // Opportunistic recovery if a webhook went missing.
  await reconcileOrder(order).catch((e) => console.error("[status reconcile]", e));
  await syncOrder(order).catch((e) => console.error("[status sync]", e));
  // Retry this order's queued work if it's due (the customer's open page acts as a heartbeat).
  await processQueue({ orderId: order.id }).catch((e) => console.error("[status queue]", e));
  order = (await getOrderByToken(order.token)) ?? order;
  const [photos, progress] = await Promise.all([orderPhotos(order.id), orderJobsSummary(order.id)]);
  return json({
    status: order.status,
    progress,
    startedAt: order.trainingStartedAt?.toISOString() ?? null,
    redosRemaining: order.redosRemaining,
    photos: photos.map((p) => ({ id: p.id, url: p.url, style: p.style, favorite: p.favorite })),
  });
});
