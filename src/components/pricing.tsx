import Link from "next/link";
import { CheckoutButton } from "./checkout-button";
import { PLANS, REFRESH_PLAN, formatUsd } from "@/lib/plans";

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-ok" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
    </svg>
  );
}

export function Pricing() {
  const plans = [PLANS.starter, PLANS.pro];
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-semibold">Simple, one-time pricing</h2>
        <p className="mt-3 text-muted">A local photographer typically charges a few hundred dollars and a week of scheduling. You&apos;ll have yours today.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`card flex flex-col p-6 ${p.highlight ? "border-2 border-navy shadow-lg" : ""}`}>
            {p.highlight ? <span className="mb-3 w-fit rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold">Most popular</span> : null}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted">{p.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold">{formatUsd(p.priceCents)}</span>
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
            <span className="font-display text-5xl font-semibold">{formatUsd(REFRESH_PLAN.priceCents)}</span>
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
      <p className="mt-6 text-center text-sm text-muted">
        Outfitting a whole office? <Link href="/teams" className="font-medium text-navy underline">Brokerage team pricing</Link> starts at {formatUsd(PLANS.team.priceCents)}/agent.
        {" "}Not happy with your results? Free redos, and a full refund if none of your photos work for you.
      </p>
    </section>
  );
}
