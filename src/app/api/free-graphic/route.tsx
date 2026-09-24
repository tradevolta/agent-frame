import { z } from "zod";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getTemplate, renderBrandKit } from "@/lib/brandkit";
import { emails } from "@/lib/email";
import { putFile } from "@/lib/storage";
import { sign, verify } from "@/lib/tokens";
import { handle, json } from "@/lib/http";
import { UserError } from "@/lib/pipeline";
import { appUrl } from "@/lib/brand";

// Free "Just Listed" maker: our lead magnet. Visitors give an email, upload any
// photo, and get a watermarked graphic. Rendering URLs are HMAC-signed so this
// can't be used as an open image proxy.

const fields = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Enter your name").max(60),
  brokerage: z.string().trim().min(2, "Enter your brokerage").max(80),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(90).optional(),
  price: z.string().trim().max(30).optional(),
});

export const POST = handle(async (req: Request) => {
  const form = await req.formData();
  const data = fields.parse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  const file = form.get("photo");
  if (!(file instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new UserError("Add a JPG or PNG photo.");
  if (file.size > 4 * 1024 * 1024) throw new UserError("That photo is too large.");
  const stored = await putFile("free/photo.jpg", file, file.type);
  const db = await getDb();
  await db.insert(leads).values({ email: data.email, source: "free-just-listed", meta: { fullName: data.fullName, brokerage: data.brokerage, photoUrl: stored.url, photoPath: stored.pathname } });
  await emails.leadMagnet(data.email);
  const q = new URLSearchParams({
    u: stored.url,
    n: data.fullName,
    b: data.brokerage,
    p: data.phone ?? "",
    a: data.address ?? "",
    pr: data.price ?? "",
  });
  q.set("s", sign(q.toString()));
  return json({ url: appUrl(`/api/free-graphic?${q}`) });
});

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const s = q.get("s");
  q.delete("s");
  if (!verify(q.toString(), s)) return new Response("Forbidden", { status: 403 });
  return renderBrandKit({
    template: getTemplate("just-listed")!,
    photoUrl: q.get("u")!,
    profile: { fullName: q.get("n") ?? "", brokerage: q.get("b") ?? "", phone: q.get("p") ?? "" },
    address: q.get("a") ?? undefined,
    price: q.get("pr") ?? undefined,
    watermark: true,
  });
}
