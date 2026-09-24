import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCity } from "@/content/cities";
import { getStyle, type HeadshotStyle } from "@/lib/styles";
import { PLANS, formatUsd } from "@/lib/plans";
import { StyleCard } from "@/components/samples";
import { Pricing } from "@/components/pricing";
import { Faq } from "@/components/faq";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/realtor-headshots/[city]">): Promise<Metadata> {
  const city = getCity((await params).city);
  if (!city) return {};
  return {
    title: `Realtor Headshots in ${city.name}, ${city.stateCode}: AI Headshots from ${formatUsd(PLANS.starter.priceCents)}`,
    description: `Professional real estate agent headshots for ${city.name}, ${city.stateCode} agents, with no photographer needed. 12 realtor styles plus Just Listed & Open House graphics. Ready in about an hour.`,
    alternates: { canonical: `/realtor-headshots/${city.slug}` },
  };
}

export default async function CityPage({ params }: PageProps<"/realtor-headshots/[city]">) {
  const city = getCity((await params).city);
  if (!city) notFound();
  const styles = city.styles.map(getStyle).filter((s): s is HeadshotStyle => !!s);
  const nearby = (city.nearby ?? []).map(getCity).filter((c) => !!c);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14">
        <nav className="text-xs text-muted"><Link href="/realtor-headshots">Headshots by city</Link> / {city.name}</nav>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight">Realtor headshots for {city.name}, {city.stateCode} agents</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{city.blurb}</p>
        <p className="mt-2 max-w-2xl text-muted">Skip the studio booking. Upload a few selfies and get realistic headshots plus ready-to-post listing graphics in about an hour, from {formatUsd(PLANS.starter.priceCents)}.</p>
        <div className="mt-6 flex gap-3">
          <Link href="#pricing" className="btn-primary">See pricing</Link>
          <Link href="/free-just-listed" className="btn-ghost">Free Just Listed maker</Link>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="font-display text-2xl font-semibold">Popular styles with {city.name} agents</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {styles.map((s) => <StyleCard key={s.id} style={s} />)}
        </div>
      </section>
      <Pricing />
      <Faq />
      {nearby.length ? (
        <section className="mx-auto max-w-4xl px-4 text-sm text-muted">
          Also serving agents in{" "}
          {nearby.map((c, i) => (
            <span key={c!.slug}>
              <Link href={`/realtor-headshots/${c!.slug}`} className="text-navy underline">{c!.name}</Link>
              {i < nearby.length - 1 ? ", " : "."}
            </span>
          ))}
        </section>
      ) : null}
    </>
  );
}
