"use client";
import { useState } from "react";
import { CheckoutButton } from "@/components/checkout-button";
import { formatUsd } from "@/lib/plans";

interface Props {
  styles: { id: string; name: string }[];
  colors: { id: string; label: string; hex: string }[];
  seatPrice: number;
  minSeats: number;
}

export function TeamForm({ styles, colors, seatPrice, minSeats }: Props) {
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [seats, setSeats] = useState(minSeats);
  const [teamStyle, setTeamStyle] = useState(styles[0]?.id ?? "");
  const [backdropColor, setBackdropColor] = useState("navy");
  const valid = teamName.trim().length > 1 && /.+@.+\..+/.test(email) && seats >= minSeats;

  return (
    <div className="mt-5 space-y-4">
      <div>
        <label className="label" htmlFor="tn">Brokerage or team name</label>
        <input id="tn" className="input" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Triangle Home Group" />
      </div>
      <div>
        <label className="label" htmlFor="em">Your email (manager)</label>
        <input id="em" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="broker@brokerage.com" />
      </div>
      <div>
        <label className="label" htmlFor="seats">Number of agents</label>
        <input id="seats" type="number" min={minSeats} className="input" value={seats} onChange={(e) => setSeats(Math.max(0, Number(e.target.value)))} />
      </div>
      <div>
        <label className="label" htmlFor="ts">Matching team style</label>
        <select id="ts" className="input" value={teamStyle} onChange={(e) => setTeamStyle(e.target.value)}>
          {styles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {teamStyle === "brand-backdrop" ? (
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button key={c.id} type="button" onClick={() => setBackdropColor(c.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${backdropColor === c.id ? "border-navy" : "border-line"}`}>
              <span className="h-4 w-4 rounded-full" style={{ background: c.hex }} />{c.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-muted">Total</span>
        <span className="font-display text-3xl font-semibold">{formatUsd(seatPrice * Math.max(seats, 0))}</span>
      </div>
      {valid ? (
        <CheckoutButton body={{ kind: "team", teamName, email, seats, teamStyle, backdropColor }} label="Continue to secure checkout" />
      ) : (
        <button className="btn-primary w-full" disabled>Fill in the details above</button>
      )}
    </div>
  );
}
