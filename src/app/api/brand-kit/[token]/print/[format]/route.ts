import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { describeFalError, upscaleImage } from "@/lib/ai";
import { getOrderByToken } from "@/lib/pipeline";
import { PLANS, isPlanId } from "@/lib/plans";
import { PRINT_DPI, getPrintFormat, needsUpscale } from "@/lib/print-formats";
import { renderPrint, toPrintPdf, toTrimmedPreview } from "@/lib/print";
import { persistRemote } from "@/lib/storage";
import { isToken } from "@/lib/tokens";

export const maxDuration = 120;

// GET ?preview=1 → small PNG trimmed to the finished size (live preview).
// GET            → print-ready PDF at 300 DPI with bleed (download).
export async function GET(req: Request, { params }: { params: Promise<{ token: string; format: string }> }) {
  const { token, format } = await params;
  const f = getPrintFormat(format);
  if (!isToken(token) || !f) return new Response("Not found", { status: 404 });
  const order = await getOrderByToken(token);
  if (!order) return new Response("Not found", { status: 404 });
  if (!(isPlanId(order.plan) && PLANS[order.plan].brandKit)) {
    return new Response("Print files are included with Agent Pro.", { status: 403 });
  }
  const q = new URL(req.url).searchParams;
  const db = await getDb();
  const photoId = q.get("photo");
  const [photo] = photoId && /^[0-9a-f-]{36}$/.test(photoId)
    ? await db.select().from(photos).where(and(eq(photos.id, photoId), eq(photos.orderId, order.id))).limit(1)
    : await db.select().from(photos).where(eq(photos.orderId, order.id)).orderBy(photos.favorite).limit(1);
  if (!photo) return new Response("No photos yet", { status: 409 });

  const text = {
    headline: q.get("headline") ?? undefined,
    address: q.get("address") ?? undefined,
    price: q.get("price") ?? undefined,
    details: q.get("details") ?? undefined,
    date: q.get("date") ?? undefined,
  };

  if (q.get("preview") === "1") {
    // About 1,400 px on the long edge: sharp enough to judge, fast to render.
    const dpi = Math.min(150, Math.floor(1400 / Math.max(f.widthIn, f.heightIn)));
    const img = await renderPrint({ format: f, photoUrl: photo.url, profile: order.profile, ...text }, dpi);
    const png = await toTrimmedPreview(f, await img.arrayBuffer(), dpi);
    return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=60" } });
  }

  // Large formats print the headshot bigger than it was generated: use a 4x
  // upscaled copy, made once per photo and kept.
  let photoUrl = photo.url;
  if (needsUpscale(f)) {
    if (photo.printUrl) photoUrl = photo.printUrl;
    else {
      try {
        const up = await upscaleImage(photo.url);
        const stored = up === photo.url ? { url: up } : await persistRemote(up, `photos/${order.id}/print-${photo.id}.jpg`);
        await db.update(photos).set({ printUrl: stored.url }).where(eq(photos.id, photo.id));
        photoUrl = stored.url;
      } catch (err) {
        // Don't block the download: print from the original and log why.
        console.error("[print] upscale failed", photo.id, describeFalError(err));
      }
    }
  }

  const img = await renderPrint({ format: f, photoUrl, profile: order.profile, ...text }, PRINT_DPI);
  const pdf = await toPrintPdf(f, await img.arrayBuffer());
  const filename = `${f.id}-${f.widthIn}x${f.heightIn}in.pdf`; // e.g. business-card-3.5x2in.pdf
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" },
  });
}
