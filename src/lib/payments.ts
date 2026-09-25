import "server-only";
import Stripe from "stripe";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { events, orders, subscriptions, teams } from "./db/schema";
import { appUrl, brand } from "./brand";
import { emails } from "./email";
import { env } from "./env";
import { PLANS, REFRESH_PLAN, TEAM_MIN_SEATS, TEAM_MAX_SEATS, type PlanId } from "./plans";
import { createPendingOrder, markOrderPaid, referralCodeExists, UserError } from "./pipeline";
import { randomToken, shortCode } from "./tokens";
import { ConfigError } from "./config-error";

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!env.stripeSecret) throw new ConfigError("payments", "STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → Environment Variables.");
  stripe ??= new Stripe(env.stripeSecret);
  return stripe;
}

export type CheckoutRequest =
  | { kind: "order"; plan: Exclude<PlanId, "team">; email?: string; ref?: string }
  | { kind: "team"; seats: number; teamName: string; email: string; teamStyle?: string; backdropColor?: string }
  | { kind: "subscription"; email?: string };

/** Returns the URL to send the browser to (Stripe Checkout, or the mock checkout in dev). */
export async function createCheckout(req: CheckoutRequest): Promise<string> {
  if (!env.allowMockPayments) getStripe(); // throws ConfigError early if Stripe isn't set up
  if (req.kind === "order") return orderCheckout(req);
  if (req.kind === "team") return teamCheckout(req);
  return subscriptionCheckout(req);
}

async function orderCheckout(req: Extract<CheckoutRequest, { kind: "order" }>): Promise<string> {
  const plan = PLANS[req.plan];
  const ref = req.ref && (await referralCodeExists(req.ref)) ? req.ref : null;
  const order = await createPendingOrder({ plan: plan.id, email: req.email, referredBy: ref });

  if (env.allowMockPayments) return appUrl(`/api/mock-checkout?kind=order&id=${order.id}`);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: req.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.priceCents,
          product_data: { name: `${brand.name} ${plan.name}`, description: plan.features.join(" · ") },
        },
      },
    ],
    // Referral links get the referral coupon; otherwise customers may enter a promo code.
    ...(ref && env.referralCouponId ? { discounts: [{ coupon: env.referralCouponId }] } : { allow_promotion_codes: true }),
    metadata: { kind: "order", orderId: order.id },
    client_reference_id: order.id,
    success_url: appUrl(`/studio/${order.token}?paid=1`),
    cancel_url: appUrl(`/?canceled=1#pricing`),
  });
  await (await getDb()).update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  return session.url!;
}

async function teamCheckout(req: Extract<CheckoutRequest, { kind: "team" }>): Promise<string> {
  const seats = Math.floor(req.seats);
  if (!(seats >= TEAM_MIN_SEATS && seats <= TEAM_MAX_SEATS)) {
    throw new UserError(`Teams need between ${TEAM_MIN_SEATS} and ${TEAM_MAX_SEATS} seats.`);
  }
  const db = await getDb();
  const [team] = await db
    .insert(teams)
    .values({
      token: randomToken(),
      joinCode: shortCode(8),
      name: req.teamName.slice(0, 120),
      managerEmail: req.email,
      seats,
      teamStyle: req.teamStyle || null,
      backdropColor: req.backdropColor || null,
    })
    .returning();

  if (env.allowMockPayments) return appUrl(`/api/mock-checkout?kind=team&id=${team.id}`);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: req.email,
    line_items: [
      {
        quantity: seats,
        price_data: {
          currency: "usd",
          unit_amount: PLANS.team.priceCents,
          product_data: { name: `${brand.name} Brokerage Team seat`, description: `Agent Pro headshots + Brand Kit for ${team.name}` },
        },
      },
    ],
    allow_promotion_codes: true,
    invoice_creation: { enabled: true },
    metadata: { kind: "team", teamId: team.id },
    success_url: appUrl(`/team/${team.token}?paid=1`),
    cancel_url: appUrl(`/teams?canceled=1`),
  });
  await db.update(teams).set({ stripeSessionId: session.id }).where(eq(teams.id, team.id));
  return session.url!;
}

async function subscriptionCheckout(req: Extract<CheckoutRequest, { kind: "subscription" }>): Promise<string> {
  const db = await getDb();
  const [sub] = await db
    .insert(subscriptions)
    .values({ token: randomToken(), email: req.email || "", status: "pending_payment" })
    .returning();

  if (env.allowMockPayments) return appUrl(`/api/mock-checkout?kind=subscription&id=${sub.id}`);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: req.email || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: REFRESH_PLAN.priceCents,
          recurring: { interval: REFRESH_PLAN.interval },
          product_data: { name: `${brand.name} ${REFRESH_PLAN.name}` },
        },
      },
    ],
    allow_promotion_codes: true,
    metadata: { kind: "subscription", subscriptionId: sub.id },
    subscription_data: { metadata: { subscriptionId: sub.id } },
    success_url: appUrl(`/account/${sub.token}?paid=1`),
    cancel_url: appUrl(`/?canceled=1#pricing`),
  });
  await db.update(subscriptions).set({ stripeSessionId: session.id }).where(eq(subscriptions.id, sub.id));
  return session.url!;
}

// ---------------------------------------------------------------- fulfillment (shared by webhook + mock)

