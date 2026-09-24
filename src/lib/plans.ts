export type PlanId = "starter" | "pro" | "team";

export interface Plan {
  id: PlanId;
  name: string;
  priceCents: number;
  blurb: string;
  styleCount: number; // number of styles the customer picks (or all)
  photosPerStyle: number;
  redos: number;
  brandKit: boolean;
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceCents: 2900,
    blurb: "A fresh, realistic headshot for your MLS and Zillow profile.",
    styleCount: 4,
    photosPerStyle: 10,
    redos: 1,
    brandKit: false,
    features: ["40 headshots", "Pick 4 realtor styles", "1 free redo", "Full-resolution downloads", "Ready in about 1 hour"],
  },
  pro: {
    id: "pro",
    name: "Agent Pro",
    priceCents: 4900,
    blurb: "Headshots plus the marketing kit you'll use every week.",
    styleCount: 12,
    photosPerStyle: 8,
    redos: 3,
    brandKit: true,
    highlight: true,
    features: [
      "~100 headshots",
      "All 12 realtor styles",
      "Brand Kit: Just Listed, Open House, Sold & more",
      "Business card & email signature graphics",
      "3 free redos",
      "Commercial use license",
    ],
  },
  team: {
    id: "team",
    name: "Brokerage Team",
    priceCents: 3900, // per seat
    blurb: "Consistent headshots for your whole office, one invoice.",
    styleCount: 12,
    photosPerStyle: 8,
    redos: 3,
    brandKit: true,
    features: [
      "Everything in Agent Pro, per agent",
      "Matching team backdrop",
      "One invite link for all agents",
      "Manager dashboard",
      "Minimum 5 seats",
    ],
  },
};

export const TEAM_MIN_SEATS = 5;
export const TEAM_MAX_SEATS = 500;

export const REFRESH_PLAN = {
  name: "Always Fresh",
  priceCents: 7900,
  interval: "year" as const,
  refreshEveryDays: 180,
  features: ["A new Agent Pro shoot every 6 months", "Seasonal Brand Kit templates", "Priority processing"],
};

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function isPlanId(v: unknown): v is PlanId {
  return v === "starter" || v === "pro" || v === "team";
}
