import "server-only";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { orders, subscriptions, teams, type Subscription, type Team } from "./db/schema";
import { REFRESH_PLAN } from "./plans";
import { createPendingOrder, markOrderPaid, UserError } from "./pipeline";

// ---------------------------------------------------------------- teams

export async function getTeamByToken(token: string): Promise<Team | undefined> {
  const db = await getDb();
  const [t] = await db.select().from(teams).where(eq(teams.token, token)).limit(1);
  return t;
}

export async function getTeamByJoinCode(code: string): Promise<Team | undefined> {
  const db = await getDb();
  const [t] = await db.select().from(teams).where(eq(teams.joinCode, code.toUpperCase())).limit(1);
  return t;
}

export async function teamMembers(teamId: string) {
  const db = await getDb();
  return db
    .select({ id: orders.id, email: orders.email, status: orders.status, name: sql<string | null>`${orders.profile}->>'fullName'`, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.teamId, teamId))
    .orderBy(orders.createdAt);
}

/** Atomically claim one seat and create a pre-paid order for the agent. */
export async function claimSeat(joinCode: string, email: string, fullName: string): Promise<string> {
  const db = await getDb();
  const team = await getTeamByJoinCode(joinCode);
  if (!team || team.status !== "active") throw new UserError("This invite link isn't active.");
  const [existing] = await db
    .select({ token: orders.token })
    .from(orders)
    .where(and(eq(orders.teamId, team.id), eq(orders.email, email.toLowerCase())))
    .limit(1);
  if (existing) return existing.token; // same agent clicking twice gets their studio back

  const [claimed] = await db
    .update(teams)
    .set({ seatsUsed: sql`${teams.seatsUsed} + 1` })
    .where(and(eq(teams.id, team.id), lt(teams.seatsUsed, teams.seats)))
    .returning();
  if (!claimed) throw new UserError("All seats on this team are taken. Ask your manager to add more.");

  const order = await createPendingOrder({ plan: "team", email: email.toLowerCase(), teamId: team.id });
  await db
    .update(orders)
    .set({ profile: { fullName, brokerage: team.name } })
    .where(eq(orders.id, order.id));
  await markOrderPaid(order.id, { email: email.toLowerCase(), amountCents: 0 });
  return order.token;
}

// ---------------------------------------------------------------- Always Fresh subscription

export async function getSubscriptionByToken(token: string): Promise<Subscription | undefined> {
  const db = await getDb();
  const [s] = await db.select().from(subscriptions).where(eq(subscriptions.token, token)).limit(1);
  return s;
}

export function nextShootDate(sub: Subscription): Date | null {
  if (!sub.lastShootAt) return null;
  return new Date(sub.lastShootAt.getTime() + REFRESH_PLAN.refreshEveryDays * 86_400_000);
}

export async function subscriptionOrders(subId: string) {
  const db = await getDb();
  return db
    .select({ token: orders.token, status: orders.status, createdAt: orders.createdAt })
    .from(orders)
    .where(eq(orders.subscriptionId, subId))
    .orderBy(orders.createdAt);
}

/** Start a new included shoot if the subscriber is eligible. Returns the studio token. */
export async function startSubscriptionShoot(sub: Subscription): Promise<string> {
  if (sub.status !== "active" && sub.status !== "trialing") throw new UserError("Your subscription isn't active.");
  const db = await getDb();
  const cutoff = new Date(Date.now() - REFRESH_PLAN.refreshEveryDays * 86_400_000);
  const [claimed] = await db
    .update(subscriptions)
    .set({ lastShootAt: new Date() })
    .where(and(eq(subscriptions.id, sub.id), or(isNull(subscriptions.lastShootAt), lt(subscriptions.lastShootAt, cutoff))))
    .returning();
  if (!claimed) throw new UserError("Your next included shoot isn't available yet.");
  const order = await createPendingOrder({ plan: "pro", email: sub.email, subscriptionId: sub.id });
  await markOrderPaid(order.id, { email: sub.email, amountCents: 0 });
  return order.token;
}
