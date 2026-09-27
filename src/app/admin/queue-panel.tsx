"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Summary {
  queuedOrders: number;
  failedOrders: number;
  queuedJobs: number;
  failedJobs: number;
  nextAttemptAt: string | null;
  lastError: string | null;
}

export function QueuePanel({ summary }: { summary: Summary }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function act(action: "run" | "retry_failed") {
    setBusy(action);
    setMessage(null);
    const res = await fetch("/api/admin/queue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setMessage(data.error ?? "Something went wrong");
    else if (action === "run") setMessage(`Submitted ${data.orders} training(s) and ${data.jobs} photo batch(es).`);
    else setMessage(`Retried ${data.retried} failed order(s).`);
    setBusy(null);
    router.refresh();
  }

  const waiting = summary.queuedOrders + summary.queuedJobs;
  return (
    <div className="card p-5">
      <h2 className="font-semibold">Retry queue</h2>
      <p className="mt-1 text-sm text-muted">
        When fal.ai refuses a request (balance, outage, rate limit) the order waits here and retries automatically, from 2 minutes
        up to every 12 hours, for about 40 hours. Customers see &ldquo;in line&rdquo;, not an error.
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Item label="Orders waiting" value={summary.queuedOrders} />
        <Item label="Photo batches waiting" value={summary.queuedJobs} />
        <Item label="Failed orders" value={summary.failedOrders} bad />
        <Item label="Failed batches" value={summary.failedJobs} bad />
      </dl>
      {waiting > 0 && summary.nextAttemptAt ? (
        <p className="mt-3 text-sm">Next automatic try: {new Date(summary.nextAttemptAt).toLocaleString()}</p>
      ) : null}
      {waiting > 0 && summary.lastError ? <p className="mt-1 break-words text-xs text-bad">Last error: {summary.lastError}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" disabled={!!busy || waiting === 0} onClick={() => act("run")}>
          {busy === "run" ? "Running…" : "Run queue now"}
        </button>
        <button className="btn-ghost" disabled={!!busy || summary.failedOrders === 0} onClick={() => act("retry_failed")}>
          {busy === "retry_failed" ? "Retrying…" : `Retry all failed orders${summary.failedOrders ? ` (${summary.failedOrders})` : ""}`}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </div>
  );
}

function Item({ label, value, bad }: { label: string; value: number; bad?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`text-lg font-semibold ${bad && value ? "text-bad" : ""}`}>{value}</dd>
    </div>
  );
}
