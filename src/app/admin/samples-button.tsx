"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Result = { style: string; ok: boolean; error?: string };

export function SamplesButton({ have, total }: { have: number; total: number }) {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run(mode: "missing" | "all") {
    if (mode === "all" && !window.confirm("Replace all sample photos? This generates every style again (about $0.06 each).")) return;
    setBusy(true);
    setError(null);
    setResults(null);
    const res = await fetch("/api/admin/samples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }) });
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
        (about $0.06 each, 1-3 minutes). Only missing styles are generated unless you choose Regenerate all.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {have < total ? (
          <button className="btn-primary" onClick={() => run("missing")} disabled={busy}>
            {busy ? "Generating, keep this tab open…" : have ? `Generate the ${total - have} missing` : "Generate sample photos"}
          </button>
        ) : null}
        {have > 0 ? (
          <button className={have < total ? "btn-ghost" : "btn-primary"} onClick={() => run("all")} disabled={busy}>
            {busy && have >= total ? "Generating, keep this tab open…" : "Regenerate all"}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
      {results ? (
        <p className="mt-3 text-sm">
          {results.length - failed.length} generated.
          {failed.length ? (
            // Every style usually fails for the same reason: show it once.
            <span className="text-bad">
              {" "}{failed.length} failed.{" "}
              {[...new Set(failed.map((f) => f.error))].slice(0, 3).join(" / ")}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
