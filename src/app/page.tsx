import Link from "next/link";
import { STYLES } from "@/lib/styles";
import { brand } from "@/lib/brand";
import { PLANS, formatUsd } from "@/lib/plans";
import { StyleCard } from "@/components/samples";
import { Pricing } from "@/components/pricing";
import { Faq, faqJsonLd } from "@/components/faq";
import { BrandKitPreview } from "@/components/brandkit-preview";
import { NewsletterForm } from "@/components/newsletter-form";

export default function Home() {
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brand.name} AI Realtor Headshots`,
    description: "AI headshots and marketing brand kit for real estate agents.",
    brand: { "@type": "Brand", name: brand.name },
    offers: [PLANS.starter, PLANS.pro].map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: (p.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([productLd, faqJsonLd()]) }} />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 md:grid-cols-2 md:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Built for real estate agents
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Realtor headshots that look like <em className="text-gold not-italic">you</em>. Ready in an hour.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Upload a few selfies. Get studio-quality headshots in 12 real-estate styles, plus ready-to-post Just Listed, Open House and Sold graphics with your brokerage name built in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#pricing" className="btn-primary">Get my headshots from {formatUsd(PLANS.starter.priceCents)}</Link>
            <Link href="/free-just-listed" className="btn-ghost">Try the free Just Listed maker</Link>
          </div>
          <ul className="mt-8 grid max-w-md grid-cols-2 gap-2 text-sm text-muted">
            <li>✓ No photographer or scheduling</li>
            <li>✓ Free redos</li>
            <li>✓ MLS-safe backgrounds</li>
            <li>✓ Selfies deleted after 7 days</li>
          </ul>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STYLES.slice(0, 6).map((s, i) => (
            <div key={s.id} className={i % 2 ? "translate-y-6" : ""}>
              <StyleCard style={s} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {[
            ["1", "Upload 10–20 selfies", "Any recent phone photos. We'll show you exactly what works. About 10 minutes."],
            ["2", "We train your private model", "Our AI learns your face, then photographs you in realtor-specific settings. About an hour."],
            ["3", "Download & post", "Pick favorites, download full resolution, and generate your Brand Kit graphics in one click."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-navy font-semibold text-white">{n}</div>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Styles */}
      <section id="styles" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold">12 styles made for real estate</h2>
          <p className="mt-3 text-muted">Generic AI headshot apps give you corporate gray. You sell homes, so your photos should show front porches, open houses and the market you work in.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {STYLES.map((s) => (
            <StyleCard key={s.id} style={s} />
          ))}
        </div>
      </section>

      {/* Brand kit */}
      <section id="brand-kit" className="scroll-mt-20 bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">The part other headshot apps skip</span>
            <h2 className="mt-3 font-display text-4xl font-semibold">Your headshot, turned into a marketing kit</h2>
            <p className="mt-4 text-white/75">
              A headshot is a photo. A brand is what people remember. Agent Pro includes ready-to-post graphics with your new photo, brand color and contact details. Your brokerage name is always included, as NC advertising rules require.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>• Just Listed, Open House, Under Contract, Just Sold, Coming Soon</li>
              <li>• Business card, email signature, LinkedIn/Facebook cover</li>
              <li>• Change the address and price, then download in one click</li>
            </ul>
          </div>
          <BrandKitPreview />
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="text-center font-display text-4xl font-semibold">How we compare</h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-paper text-left">
              <tr>
                <th className="p-4"></th>
                <th className="p-4 text-navy">{brand.name}</th>
                <th className="p-4">Photographer</th>
                <th className="p-4">Generic AI apps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Typical price", `${formatUsd(PLANS.starter.priceCents)}–${formatUsd(PLANS.pro.priceCents)}`, "$200–$500+", "$29–$75"],
                ["Turnaround", "~1 hour", "1–2 weeks", "1–3 hours"],
                ["Real estate styles", "12", "1–3 looks", "Corporate"],
                ["Listing & social graphics", "Included", "No", "No"],
                ["Brokerage name on graphics", "Automatic", "—", "—"],
                ["Team / brokerage ordering", "Yes", "Group sessions", "Some"],
              ].map(([k, a, b, c]) => (
                <tr key={k}>
                  <td className="p-4 font-medium">{k}</td>
                  <td className="p-4 font-semibold text-navy">{a}</td>
                  <td className="p-4 text-muted">{b}</td>
                  <td className="p-4 text-muted">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Pricing />

      {/* Teams */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">Brokers: matching headshots for your whole office</h2>
            <p className="mt-2 max-w-xl text-muted">One invite link, one invoice, one consistent team look. {formatUsd(PLANS.team.priceCents)}/agent, 5-seat minimum.</p>
          </div>
          <Link href="/teams" className="btn-primary">See team pricing</Link>
        </div>
      </section>

      <Faq />

      <section className="mx-auto max-w-xl px-4 text-center">
        <h2 className="font-display text-2xl font-semibold">Not ready yet?</h2>
        <p className="mt-2 text-sm text-muted">Get our monthly realtor marketing tips: post ideas, template drops and headshot advice. No spam.</p>
        <div className="mt-4"><NewsletterForm source="homepage" /></div>
      </section>
    </>
  );
}
