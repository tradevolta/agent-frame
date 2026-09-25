import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads, orders, subscriptions, teams } from "@/lib/db/schema";
import { formatUsd } from "@/lib/plans";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const db = await getDb();
  const [[totals], recent, teamRows, leadRows, [subCount]] = await Promise.all([
    db
      .select({
        paid: sql<number>`count(*) filter (where ${orders.status} not in ('pending_payment','refunded'))::int`,
        revenue: sql<number>`coalesce(sum(${orders.amountCents}) filter (where ${orders.status} not in ('pending_payment','refunded')),0)::int`,
        cost: sql<number>`coalesce(sum(${orders.estCostCents}),0)::int`,
        abandoned: sql<number>`count(*) filter (where ${orders.status} = 'pending_payment')::int`,
        failed: sql<number>`count(*) filter (where ${orders.status} = 'failed')::int`,
        last7: sql<number>`count(*) filter (where ${orders.status} not in ('pending_payment','refunded') and ${orders.createdAt} > now() - interval '7 days')::int`,
      })
      .from(orders),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
    db.select().from(teams).orderBy(desc(teams.createdAt)).limit(50),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(50),
    db.select({ n: sql<number>`count(*) filter (where ${subscriptions.status} = 'active')::int` }).from(subscriptions),
  ]);
  const teamRevenue = teamRows.filter((t) => t.status === "active").reduce((s, t) => s + t.amountCents, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl">Admin</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
        <Stat label="Paid orders" value={String(totals.paid)} />
        <Stat label="Last 7 days" value={String(totals.last7)} />
        <Stat label="Revenue (orders + teams)" value={formatUsd(totals.revenue + teamRevenue)} />
        <Stat label="Est. AI cost" value={formatUsd(totals.cost)} />
        <Stat label="Active subscribers" value={String(subCount.n)} />
        <Stat label="Abandoned checkouts" value={String(totals.abandoned)} />
      </div>
      {totals.failed ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-bad">{totals.failed} failed order(s) need attention: retry below or refund in Stripe.</p> : null}

      <h2 className="mt-10 text-lg font-semibold">Recent orders</h2>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-paper text-left"><tr>{["Created", "Email", "Plan", "Status", "Paid", "Est. cost", "Ref", "Studio", ""].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {recent.map((o) => (
              <tr key={o.id}>
                <td className="p-2 whitespace-nowrap">{o.createdAt.toLocaleString()}</td>
                <td className="p-2">{o.email ?? "-"}</td>
                <td className="p-2">{o.plan}{o.teamId ? " (team)" : ""}{o.subscriptionId ? " (sub)" : ""}</td>
                <td className="p-2"><span className={o.status === "failed" ? "font-semibold text-bad" : ""}>{o.status}</span>{o.error ? <div className="max-w-xs truncate text-xs text-muted" title={o.error}>{o.error}</div> : null}</td>
                <td className="p-2">{formatUsd(o.amountCents)}</td>
                <td className="p-2">{formatUsd(o.estCostCents)}</td>
                <td className="p-2 text-xs">{o.referredBy ?? ""}{o.referralCount ? ` → ${o.referralCount} refs` : ""}</td>
                <td className="p-2"><a className="text-accent underline" href={`/studio/${o.token}`} target="_blank">open</a></td>
                <td className="p-2">{o.status === "failed" ? <RetryButton orderId={o.id} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Teams</h2>
          <div className="card mt-3 divide-y divide-line text-sm">
            {teamRows.length === 0 ? <p className="p-3 text-muted">None yet.</p> : teamRows.map((t) => (
              <div key={t.id} className="flex justify-between p-3">
                <span>{t.name} <span className="text-muted">({t.managerEmail})</span></span>
                <span>{t.seatsUsed}/{t.seats} · {t.status} · <a className="text-accent underline" href={`/team/${t.token}`} target="_blank">dashboard</a></span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Leads</h2>
            <a href="/api/admin/leads" className="text-sm text-accent underline">Export CSV</a>
          </div>
          <div className="card mt-3 divide-y divide-line text-sm">
            {leadRows.length === 0 ? <p className="p-3 text-muted">None yet.</p> : leadRows.map((l) => (
              <div key={l.id} className="flex justify-between p-3"><span>{l.email}</span><span className="text-muted">{l.source} · {l.createdAt.toLocaleDateString()}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
