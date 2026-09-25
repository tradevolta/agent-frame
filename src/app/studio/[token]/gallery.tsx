"use client";
import { Star } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { postJson, type PhotoView, type StatusView, type StyleView } from "./types";

interface Props {
  token: string;
  view: StatusView;
  styles: StyleView[];
  chosenStyles: string[];
  onChange: () => void;
  setView: (fn: (v: StatusView) => StatusView) => void;
}

export function Gallery({ token, view, styles, chosenStyles, onChange, setView }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<PhotoView | null>(null);
  const [redoing, setRedoing] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const name = (id: string) => styles.find((s) => s.id === id)?.name ?? id;

  const shown = useMemo(
    () => view.photos.filter((p) => (filter === "all" ? true : filter === "favorites" ? p.favorite : p.style === filter)),
    [view.photos, filter],
  );
  const favCount = view.photos.filter((p) => p.favorite).length;

  async function toggleFav(p: PhotoView) {
    setView((v) => ({ ...v, photos: v.photos.map((x) => (x.id === p.id ? { ...x, favorite: !x.favorite } : x)) }));
    await postJson(`/api/studio/${token}/favorite`, { photoId: p.id, favorite: !p.favorite }).catch(onChange);
  }

  async function redo(style: string) {
    setRedoing(style);
    setMsg(null);
    try {
      await postJson(`/api/studio/${token}/redo`, { style });
      setMsg(`New ${name(style)} photos are on the way. They'll appear here in a few minutes.`);
      onChange();
      setTimeout(onChange, 60_000);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setRedoing(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {["all", "favorites", ...chosenStyles].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 ${filter === f ? "border-accent bg-accent text-on-accent" : "border-line bg-card"}`}>
              {f === "all" ? `All (${view.photos.length})` : f === "favorites" ? `Favorites (${favCount})` : name(f)}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <a href={`/api/studio/${token}/download`} className="btn-primary !py-2">Download all</a>
          {favCount > 0 ? <a href={`/api/studio/${token}/download?favorites=1`} className="btn-ghost !py-2">Download favorites</a> : null}
        </div>
      </div>

      {msg ? <p className="mt-4 rounded-lg bg-accent-soft p-3 text-sm">{msg}</p> : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-xl bg-line">
            <button onClick={() => setLightbox(p)} className="block w-full" aria-label="View larger">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`${name(p.style)} headshot`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            </button>
            <button
              onClick={() => toggleFav(p)}
              className={`absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full text-lg ${p.favorite ? "bg-accent text-on-accent" : "bg-white/85 text-ink"}`}
              aria-label={p.favorite ? "Remove favorite" : "Add favorite"}
            >
              <Star size={16} weight={p.favorite ? "fill" : "regular"} aria-hidden />
            </button>
          </div>
        ))}
      </div>

      {filter !== "all" && filter !== "favorites" ? (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>Not loving these {name(filter)} shots? Get a fresh batch. {view.redosRemaining} free redo{view.redosRemaining === 1 ? "" : "s"} left.</span>
          <button className="btn-ghost !py-2" disabled={view.redosRemaining < 1 || redoing === filter} onClick={() => redo(filter)}>
            {redoing === filter ? "Starting…" : "Redo this style"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Tip: filter by a style to redo it. You have {view.redosRemaining} free redo{view.redosRemaining === 1 ? "" : "s"}. Tap the star to mark the ones that really look like you.</p>
      )}

      {lightbox ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.url} alt="" className="max-h-[85vh] rounded-xl" />
          <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <a href={lightbox.url} download target="_blank" rel="noreferrer" className="btn-ghost !py-2">Open full size</a>
            <button className="btn-ghost !py-2" onClick={() => setLightbox(null)}>Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
