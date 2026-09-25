"use client";
import { useState } from "react";

export function NewsletterForm({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setState("done");
    else {
      setState("error");
      setMsg(data.error || "Please try again.");
    }
  }

  if (state === "done") return <p className="text-sm font-medium text-ok">You&apos;re in. Watch your inbox.</p>;
  return (
    <form onSubmit={submit} noValidate={false}>
      <label htmlFor={`nl-${source}`} className="label">Email</label>
      <div className="flex gap-2">
        <input id={`nl-${source}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brokerage.com" className="input" aria-invalid={state === "error"} aria-describedby={state === "error" ? `nl-${source}-err` : undefined} />
        <button className="btn-primary shrink-0" disabled={state === "busy"}>{state === "busy" ? "Subscribing…" : "Subscribe"}</button>
      </div>
      {state === "error" ? <p id={`nl-${source}-err`} className="mt-2 text-sm text-bad">{msg}</p> : null}
    </form>
  );
}
