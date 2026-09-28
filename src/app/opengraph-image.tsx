import { OG_SIZE, ogCard } from "@/lib/seo";
import { brand } from "@/lib/brand";

export const alt = `${brand.name}: AI headshots for real estate agents`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard({
    title: "Realtor headshots that look like you.",
    subtitle: "12 real estate styles + Just Listed & Open House graphics. Ready in an hour.",
  });
}
