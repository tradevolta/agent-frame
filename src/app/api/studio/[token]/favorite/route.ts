import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { orderFromParams } from "@/lib/studio-auth";
import { handle, json } from "@/lib/http";

const schema = z.object({ photoId: z.string().uuid(), favorite: z.boolean() });

export const POST = handle(async (req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const order = await orderFromParams(params);
  const { photoId, favorite } = schema.parse(await req.json());
  const db = await getDb();
  await db.update(photos).set({ favorite }).where(and(eq(photos.id, photoId), eq(photos.orderId, order.id)));
  return json({ ok: true });
});
