import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/studio/", "/team/", "/join/", "/account/", "/admin"] }],
    sitemap: appUrl("/sitemap.xml"),
  };
}
