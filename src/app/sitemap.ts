import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";
import { CITIES } from "@/content/cities";
import { POSTS } from "@/content/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: appUrl("/"), lastModified: now, priority: 1 },
    { url: appUrl("/teams"), lastModified: now, priority: 0.8 },
    { url: appUrl("/free-just-listed"), lastModified: now, priority: 0.8 },
    { url: appUrl("/realtor-headshots"), lastModified: now, priority: 0.6 },
    { url: appUrl("/blog"), lastModified: now, priority: 0.6 },
    ...CITIES.map((c) => ({ url: appUrl(`/realtor-headshots/${c.slug}`), lastModified: now, priority: 0.7 })),
    ...POSTS.map((p) => ({ url: appUrl(`/blog/${p.slug}`), lastModified: new Date(p.date), priority: 0.6 })),
    { url: appUrl("/privacy"), lastModified: now, priority: 0.2 },
    { url: appUrl("/terms"), lastModified: now, priority: 0.2 },
  ];
}
