import { beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { BLEED_IN, PRINT_FORMATS, getPrintFormat, needsUpscale } from "@/lib/print-formats";
import { canvasPx, renderPrint, toPrintPdf, toTrimmedPreview } from "@/lib/print";

let photoUrl = "";
const profile = { fullName: "Jordan Ellis", title: "REALTOR®", brokerage: "Example Realty", phone: "(919) 555-0142", email: "jordan@example.com", brandColor: "#2446a6" };

beforeAll(async () => {
  const jpg = await sharp({ create: { width: 768, height: 1024, channels: 3, background: "#a0b0c0" } }).jpeg().toBuffer();
  photoUrl = `data:image/jpeg;base64,${jpg.toString("base64")}`;
});

describe("print formats", () => {
  it("renders every format at the right pixel size, including bleed", async () => {
    for (const f of PRINT_FORMATS) {
      const dpi = 40;
      const img = await renderPrint({ format: f, photoUrl, profile, headline: "OPEN HOUSE", address: "412 Oak Hollow Dr", price: "$489,000", date: "Sat 1-3 PM" }, dpi);
      const meta = await sharp(Buffer.from(await img.arrayBuffer())).metadata();
      expect({ id: f.id, w: meta.width, h: meta.height }).toEqual({ id: f.id, ...(({ width, height }) => ({ w: width, h: height }))(canvasPx(f, dpi)) });
    }
  }, 60_000);

  it("upscales the headshot only where it prints large", () => {
    expect(needsUpscale(getPrintFormat("business-card")!)).toBe(false);
    expect(needsUpscale(getPrintFormat("postcard")!)).toBe(false);
    expect(needsUpscale(getPrintFormat("sign-rider")!)).toBe(true);
    expect(needsUpscale(getPrintFormat("headshot-8x10")!)).toBe(true);
  });

  it("makes a 300 DPI PDF sized to the bleed with the trim box at the finished size", async () => {
    const f = getPrintFormat("business-card")!;
    const img = await renderPrint({ format: f, photoUrl, profile }, 300);
    const png = await img.arrayBuffer();
    expect((await sharp(Buffer.from(png)).metadata()).width).toBe(1125); // (3.5 + 0.25) × 300
    const pdf = await PDFDocument.load(await toPrintPdf(f, png));
    const page = pdf.getPage(0);
    expect(page.getSize()).toEqual({ width: (3.5 + 2 * BLEED_IN) * 72, height: (2 + 2 * BLEED_IN) * 72 });
    expect(page.getTrimBox()).toEqual({ x: 9, y: 9, width: 3.5 * 72, height: 2 * 72 });
    expect(page.getBleedBox()).toEqual({ x: 0, y: 0, width: 270, height: 162 });
  }, 60_000);

  it("crops previews to the trim line", async () => {
    const f = getPrintFormat("postcard")!;
    const img = await renderPrint({ format: f, photoUrl, profile }, 100);
    const trimmed = await toTrimmedPreview(f, await img.arrayBuffer(), 100);
    const meta = await sharp(trimmed).metadata();
    expect([meta.width, meta.height]).toEqual([900, 600]);
  }, 60_000);
});
