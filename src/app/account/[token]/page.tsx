import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubscriptionByToken, nextShootDate, subscriptionOrders } from "@/lib/accounts";
import { isToken } from "@/lib/tokens";
import { AutoRefresh } from "@/components/auto-refresh";
import { StartShootButton } from "./start-shoot";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage({ params }: PageProps<"/account/[token]">) {
  const { token } = await params;
  if (!isToken(token)) notFound();
  const sub = await getSubscriptionByToken(token);
  if (!sub) notFound();
  const shoots = await subscriptionOrders(sub.id);
  const next = nextShootDate(sub);
  const eligible = (sub.status === "active" || sub.status === "trialing") && (!next || next <= new Date());

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {sub.status === "pending_payment" ? <AutoRefresh ms={3000} /> : null}
      <p className="text-sm font-medium text-accent">Always Fresh</p>
      <h1 className="font-display text-3xl md:text-4xl">Your account</h1>
      <div className="card mt-6 p-6">
        <div className="flex justify-between text-sm"><span className="text-muted">Status</span><span className="font-medium capitalize">{sub.status.replace("_", " ")}</span></div>
        {sub.currentPeriodEnd ? <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Renews</span><span>{sub.currentPeriodEnd.toLocaleDateString()}</span></div> : null}
        <div className="mt-6">
          {eligible ? (
            <StartShootButton token={token} />
          ) : (
            <p className="text-sm text-muted">{next ? `Your next included shoot unlocks ${next.toLocaleDateString()}.` : "Waiting for payment confirmation…"}</p>
          )}
        </div>
      </div>
      {shoots.length ? (
        <div className="card mt-6 p-6">
          <h2 className="font-semibold">Your shoots</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {shoots.map((s) => (
              <li key={s.token} className="flex justify-between">
                <span>{s.createdAt.toLocaleDateString()} · <span className="capitalize">{s.status.replace("_", " ")}</span></span>
                <Link className="text-accent underline" href={`/studio/${s.token}`}>Open studio</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-6 text-sm text-muted">To cancel or update billing, reply to any of our emails and we&apos;ll handle it right away.</p>
    </div>
  );
}
