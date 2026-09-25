import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { CheckoutButton } from "./checkout-button";
import { PLANS, REFRESH_PLAN, formatUsd } from "@/lib/plans";

function Check() {
  return <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-ok" aria-hidden />;
}

export function Pricing() {
  const plans = [PLANS.starter, PLANS.pro];
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl">Simple, one-time pricing</h2>
        <p className="mt-3 max-w-[60ch] text-muted">A local photographer typically charges a few hundred dollars and a week of scheduling. You&apos;ll have yours today.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`card flex flex-col p-6 ${p.highlight ? "border-2 border-accent bg-accent-soft/40" : ""}`}>
            {p.highlight ? <span className="mb-3 w-fit text-xs font-semibold text-accent">Most popular</span> : null}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted">{p.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl tabular-nums">{formatUsd(p.priceCents)}</span>
              <span className="text-sm text-muted">one-time</span>
            </div>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><Check />{f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <CheckoutButton body={{ kind: "order", plan: p.id }} label={`Get ${p.name}`} className={p.highlight ? "btn-primary w-full" : "btn-ghost w-full"} />
            </div>
          </div>
        ))}
        <div className="card flex flex-col p-6">
          <h3 className="text-lg font-semibold">{REFRESH_PLAN.name}</h3>
          <p className="mt-1 text-sm text-muted">Never have an outdated headshot again.</p>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="font-display text-5xl tabular-nums">{formatUsd(REFRESH_PLAN.priceCents)}</span>
            <span className="text-sm text-muted">/ year</span>
          </div>
          <ul className="mt-6 flex-1 space-y-2 text-sm">
            {REFRESH_PLAN.features.map((f) => (
              <li key={f} className="flex gap-2"><Check />{f}</li>
            ))}
            <li className="flex gap-2"><Check />Cancel anytime</li>
          </ul>
          <div className="mt-6">
            <CheckoutButton body={{ kind: "subscription" }} label="Start Always Fresh" className="btn-ghost w-full" />
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-sm text-muted">
        Outfitting a whole office? <Link href="/teams" className="font-medium text-accent underline">Brokerage team pricing</Link> starts at {formatUsd(PLANS.team.priceCents)}/agent.
        {" "}Not happy with your results? Free redos, and a full refund if none of your photos work for you.
      </p>
    </section>
  );
}
