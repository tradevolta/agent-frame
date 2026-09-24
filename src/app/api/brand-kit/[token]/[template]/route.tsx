import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { getTemplate, renderBrandKit } from "@/lib/brandkit";
import { getOrderByToken } from "@/lib/pipeline";
import { PLANS, isPlanId } from "@/lib/plans";
import { isToken } from "@/lib/tokens";

export async function GET(req: Request, { params }: { params: Promise<{ token: string; template: string }> }) {
  const { token, template } = await params;
  const tpl = getTemplate(template);
  if (!isToken(token) || !tpl) return new Response("Not found", { status: 404 });
  const order = await getOrderByToken(token);
  if (!order) return new Response("Not found", { status: 404 });
  if (!(isPlanId(order.plan) && PLANS[order.plan].brandKit)) {
    return new Response("Brand Kit is included with Agent Pro.", { status: 403 });
  }
  const q = new URL(req.url).searchParams;
  const db = await getDb();
  const photoId = q.get("photo");
  const [photo] = photoId && /^[0-9a-f-]{36}$/.test(photoId)
    ? await db.select().from(photos).where(and(eq(photos.id, photoId), eq(photos.orderId, order.id))).limit(1)
    : await db.select().from(photos).where(eq(photos.orderId, order.id)).orderBy(photos.favorite).limit(1);
  if (!photo) return new Response("No photos yet", { status: 409 });

  const res = await renderBrandKit({
    template: tpl,
    photoUrl: photo.url,
    profile: order.profile,
    address: q.get("address") ?? undefined,
    price: q.get("price") ?? undefined,
    details: q.get("details") ?? undefined,
    date: q.get("date") ?? undefined,
  });
  if (q.get("download") === "1") res.headers.set("Content-Disposition", `attachment; filename="${tpl.id}.png"`);
  return res;
}
