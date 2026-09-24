import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (local dev database) ships WASM, and nodemailer uses Node sockets: don't bundle either.
  serverExternalPackages: ["@electric-sql/pglite", "nodemailer"],
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
