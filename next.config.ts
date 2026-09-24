import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database) ships WASM that must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Fonts read from disk by the Brand Kit image routes.
  outputFileTracingIncludes: {
    "/api/brand-kit/**": ["./assets/fonts/**"],
    "/api/free-graphic": ["./assets/fonts/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
