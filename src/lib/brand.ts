// Central place for everything brand-related so a rename is a one-file change.
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "AgentFrame",
  tagline: "AI headshots & brand kits built for real estate agents",
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN || "agent-frame.ai",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@agent-frame.ai",
  homeState: "North Carolina",
};

export function appUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
