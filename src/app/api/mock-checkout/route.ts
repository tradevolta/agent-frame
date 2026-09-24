import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, subscriptions, teams } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { appUrl } from "@/lib/brand";
import { PLANS, isPlanId } from "@/lib/plans";
import { fulfillOrder, fulfillSubscription, fulfillTeam } from "@/lib/payments";

// Development-only stand-in for Stripe Checkout. Disabled whenever Stripe is configured.
export async function GET(req: Request) {
  if (!env.allowMockPayments) return new NextResponse("Not found", { status: 404 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id") ?? "";
  const db = await getDb();
  if (kind === "order") {
    const [o] = await db.select().from(orders).where(eq(orders.id, id));
    if (!o) return new NextResponse("Not found", { status: 404 });
    const plan = isPlanId(o.plan) ? PLANS[o.plan] : PLANS.starter;
    await fulfillOrder(o.id, { email: o.email ?? "demo@example.com", amountCents: plan.priceCents, sessionId: `mock_${o.id}` });
    return NextResponse.redirect(appUrl(`/studio/${o.token}?paid=1`));
  }
  if (kind === "team") {
    const [t] = await db.select().from(teams).where(eq(teams.id, id));
    if (!t) return new NextResponse("Not found", { status: 404 });
    await fulfillTeam(t.id, t.seats * PLANS.team.priceCents);
    return NextResponse.redirect(appUrl(`/team/${t.token}?paid=1`));
  }
  if (kind === "subscription") {
    const [s] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    if (!s) return new NextResponse("Not found", { status: 404 });
    await fulfillSubscription(s.id, { email: s.email || "demo@example.com" });
    return NextResponse.redirect(appUrl(`/account/${s.token}?paid=1`));
  }
  return new NextResponse("Bad request", { status: 400 });
}
