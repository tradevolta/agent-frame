"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinForm({ code }: { code: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/join/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/studio/${data.token}`);
    else {
      setError(data.error || "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="label" htmlFor="n">Full name</label>
        <input id="n" className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="e">Email</label>
        <input id="e" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Opening…" : "Open my studio"}</button>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
    </form>
  );
}
