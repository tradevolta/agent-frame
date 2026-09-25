import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamByToken, teamMembers } from "@/lib/accounts";
import { reconcileTeam } from "@/lib/payments";
import { appUrl } from "@/lib/brand";
import { isToken } from "@/lib/tokens";
import { getStyle } from "@/lib/styles";
import { CopyField } from "@/components/copy-field";
import { AutoRefresh } from "@/components/auto-refresh";

export const metadata: Metadata = { title: "Team dashboard", robots: { index: false } };

const LABEL: Record<string, string> = {
  awaiting_upload: "Needs to upload",
  training: "Processing",
  generating: "Processing",
  completed: "Done",
  failed: "Issue: we're on it",
};

export default async function TeamDashboard({ params }: PageProps<"/team/[token]">) {
  const { token } = await params;
  if (!isToken(token)) notFound();
  let team = await getTeamByToken(token);
  if (!team) notFound();
  if (team.status === "pending_payment") {
    await reconcileTeam(team);
    team = (await getTeamByToken(token)) ?? team;
  }
  const members = await teamMembers(team.id);
  const done = members.filter((m) => m.status === "completed").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {team.status === "pending_payment" ? <AutoRefresh ms={3000} /> : null}
      <p className="text-sm font-medium text-accent">Manager dashboard</p>
      <h1 className="font-display text-3xl md:text-4xl">{team.name}</h1>
      {team.status === "pending_payment" ? (
        <div className="card mt-6 p-6">Confirming your payment… this page refreshes automatically.</div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Seats" value={`${team.seatsUsed}/${team.seats} claimed`} />
            <Stat label="Finished" value={`${done} agents`} />
            <Stat label="Team style" value={getStyle(team.teamStyle ?? "")?.name ?? "Agent's choice"} />
          </div>
          <div className="card mt-6 p-6">
            <h2 className="font-semibold">Invite link for your agents</h2>
            <p className="mb-3 text-sm text-muted">Share in your team chat or email. Each agent claims one seat with their email.</p>
            <CopyField value={appUrl(`/join/${team.joinCode}`)} />
          </div>
          <div className="card mt-6 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left"><tr><th className="p-3">Agent</th><th className="p-3">Email</th><th className="p-3">Status</th></tr></thead>
              <tbody className="divide-y divide-line">
                {members.length === 0 ? (
                  <tr><td className="p-4 text-muted" colSpan={3}>No agents have joined yet.</td></tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id}><td className="p-3">{m.name ?? "-"}</td><td className="p-3 text-muted">{m.email}</td><td className="p-3">{LABEL[m.status] ?? m.status}</td></tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">Need more seats? Start another team order with the same name, or email us and we&apos;ll add them.</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
