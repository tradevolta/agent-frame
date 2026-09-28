import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";
import { CITIES } from "@/content/cities";
import { POSTS } from "@/content/posts";
import { STYLE_GUIDES } from "@/content/style-guides";

// Bump when page content changes meaningfully; search engines use lastModified
// to decide what to recrawl, so "now" on every request would be noise.
const SITE_UPDATED = new Date("2026-09-28");

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, lastModified = SITE_UPDATED) => ({ url: appUrl(path), lastModified, priority });
  return [
    page("/", 1),
    page("/styles", 0.8),
    page("/teams", 0.8),
    page("/free-just-listed", 0.8),
    page("/realtor-headshots", 0.6),
    page("/blog", 0.6),
    ...STYLE_GUIDES.map((g) => page(`/styles/${g.id}`, 0.7)),
    ...CITIES.map((c) => page(`/realtor-headshots/${c.slug}`, 0.7)),
    ...POSTS.map((p) => page(`/blog/${p.slug}`, 0.6, new Date(p.updated ?? p.date))),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
