import { orderPhotos, UserError } from "@/lib/pipeline";
import { orderFromParams } from "@/lib/studio-auth";
import { readFileBytes } from "@/lib/storage";
import { makeZip } from "@/lib/zip";
import { handle } from "@/lib/http";
import { brand } from "@/lib/brand";

export const maxDuration = 120;

export const GET = handle(async (req: Request, { params }: { params: Promise<{ token: string }> }) => {
  const order = await orderFromParams(params);
  const favoritesOnly = new URL(req.url).searchParams.get("favorites") === "1";
  let list = await orderPhotos(order.id);
  if (favoritesOnly) list = list.filter((p) => p.favorite);
  if (list.length === 0) throw new UserError("No photos to download yet.");
  const entries = await Promise.all(
    list.map(async (p, i) => ({ name: `${p.style}/${brand.name.toLowerCase()}-${i + 1}.jpg`, data: await readFileBytes(p.url) })),
  );
  const zip = makeZip(entries);
  return new Response(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${brand.name.toLowerCase()}-headshots${favoritesOnly ? "-favorites" : ""}.zip"`,
    },
  });
});
