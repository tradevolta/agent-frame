import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/content/cities";
import { getStyle, type HeadshotStyle } from "@/lib/styles";
import { PLANS, formatUsd } from "@/lib/plans";
import { StyleCard } from "@/components/samples";
import { Pricing } from "@/components/pricing";
import { Faq } from "@/components/faq";
import { getSampleUrls } from "@/lib/samples";
import { appUrl } from "@/lib/brand";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}
export const dynamicParams = false;
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<"/realtor-headshots/[city]">): Promise<Metadata> {
  const city = getCity((await params).city);
  if (!city) return {};
  return {
    title: `AI Realtor Headshots in ${city.name}, ${city.stateCode}`,
    description: `Headshots for ${city.name}, ${city.stateCode} real estate agents without a photographer: 12 realtor styles plus listing graphics, from ${formatUsd(PLANS.starter.priceCents)}.`,
    alternates: { canonical: `/realtor-headshots/${city.slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/realtor-headshots/[city]">) {
  const city = getCity((await params).city);
  if (!city) notFound();
  const styles = city.styles.map(getStyle).filter((s): s is HeadshotStyle => !!s);
  const samples = await getSampleUrls();
  const nearby = (city.nearby ?? []).map(getCity).filter((c) => !!c);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `AI realtor headshots in ${city.name}, ${city.stateCode}`,
    serviceType: "AI headshot photography",
    description: city.blurb,
    provider: { "@id": appUrl("/#organization") },
    areaServed: { "@type": "City", name: city.name, containedInPlace: { "@type": "State", name: city.state } },
    url: appUrl(`/realtor-headshots/${city.slug}`),
    offers: { "@type": "Offer", price: (PLANS.starter.priceCents / 100).toFixed(2), priceCurrency: "USD", url: appUrl("/#pricing") },
  };

  return (
    <>
      <JsonLd data={[serviceLd, breadcrumbLd([["Headshots by city", "/realtor-headshots"], [city.name, `/realtor-headshots/${city.slug}`]])]} />
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14">
        <nav className="text-xs text-muted"><Link href="/realtor-headshots" className="inline-block py-3">Headshots by city</Link> / {city.name}</nav>
        <h1 className="mt-3 max-w-3xl font-display text-4xl md:text-5xl leading-tight">Realtor headshots for {city.name}, {city.stateCode} agents</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{city.blurb}</p>
        <p className="mt-2 max-w-2xl text-muted">Skip the studio booking. Upload a few selfies and get realistic headshots plus ready-to-post listing graphics in about an hour, from {formatUsd(PLANS.starter.priceCents)}.</p>
        <div className="mt-6 flex gap-3">
          <Link href="#pricing" className="btn-primary">See pricing</Link>
          <Link href="/free-just-listed" className="btn-ghost">Free Just Listed maker</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-display text-2xl">Popular styles with {city.name} agents</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {styles.map((s) => (
            <Link key={s.id} href={`/styles/${s.id}`} className="rounded-2xl transition-opacity duration-200 hover:opacity-90">
              <StyleCard style={s} src={samples[s.id]} />
            </Link>
          ))}
        </div>
      </section>
      <Pricing />
      <Faq />
      {nearby.length ? (
        <section className="mx-auto max-w-4xl px-4 text-sm text-muted">
          Also serving agents in{" "}
          {nearby.map((c, i) => (
            <span key={c!.slug}>
              <Link href={`/realtor-headshots/${c!.slug}`} className="text-accent underline">{c!.name}</Link>
              {i < nearby.length - 1 ? ", " : "."}
            </span>
          ))}
        </section>
      ) : null}
    </>
  );
}