export async function fulfillOrder(orderId: string, info: { email?: string | null; amountCents: number; sessionId?: string; paymentIntent?: string | null }) {
  return markOrderPaid(orderId, info);
}

export async function fulfillTeam(teamId: string, amountCents: number) {
  const db = await getDb();
  const [team] = await db
    .update(teams)
    .set({ status: "active", amountCents })
    .where(and(eq(teams.id, teamId), eq(teams.status, "pending_payment")))
    .returning();
  if (team) await emails.teamPaid(team.managerEmail, team.token, team.joinCode, team.seats, team.name);
  return team;
}

export async function fulfillSubscription(
  subscriptionId: string,
  info: { email?: string | null; customerId?: string | null; stripeSubscriptionId?: string | null; periodEnd?: Date | null },
) {
  const db = await getDb();
  const [sub] = await db
    .update(subscriptions)
    .set({
      status: "active",
      email: info.email || undefined,
      stripeCustomerId: info.customerId ?? null,
      stripeSubscriptionId: info.stripeSubscriptionId ?? null,
      currentPeriodEnd: info.periodEnd ?? new Date(Date.now() + 365 * 86_400_000),
    })
    .where(and(eq(subscriptions.id, subscriptionId), eq(subscriptions.status, "pending_payment")))
    .returning();
  if (sub?.email) await emails.subscriptionActive(sub.email, sub.token);
  return sub;
}

// ---------------------------------------------------------------- webhook

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const db = await getDb();
  // Idempotency: Stripe retries; process each event once.
  const inserted = await db.insert(events).values({ id: event.id }).onConflictDoNothing().returning();
  if (inserted.length === 0) return;

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.payment_status !== "paid" && s.payment_status !== "no_payment_required") return;
        const email = s.customer_details?.email ?? s.customer_email;
        const kind = s.metadata?.kind;
        if (kind === "order" && s.metadata?.orderId) {
          await fulfillOrder(s.metadata.orderId, {
            email,
            amountCents: s.amount_total ?? 0,
            sessionId: s.id,
            paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
          });
        } else if (kind === "team" && s.metadata?.teamId) {
          await fulfillTeam(s.metadata.teamId, s.amount_total ?? 0);
        } else if (kind === "subscription" && s.metadata?.subscriptionId) {
          const stripeSubId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          let periodEnd: Date | null = null;
          if (stripeSubId) {
            const full = await getStripe().subscriptions.retrieve(stripeSubId);
            const end = full.items.data[0]?.current_period_end;
            if (end) periodEnd = new Date(end * 1000);
          }
          await fulfillSubscription(s.metadata.subscriptionId, {
            email,
            customerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
            stripeSubscriptionId: stripeSubId,
            periodEnd,
          });
        }
        return;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const end = sub.items.data[0]?.current_period_end;
        await db
          .update(subscriptions)
          .set({ status: sub.status, currentPeriodEnd: end ? new Date(end * 1000) : undefined })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        return;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) {
          await db.update(orders).set({ status: "refunded", updatedAt: new Date() }).where(eq(orders.stripePaymentIntent, pi));
        }
        return;
      }
    }
  } catch (err) {
    // Let Stripe retry: forget that we saw this event.
    await db.delete(events).where(eq(events.id, event.id));
    throw err;
  }
}

// ---------------------------------------------------------------- reconciliation

/**
 * Webhook fallback: when a customer returns from Stripe and we still show
 * "pending", ask Stripe directly. Fulfillment is idempotent, so racing the
 * webhook is safe. Covers blocked or delayed webhooks (e.g. a protected URL).
 */
async function paidSession(sessionId: string | null | undefined) {
  if (!sessionId || !env.stripeSecret || sessionId.startsWith("mock_")) return null;
  try {
    const s = await getStripe().checkout.sessions.retrieve(sessionId);
    return s.payment_status === "paid" || s.payment_status === "no_payment_required" ? s : null;
  } catch (err) {
    console.error("[reconcile]", sessionId, err);
    return null;
  }
}

export async function reconcileOrder(order: { id: string; status: string; stripeSessionId: string | null }) {
  if (order.status !== "pending_payment") return;
  const s = await paidSession(order.stripeSessionId);
  if (!s) return;
  await fulfillOrder(order.id, {
    email: s.customer_details?.email ?? s.customer_email,
    amountCents: s.amount_total ?? 0,
    sessionId: s.id,
    paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : null,
  });
}

export async function reconcileTeam(team: { id: string; status: string; stripeSessionId: string | null }) {
  if (team.status !== "pending_payment") return;
  const s = await paidSession(team.stripeSessionId);
  if (s) await fulfillTeam(team.id, s.amount_total ?? 0);
}

export async function reconcileSubscription(sub: { id: string; status: string; stripeSessionId: string | null }) {
  if (sub.status !== "pending_payment") return;
  const s = await paidSession(sub.stripeSessionId);
  if (!s) return;
  const stripeSubId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
  let periodEnd: Date | null = null;
  if (stripeSubId) {
    const full = await getStripe().subscriptions.retrieve(stripeSubId);
    const end = full.items.data[0]?.current_period_end;
    if (end) periodEnd = new Date(end * 1000);
  }
  await fulfillSubscription(sub.id, {
    email: s.customer_details?.email ?? s.customer_email,
    customerId: typeof s.customer === "string" ? s.customer : s.customer?.id,
    stripeSubscriptionId: stripeSubId,
    periodEnd,
  });
}
