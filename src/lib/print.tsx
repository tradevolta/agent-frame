import "server-only";
import { ImageResponse } from "next/og";
import type { AgentProfile } from "./db/schema";
import { ogFonts } from "./og-fonts";
import { BLEED_IN, PRINT_DPI, type PrintFormat } from "./print-formats";

export { PRINT_FORMATS, getPrintFormat, needsUpscale } from "./print-formats";

// Print-ready Brand Kit files: 300 DPI, 1/8" bleed on every side, text kept
// 1/8" inside the trim. Delivered as a PDF with TrimBox/BleedBox set, which
// Vistaprint, local print shops and brokerage vendors accept.
//
// Layouts are written in "dots" at 300 DPI (1 inch = 300) and scaled for
// lower-resolution previews. The brokerage name is always printed: state
// commissions (e.g. NC) require the firm name in advertising.

const SAFE_IN = 0.125;

/** One line under the listing that tells the reader what to do next. */
const CALL_TO_ACTION: Record<string, string> = {
  "JUST LISTED": "Call or text for a private showing",
  "OPEN HOUSE": "Stop by, no appointment needed",
  "JUST SOLD": "Thinking of selling? Ask me what your home is worth",
  "COMING SOON": "Ask me for early access before it hits the market",
  "UNDER CONTRACT": "Looking for a home like this? Let's talk",
  "PRICE IMPROVED": "Call or text for a private showing",
};

export interface PrintInput {
  format: PrintFormat;
  photoUrl: string;
  profile: AgentProfile;
  headline?: string;
  address?: string;
  price?: string;
  details?: string;
  date?: string;
}

const clean = (s: string | undefined, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function contrastText(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
}

/** Canvas size in pixels, including bleed, at the given DPI. */
export function canvasPx(f: PrintFormat, dpi: number) {
  return { width: Math.round((f.widthIn + 2 * BLEED_IN) * dpi), height: Math.round((f.heightIn + 2 * BLEED_IN) * dpi) };
}

/** Render the full-bleed artwork as a PNG at `dpi`. */
export async function renderPrint(input: PrintInput, dpi: number): Promise<ImageResponse> {
  const f = input.format;
  const s = dpi / PRINT_DPI; // layout dots → output pixels
  const d = (n: number) => Math.round(n * s);
  const IN = (inches: number) => inches * PRINT_DPI;
  const bleed = IN(BLEED_IN);
  const safe = bleed + IN(SAFE_IN); // distance from canvas edge to the safe area

  const p = input.profile;
  const color = /^#[0-9a-fA-F]{6}$/.test(p.brandColor ?? "") ? p.brandColor! : "#1f2a44";
  const onColor = contrastText(color);
  const name = clean(p.fullName, 60) || "Your Name";
  const title = clean(p.title, 60) || "REALTOR®";
  const brokerage = clean(p.brokerage, 80) || "Your Brokerage";
  const phone = clean(p.phone, 30);
  const email = clean(p.email, 80);
  const website = clean(p.website, 80);
  const headline = clean(input.headline, 20).toUpperCase() || "JUST LISTED";
  const address = clean(input.address, 90) || "123 Main Street, Youngsville NC";
  const price = clean(input.price, 30);
  const details = clean(input.details, 80);
  const date = clean(input.date, 60);
  const priceLine = [price, details].filter(Boolean).join("  •  ");

  const photo = (size: number, border?: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={input.photoUrl} width={d(size)} height={d(size)} alt="" style={{ borderRadius: d(size / 2), objectFit: "cover", ...(border ? { border } : {}) }} />
  );

  let body: React.ReactElement;

  if (f.id === "business-card") {
    // Trim 1050 × 600 dots. Color panel runs off the left, top and bottom edges.
    const panel = bleed + 420;
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff" }}>
        <div style={{ display: "flex", width: d(panel), height: "100%", background: color, alignItems: "center", justifyContent: "center", paddingLeft: d(bleed) }}>
          {photo(300, `${d(8)}px solid #ffffff`)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: `${d(safe)}px ${d(safe)}px ${d(safe)}px ${d(56)}px`, flex: 1 }}>
          <div style={{ fontSize: d(54), fontWeight: 700, color: "#111" }}>{name}</div>
          <div style={{ fontSize: d(28), color, marginTop: d(4) }}>{title}</div>
          <div style={{ fontSize: d(26), color: "#444", marginTop: d(28) }}>{brokerage}</div>
          {phone ? <div style={{ fontSize: d(28), color: "#111", marginTop: d(12), fontWeight: 700 }}>{phone}</div> : null}
          {email ? <div style={{ fontSize: d(22), color: "#444", marginTop: d(6) }}>{email}</div> : null}
          {website ? <div style={{ fontSize: d(22), color: "#444", marginTop: d(4) }}>{website}</div> : null}
        </div>
      </div>
    );
  } else if (f.id === "postcard") {
    // Trim 2700 × 1800 dots, landscape. Headline panel left, agent right.
    const panel = bleed + 1150;
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f7f5f2" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: d(panel), height: "100%", background: color, color: onColor, padding: `${d(safe)}px ${d(90)}px ${d(safe)}px ${d(safe + 40)}px` }}>
          <div style={{ fontSize: d(headline.length > 11 ? 150 : 180), fontWeight: 800, lineHeight: 1.02, letterSpacing: d(4) }}>{headline}</div>
          {date && headline === "OPEN HOUSE" ? <div style={{ fontSize: d(64), marginTop: d(30), fontWeight: 700 }}>{date}</div> : null}
          <div style={{ fontSize: d(68), fontWeight: 700, marginTop: d(60), lineHeight: 1.15 }}>{address}</div>
          {priceLine ? <div style={{ fontSize: d(52), marginTop: d(20), opacity: 0.9 }}>{priceLine}</div> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: d(safe) }}>
          {photo(660, `${d(14)}px solid #ffffff`)}
          <div style={{ fontSize: d(92), fontWeight: 700, color: "#111", marginTop: d(44), textAlign: "center" }}>{name}</div>
          <div style={{ fontSize: d(46), color: "#555", marginTop: d(8), textAlign: "center" }}>{`${title} • ${brokerage}`}</div>
          {phone ? <div style={{ fontSize: d(70), color, marginTop: d(28), fontWeight: 700 }}>{phone}</div> : null}
          {email || website ? <div style={{ fontSize: d(40), color: "#444", marginTop: d(10) }}>{[email, website].filter(Boolean).join("  •  ")}</div> : null}
        </div>
      </div>
    );
  } else if (f.id === "flyer") {
    // Trim 2550 × 3300 dots, portrait. Same look as the social graphics.
    const band = bleed + 1200;
    const ph = 1140;
    const cta = CALL_TO_ACTION[headline] ?? "Call or text me anytime";
    body = (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f7f5f2" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: d(band), background: color, color: onColor, paddingTop: d(safe), paddingBottom: d(ph / 2) }}>
          <div style={{ fontSize: d(headline.length > 11 ? 230 : 280), fontWeight: 800, letterSpacing: d(10) }}>{headline}</div>
          {date && headline === "OPEN HOUSE" ? <div style={{ fontSize: d(100), marginTop: d(10), fontWeight: 700 }}>{date}</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: d(-ph / 2) }}>{photo(ph, `${d(24)}px solid #f7f5f2`)}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: `${d(50)}px ${d(safe + 120)}px ${d(safe + 40)}px` }}>
          <div style={{ fontSize: d(120), fontWeight: 700, color: "#111", textAlign: "center", lineHeight: 1.15 }}>{address}</div>
          {priceLine ? <div style={{ fontSize: d(84), color, marginTop: d(24), textAlign: "center" }}>{priceLine}</div> : null}
          <div style={{ display: "flex", justifyContent: "center", marginTop: d(90), padding: `${d(44)}px ${d(90)}px`, borderRadius: d(40), background: color, color: onColor, fontSize: d(76), fontWeight: 700, textAlign: "center" }}>{cta}</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto" }}>
            <div style={{ fontSize: d(128), fontWeight: 700, color: "#111" }}>{name}</div>
            <div style={{ fontSize: d(62), color: "#555", marginTop: d(8) }}>{`${title} • ${brokerage}`}</div>
            {phone ? <div style={{ fontSize: d(112), color, marginTop: d(20), fontWeight: 700 }}>{phone}</div> : null}
            {email || website ? <div style={{ fontSize: d(54), color: "#444", marginTop: d(12) }}>{[email, website].filter(Boolean).join("  •  ")}</div> : null}
          </div>
        </div>
      </div>
    );
  } else if (f.id === "sign-rider") {
    // Trim 7200 × 1800 dots. Read from a car: name and a very large phone number.
    const ph = 1320;
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: color, color: onColor, alignItems: "center", padding: `0 ${d(safe + 150)}px` }}>
        {photo(ph, `${d(24)}px solid ${onColor}`)}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: d(160), flex: 1 }}>
          <div style={{ fontSize: d(300), fontWeight: 700, lineHeight: 1 }}>{name}</div>
          <div style={{ fontSize: d(phone.length > 16 ? 440 : 560), fontWeight: 800, lineHeight: 1.05, marginTop: d(30) }}>{phone || "(000) 000-0000"}</div>
          <div style={{ fontSize: d(160), marginTop: d(30), opacity: 0.9 }}>{brokerage}</div>
        </div>
      </div>
    );
  } else {
    // Headshot print: the photo alone, full bleed.
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={input.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  const { width, height } = canvasPx(f, dpi);
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: "Inter" }}>{body}</div>,
    { width, height, fonts: await ogFonts() },
  );
}

