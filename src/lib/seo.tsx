import { ImageResponse } from "next/og";
import { appUrl, brand } from "./brand";
import { ogFonts } from "./og-fonts";

// Structured data (schema.org JSON-LD) and share images shared across pages.

export function JsonLd({ data }: { data: object | object[] }) {
  // Escape "<" so content can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": appUrl("/#organization"),
  name: brand.name,
  url: appUrl("/"),
  logo: appUrl("/icon"),
  email: brand.supportEmail,
  description: "AI headshots and marketing brand kits for real estate agents.",
  areaServed: "US",
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": appUrl("/#website"),
  name: brand.name,
  url: appUrl("/"),
  publisher: { "@id": appUrl("/#organization") },
});

/** Breadcrumb trail, e.g. [["Guides", "/blog"], ["Post title", "/blog/slug"]]. Home is added first. */
export function breadcrumbLd(trail: [name: string, path: string][]) {
  const items = [["Home", "/"] as [string, string], ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: appUrl(path) })),
  };
}

export const OG_SIZE = { width: 1200, height: 630 };

/** Share image in the same look as the site-wide one (src/app/opengraph-image.tsx). */
export async function ogCard({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  const long = title.length > 60;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#2446a6", color: "white", padding: 80, fontFamily: "Inter" }}>
        <div style={{ fontSize: 34, color: "#dbe3f7", fontWeight: 700 }}>{eyebrow ? `${brand.name} · ${eyebrow}` : brand.name}</div>
        <div style={{ fontSize: long ? 60 : 76, fontWeight: 800, lineHeight: 1.08, marginTop: 20 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 34, marginTop: 24, opacity: 0.85 }}>{subtitle}</div> : null}
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
