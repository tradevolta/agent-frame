import { getCity } from "@/content/cities";
import { OG_SIZE, ogCard } from "@/lib/seo";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "AI realtor headshots";

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const city = getCity((await params).city);
  return ogCard({
    eyebrow: city ? `${city.name}, ${city.stateCode}` : undefined,
    title: city ? `Realtor headshots for ${city.name} agents` : "Realtor headshots by city",
    subtitle: "12 real estate styles + listing graphics. Ready in about an hour.",
  });
}
