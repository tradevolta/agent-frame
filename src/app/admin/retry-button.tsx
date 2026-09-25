"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetryButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <span className="inline-flex items-center gap-2">
    <button
      className="btn-ghost !px-3 !py-1 text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
        setError(res.ok ? null : ((await res.json().catch(() => ({}))).error ?? "Retry failed"));
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "Retrying…" : "Retry"}
    </button>
    {error ? <span className="text-xs text-bad">{error}</span> : null}
    </span>
  );
}
