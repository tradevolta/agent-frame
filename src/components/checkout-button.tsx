"use client";
import { useState } from "react";
import { readRef } from "./ref-capture";

type Props = {
  body: Record<string, unknown>;
  label: string;
  className?: string;
};

export function CheckoutButton({ body, label, className = "btn-primary w-full" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, ref: body.kind === "order" ? readRef() : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={go} disabled={busy} className={className}>
        {busy ? "Opening secure checkout…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
