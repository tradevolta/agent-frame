import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamByJoinCode } from "@/lib/accounts";
import { JoinForm } from "./join-form";

export const metadata: Metadata = { title: "Join your team", robots: { index: false } };

export default async function JoinPage({ params }: PageProps<"/join/[code]">) {
  const { code } = await params;
  if (!/^[A-Z0-9]{4,12}$/i.test(code)) notFound();
  const team = await getTeamByJoinCode(code);
  if (!team || team.status !== "active") notFound();
  const left = team.seats - team.seatsUsed;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <p className="text-sm font-medium text-gold">Team invite</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">{team.name} has a headshot seat for you</h1>
        <p className="mt-2 text-sm text-muted">Enter your details to open your private studio. {left > 0 ? `${left} seat${left === 1 ? "" : "s"} left.` : "All seats are claimed, but if you already joined, use the same email to get back in."}</p>
        <JoinForm code={code} />
      </div>
    </div>
  );
}
