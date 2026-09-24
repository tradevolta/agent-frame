"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetryButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      className="btn-ghost !px-3 !py-1 text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
        if (!res.ok) alert((await res.json().catch(() => ({}))).error ?? "Retry failed");
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "…" : "Retry"}
    </button>
  );
}
