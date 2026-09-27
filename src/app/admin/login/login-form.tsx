"use client";
import { useState } from "react";

export function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      window.location.assign(next); // full navigation so the proxy sees the new cookie
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Login failed");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="pw" className="label">Password</label>
        <input id="pw" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
      {error ? <p role="alert" className="text-sm text-bad">{error}</p> : null}
    </form>
  );
}
