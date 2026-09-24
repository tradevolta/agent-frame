"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartShootButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    const res = await fetch(`/api/account/${token}/shoot`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push(`/studio/${data.token}`);
    else {
      setError(data.error || "Something went wrong");
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="btn-gold w-full" onClick={go} disabled={busy}>{busy ? "Starting…" : "Start my new shoot"}</button>
      {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
