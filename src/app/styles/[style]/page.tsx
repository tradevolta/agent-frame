import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { STYLES, getStyle } from "@/lib/styles";
import { STYLE_GUIDES, getStyleGuide } from "@/content/style-guides";
import { CITIES } from "@/content/cities";
import { PLANS, formatUsd } from "@/lib/plans";
import { appUrl } from "@/lib/brand";
import { StyleCard } from "@/components/samples";
import { Pricing } from "@/components/pricing";
import { getSampleUrls } from "@/lib/samples";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export function generateStaticParams() {
  return STYLE_GUIDES.map((g) => ({ style: g.id }));
}
export const dynamicParams = false;
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/styles/[style]">): Promise<Metadata> {
  const guide = getStyleGuide((await params).style);
  if (!guide) return {};
  return {
    title: guide.title,
    description: `${guide.intro.split(". ")[0]}. AI headshots in this style from ${formatUsd(PLANS.starter.priceCents)}, ready in about an hour.`.slice(0, 158),
    alternates: { canonical: `/styles/${guide.id}` },
  };
}

export default async function StylePage({ params }: PageProps<"/styles/[style]">) {
  const guide = getStyleGuide((await params).style);
  const style = guide && getStyle(guide.id);
  if (!guide || !style) notFound();
  const samples = await getSampleUrls();
  const cities = CITIES.filter((c) => c.styles.includes(style.id)).slice(0, 8);
  const others = STYLES.filter((s) => s.id !== style.id).slice(0, 4);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${style.name} AI headshots for real estate agents`,
    serviceType: "AI headshot photography",
    description: guide.intro,
    provider: { "@id": appUrl("/#organization") },
    areaServed: "US",
    url: appUrl(`/styles/${style.id}`),
    offers: { "@type": "Offer", price: (PLANS.starter.priceCents / 100).toFixed(2), priceCurrency: "USD", url: appUrl("/#pricing") },
    ...(samples[style.id] ? { image: samples[style.id] } : {}),
  };

  return (
    <>
      <JsonLd data={[serviceLd, breadcrumbLd([["Headshot styles", "/styles"], [style.name, `/styles/${style.id}`]])]} />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-14 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div>
          <nav className="text-xs text-muted">
            <Link href="/styles" className="inline-block py-3">Headshot styles</Link> / {style.name}
          </nav>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{guide.h1}</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">{guide.intro}</p>
          {style.mlsSafe ? <p className="mt-3 text-sm font-medium text-accent">MLS-safe: a plain background most brokerages accept.</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#pricing" className="btn-primary">Get headshots from {formatUsd(PLANS.starter.priceCents)}</Link>
            <Link href="/styles" className="btn-ghost">See all 12 styles</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-xs md:max-w-sm">
          <StyleCard style={style} src={samples[style.id]} />
          {samples[style.id] ? <p className="mt-2 text-xs text-muted">AI-generated example of a fictional agent. Yours is made from your own photos.</p> : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Best for</h2>
          <List items={guide.bestFor} />
        </div>
        <div>
          <h2 className="font-display text-2xl">What to wear</h2>
          <List items={guide.wear} />
        </div>
        <div>
          <h2 className="font-display text-2xl">Where to use it</h2>
          <p className="mt-3 max-w-[60ch] text-muted">{guide.useFor}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl">Tip</h2>
          <p className="mt-3 max-w-[60ch] text-muted">{guide.tip}</p>
        </div>
      </section>

      <Pricing />

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <h2 className="font-display text-2xl">Other styles agents pair with {style.name}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {others.map((s) => (
            <Link key={s.id} href={`/styles/${s.id}`} className="rounded-2xl transition-opacity duration-200 hover:opacity-90">
              <StyleCard style={s} src={samples[s.id]} />
            </Link>
          ))}
        </div>
        {cities.length ? (
          <p className="mt-8 text-sm text-muted">
            Popular with agents in{" "}
            {cities.map((c, i) => (
              <span key={c.slug}>
                <Link href={`/realtor-headshots/${c.slug}`} className="text-accent underline">{c.name}, {c.stateCode}</Link>
                {i < cities.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          Choosing between styles? Read <Link href="/blog/best-background-for-real-estate-headshots" className="text-accent underline">the best backgrounds for real estate headshots</Link>.
        </p>
      </section>
    </>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-muted">
          <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-ok" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}
