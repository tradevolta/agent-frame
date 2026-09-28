import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database) ships WASM, and nodemailer uses Node sockets: don't bundle either.
  serverExternalPackages: ["@electric-sql/pglite", "nodemailer"],
  // Fonts read from disk by the Brand Kit image routes.
  outputFileTracingIncludes: {
    "/api/brand-kit/**": ["./assets/fonts/**"],
    "/api/free-graphic": ["./assets/fonts/**"],
    "/opengraph-image": ["./assets/fonts/**"],
    "/styles/[style]/opengraph-image": ["./assets/fonts/**"],
    "/blog/[slug]/opengraph-image": ["./assets/fonts/**"],
    "/realtor-headshots/[city]/opengraph-image": ["./assets/fonts/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
