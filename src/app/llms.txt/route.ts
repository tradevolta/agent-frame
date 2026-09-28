import { appUrl, brand } from "@/lib/brand";
import { PLANS, REFRESH_PLAN, formatUsd } from "@/lib/plans";
import { STYLES } from "@/lib/styles";
import { POSTS } from "@/content/posts";

// /llms.txt: a plain-text summary for AI assistants and AI search (llmstxt.org).
export const dynamic = "force-static";

export function GET() {
  const body = `# ${brand.name}

> AI headshots and marketing brand kits for real estate agents. Agents upload 10-20 selfies and get realistic headshots in 12 real estate styles, plus ready-to-post Just Listed, Open House and Sold graphics, in about an hour. Based in ${brand.homeState}, serving agents across the US.

## Pricing
- ${PLANS.starter.name}: ${formatUsd(PLANS.starter.priceCents)} one-time
- ${PLANS.pro.name}: ${formatUsd(PLANS.pro.priceCents)} one-time, includes the Brand Kit
- Brokerage teams: ${formatUsd(PLANS.team.priceCents)} per agent (5+ seats): ${appUrl("/teams")}
- ${REFRESH_PLAN.name}: ${formatUsd(REFRESH_PLAN.priceCents)} per year, a new shoot every 6 months

## Key pages
- [Home and pricing](${appUrl("/")})
- [Headshot styles](${appUrl("/styles")}): ${STYLES.map((s) => s.name).join(", ")}
- [Free Just Listed graphic maker](${appUrl("/free-just-listed")})
- [Headshots by city](${appUrl("/realtor-headshots")})
- [Privacy](${appUrl("/privacy")}): selfies are deleted automatically after 7 days

## Guides
${POSTS.map((p) => `- [${p.title}](${appUrl(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}

Contact: ${brand.supportEmail}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
