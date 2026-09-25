"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Result = { style: string; ok: boolean; error?: string };

export function SamplesButton({ have, total }: { have: number; total: number }) {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run() {
    setBusy(true);
    setError(null);
    setResults(null);
    const res = await fetch("/api/admin/samples", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setResults(data.results);
    else setError(data.error ?? "Generation failed");
    setBusy(false);
    router.refresh();
  }

  const failed = results?.filter((r) => !r.ok) ?? [];
  return (
    <div className="card p-5">
      <h2 className="font-semibold">Style sample photos</h2>
      <p className="mt-1 text-sm text-muted">
        {have}/{total} styles have a sample. Generates one AI photo of a fictional agent per style with fal.ai
        (about $0.06 each, 1-2 minutes). Running it again replaces them.
      </p>
      <button className="btn-primary mt-4" onClick={run} disabled={busy}>
        {busy ? "Generating, keep this tab open…" : have ? "Regenerate sample photos" : "Generate sample photos"}
      </button>
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
      {results ? (
        <p className="mt-3 text-sm">
          {results.length - failed.length} generated.
          {failed.length ? <span className="text-bad"> Failed: {failed.map((f) => `${f.style} (${f.error})`).join(", ")}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
