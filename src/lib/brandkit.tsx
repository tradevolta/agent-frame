import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AgentProfile } from "./db/schema";
import { brand } from "./brand";

// Marketing graphics rendered on the fly with next/og. Brokerage name is always
// printed: NC Real Estate Commission rules require the firm name in advertising.

export interface TemplateDef {
  id: string;
  name: string;
  width: number;
  height: number;
  headline?: string;
  needs: ("address" | "price" | "details" | "date")[];
}

export const TEMPLATES: TemplateDef[] = [
  { id: "just-listed", name: "Just Listed", width: 1080, height: 1350, headline: "JUST LISTED", needs: ["address", "price", "details"] },
  { id: "open-house", name: "Open House", width: 1080, height: 1350, headline: "OPEN HOUSE", needs: ["address", "date", "price"] },
  { id: "under-contract", name: "Under Contract", width: 1080, height: 1080, headline: "UNDER CONTRACT", needs: ["address"] },
  { id: "sold", name: "Just Sold", width: 1080, height: 1080, headline: "JUST SOLD", needs: ["address", "price"] },
  { id: "coming-soon", name: "Coming Soon", width: 1080, height: 1080, headline: "COMING SOON", needs: ["address", "details"] },
  { id: "business-card", name: "Business Card", width: 1050, height: 600, needs: [] },
  { id: "email-signature", name: "Email Signature", width: 1200, height: 300, needs: [] },
  { id: "linkedin-banner", name: "LinkedIn / Facebook Cover", width: 1584, height: 396, needs: [] },
];

// Inter (SIL OFL) in real weights; next/og's built-in font has no bold.
const fontDir = path.join(process.cwd(), "assets", "fonts");
const fontsPromise = Promise.all(
  ([400, 700, 800] as const).map(async (weight) => ({
    name: "Inter",
    data: await readFile(path.join(fontDir, `inter-latin-${weight}-normal.woff`)),
    weight,
    style: "normal" as const,
  })),
);

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

export interface RenderInput {
  template: TemplateDef;
  photoUrl?: string; // omitted → initials monogram (used for marketing demos)
  profile: AgentProfile;
  address?: string;
  price?: string;
  details?: string;
  date?: string;
  watermark?: boolean;
}

const clean = (s: string | undefined, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function contrastText(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
}

function Avatar({ url, size, initials, color, border }: { url?: string; size: number; initials: string; color: string; border?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} width={size} height={size} style={{ borderRadius: size / 2, objectFit: "cover", ...(border ? { border } : {}) }} alt="" />;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size / 2, background: "#dfe4ee", color, fontSize: size * 0.34, fontWeight: 700, ...(border ? { border } : {}) }}>
      {initials}
    </div>
  );
}

export async function renderBrandKit(input: RenderInput): Promise<ImageResponse> {
  const { template: t, profile } = input;
  const color = /^#[0-9a-fA-F]{6}$/.test(profile.brandColor ?? "") ? profile.brandColor! : "#1f2a44";
  const onColor = contrastText(color);
  const name = clean(profile.fullName, 60) || "Your Name";
  const title = clean(profile.title, 60) || "REALTOR®";
  const brokerage = clean(profile.brokerage, 80) || "Your Brokerage";
  const phone = clean(profile.phone, 30);
  const email = clean(profile.email, 80);
  const website = clean(profile.website, 80);
  const address = clean(input.address, 90) || "123 Main Street, Youngsville NC";
  const price = clean(input.price, 30);
  const details = clean(input.details, 80);
  const date = clean(input.date, 60);
  const contact = [phone, email, website].filter(Boolean).join("  •  ");
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const watermark = input.watermark ? (
    <div style={{ position: "absolute", bottom: 14, right: 20, fontSize: 20, color: "#00000099", display: "flex" }}>
      Made free at {brand.domain}
    </div>
  ) : null;

  let body: React.ReactElement;

  if (t.id === "business-card") {
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff" }}>
        <div style={{ display: "flex", width: 420, height: "100%", background: color, alignItems: "center", justifyContent: "center" }}>
          <Avatar url={input.photoUrl} size={300} initials={initials} color={color} border="8px solid #ffffff" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 56, flex: 1 }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#111" }}>{name}</div>
          <div style={{ fontSize: 30, color, marginTop: 6 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#444", marginTop: 36 }}>{brokerage}</div>
          {phone ? <div style={{ fontSize: 28, color: "#111", marginTop: 16 }}>{phone}</div> : null}
          {email ? <div style={{ fontSize: 24, color: "#444", marginTop: 8 }}>{email}</div> : null}
          {website ? <div style={{ fontSize: 24, color: "#444", marginTop: 8 }}>{website}</div> : null}
        </div>
      </div>
    );
  } else if (t.id === "email-signature") {
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff", alignItems: "center", padding: 30 }}>
        <Avatar url={input.photoUrl} size={220} initials={initials} color={color} />
        <div style={{ display: "flex", width: 6, height: 200, background: color, marginLeft: 36, marginRight: 36 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#111" }}>{name}</div>
          <div style={{ fontSize: 28, color }}>{`${title} | ${brokerage}`}</div>
          <div style={{ fontSize: 26, color: "#444", marginTop: 14 }}>{contact || "phone  •  email  •  website"}</div>
        </div>
      </div>
    );
  } else if (t.id === "linkedin-banner") {
    body = (
      <div style={{ display: "flex", width: "100%", height: "100%", background: color, alignItems: "center", justifyContent: "space-between", padding: "0 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", color: onColor, marginLeft: 420 }}>
          <div style={{ fontSize: 60, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>{`${title} • ${brokerage}`}</div>
          <div style={{ fontSize: 28, marginTop: 16, opacity: 0.85 }}>{contact || "Helping you find home"}</div>
        </div>
        <Avatar url={input.photoUrl} size={300} initials={initials} color={color} border={`8px solid ${onColor}`} />
      </div>
    );
  } else {
    const tall = t.height > t.width;
    const photoSize = tall ? 420 : 320;
    body = (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f7f5f2" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: color, color: onColor, height: tall ? 520 : 400, paddingBottom: photoSize / 2 }}>
          <div style={{ fontSize: (t.headline?.length ?? 0) > 12 ? (tall ? 96 : 84) : tall ? 120 : 104, fontWeight: 800, letterSpacing: 6 }}>{t.headline}</div>
          {t.id === "open-house" && date ? <div style={{ fontSize: 44, marginTop: 8 }}>{date}</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -photoSize / 2 }}>
          <Avatar url={input.photoUrl} size={photoSize} initials={initials} color={color} border="10px solid #f7f5f2" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 60px", flex: 1 }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: "#111", textAlign: "center" }}>{address}</div>
          {price || details ? (
            <div style={{ fontSize: 36, color, marginTop: 10, textAlign: "center" }}>{[price, details].filter(Boolean).join("  •  ")}</div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#111" }}>{name}</div>
            <div style={{ fontSize: 28, color: "#555" }}>{`${title} • ${brokerage}`}</div>
            {phone ? <div style={{ fontSize: 30, color: "#111", marginTop: 6 }}>{phone}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", fontFamily: "Inter" }}>
        {body}
        {watermark}
      </div>
    ),
    { width: t.width, height: t.height, fonts: await fontsPromise, headers: { "Cache-Control": "private, max-age=60" } },
  );
}
