import { getStyleGuide } from "@/content/style-guides";
import { OG_SIZE, ogCard } from "@/lib/seo";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Realtor headshot style";

export default async function Image({ params }: { params: Promise<{ style: string }> }) {
  const guide = getStyleGuide((await params).style);
  return ogCard({ eyebrow: "Headshot styles", title: guide?.title ?? "Realtor headshot styles", subtitle: "AI headshots for real estate agents. Ready in about an hour." });
}
