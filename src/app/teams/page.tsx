import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { PLANS, TEAM_MIN_SEATS, formatUsd } from "@/lib/plans";
import { STYLES, BACKDROP_COLORS } from "@/lib/styles";
import { TeamForm } from "./team-form";

export const metadata: Metadata = {
  title: "Brokerage & Team Headshots",
  description: `Matching AI headshots and brand kits for your whole brokerage. ${formatUsd(PLANS.team.priceCents)} per agent, one invite link, one invoice.`,
};

export default function TeamsPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
      <div>
        <p className="text-sm font-semibold text-accent">For brokers & team leads</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">One consistent look for your whole office</h1>
        <p className="mt-4 text-lg text-muted">
          Stop chasing agents to book the photographer. Buy seats, share one link, and every agent gets matching headshots plus their own Brand Kit, in about an hour.
        </p>
        <ul className="mt-8 space-y-3">
          {PLANS.team.features.map((f) => (
            <li key={f} className="flex gap-2"><CheckCircle size={20} weight="fill" className="shrink-0 text-ok" aria-hidden />{f}</li>
          ))}
          <li className="flex gap-2"><CheckCircle size={20} weight="fill" className="shrink-0 text-ok" aria-hidden />Invoice or receipt for your records</li>
        </ul>
        <div className="card mt-8 p-5 text-sm text-muted">
          <b className="text-ink">How it works:</b> pick a team backdrop, buy seats, and we email you an invite link and a manager dashboard. Agents claim a seat with their email and upload their own selfies privately.
        </div>
      </div>
      <div className="card h-fit p-6">
        <h2 className="text-xl font-semibold">Set up your team</h2>
        <p className="text-sm text-muted">{formatUsd(PLANS.team.priceCents)} per agent · minimum {TEAM_MIN_SEATS} seats</p>
        <TeamForm
          styles={STYLES.filter((s) => s.mlsSafe || s.id === "modern-office").map((s) => ({ id: s.id, name: s.name }))}
          colors={Object.entries(BACKDROP_COLORS).map(([id, c]) => ({ id, label: c.label, hex: c.hex }))}
          seatPrice={PLANS.team.priceCents}
          minSeats={TEAM_MIN_SEATS}
        />
      </div>
    </div>
  );
}