/** PNG → print PDF: JPEG at 300 DPI on a page the size of the bleed, with TrimBox and BleedBox set. */
export async function toPrintPdf(f: PrintFormat, png: ArrayBuffer): Promise<Uint8Array> {
  const [{ default: sharp }, { PDFDocument }] = await Promise.all([import("sharp"), import("pdf-lib")]);
  const jpg = await sharp(Buffer.from(png)).flatten({ background: "#ffffff" }).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).withMetadata({ density: PRINT_DPI }).toBuffer();
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${f.name} ${f.size}`);
  pdf.setProducer("AgentFrame");
  const pt = (inches: number) => inches * 72;
  const w = pt(f.widthIn + 2 * BLEED_IN);
  const h = pt(f.heightIn + 2 * BLEED_IN);
  const page = pdf.addPage([w, h]);
  page.drawImage(await pdf.embedJpg(jpg), { x: 0, y: 0, width: w, height: h });
  page.setBleedBox(0, 0, w, h);
  page.setTrimBox(pt(BLEED_IN), pt(BLEED_IN), pt(f.widthIn), pt(f.heightIn));
  return pdf.save();
}

/** PNG preview cropped to the trim line (what the printed piece will look like). */
export async function toTrimmedPreview(f: PrintFormat, png: ArrayBuffer, dpi: number): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  const { width, height } = canvasPx(f, dpi);
  const trimW = Math.round(f.widthIn * dpi);
  const trimH = Math.round(f.heightIn * dpi);
  return sharp(Buffer.from(png))
    .extract({ left: Math.floor((width - trimW) / 2), top: Math.floor((height - trimH) / 2), width: trimW, height: trimH })
    .png()
    .toBuffer();
}
