import { getTemplate, renderBrandKit } from "@/lib/brandkit";
import { getSampleUrls } from "@/lib/samples";

// Real Brand Kit output for the marketing pages, rendered by the same code
// customers use (with an initials monogram in place of a headshot).
const SAMPLES: Record<string, { color: string; address?: string; price?: string; details?: string; date?: string }> = {
  "just-listed": { color: "#2446a6", address: "412 Oak Hollow Dr, Wake Forest", price: "$489,000", details: "4 bd • 3 ba" },
  "open-house": { color: "#23422f", address: "27 Maple Ridge Ln, Youngsville", date: "Sat, Oct 4 · 1-3 PM", price: "$412,500" },
  sold: { color: "#6b1f2e", address: "1180 Carrington Ct, Raleigh", price: "$538,000" },
  "under-contract": { color: "#1f5f5b", address: "9 Heron Pointe Dr, Rolesville" },
  "business-card": { color: "#2446a6" },
};

export async function GET(_req: Request, { params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const tpl = getTemplate(template);
  const sample = SAMPLES[template];
  if (!tpl || !sample) return new Response("Not found", { status: 404 });
  // Use the Classic Studio sample (a fictional agent) once it exists; initials until then.
  const photoUrl = (await getSampleUrls())["studio-gray"];
  const res = await renderBrandKit({
    template: tpl,
    photoUrl,
    profile: { fullName: "Dana Whitfield", title: "REALTOR®", brokerage: "Sample Realty Co.", phone: "(919) 555-0148", brandColor: sample.color },
    address: sample.address,
    price: sample.price,
    details: sample.details,
    date: sample.date,
  });
  res.headers.set("Cache-Control", photoUrl ? "public, max-age=3600, s-maxage=86400" : "public, max-age=300");
  return res;
}
