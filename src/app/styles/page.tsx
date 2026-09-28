import type { Metadata } from "next";
import Link from "next/link";
import { STYLES } from "@/lib/styles";
import { StyleCard } from "@/components/samples";
import { getSampleUrls } from "@/lib/samples";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Realtor Headshot Styles & Backgrounds",
  description: "12 headshot styles made for real estate agents: gray or white backgrounds, brand color, front porch, outdoor, coastal, luxury and more.",
  alternates: { canonical: "/styles" },
};

export default async function StylesIndex() {
  const samples = await getSampleUrls();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <JsonLd data={breadcrumbLd([["Headshot styles", "/styles"]])} />
      <h1 className="max-w-3xl font-display text-3xl md:text-4xl">Realtor headshot styles and backgrounds</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Every order includes styles made for real estate, not corporate gray only. Keep a plain-background version for MLS and your
        brokerage, and use a lifestyle style that matches your market everywhere else.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {STYLES.map((s) => (
          <Link key={s.id} href={`/styles/${s.id}`} className="rounded-2xl transition-opacity duration-200 hover:opacity-90">
            <StyleCard style={s} src={samples[s.id]} />
          </Link>
        ))}
      </div>
      {Object.keys(samples).length ? (
        <p className="mt-6 text-xs text-muted">Examples show AI-generated fictional people in each style. Your headshots are created from your own photos.</p>
      ) : null}
    </div>
  );
}
