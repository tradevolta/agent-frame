import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/content/cities";

export const metadata: Metadata = {
  title: "Realtor Headshots by City",
  description: "AI realtor headshots and brand kits for agents across North Carolina and the Southeast.",
};

export default function CitiesIndex() {
  const byState = Object.groupBy(CITIES, (c) => c.state);
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl md:text-4xl">Realtor headshots by city</h1>
      {Object.entries(byState).map(([state, cities]) => (
        <section key={state} className="mt-8">
          <h2 className="text-lg font-semibold">{state}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cities!.map((c) => (
              <Link key={c.slug} href={`/realtor-headshots/${c.slug}`} className="card p-3 text-sm hover:border-accent">
                {c.name} realtor headshots
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
