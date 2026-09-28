"use client";
import { useEffect, useState } from "react";
import type { AgentProfile } from "@/lib/db/schema";
import { postJson, type PhotoView, type TemplateView } from "./types";
import { HEADLINES, PRINT_FORMATS, needsUpscale } from "@/lib/print-formats";

interface Props {
  token: string;
  photos: PhotoView[];
  templates: TemplateView[];
  initialProfile: AgentProfile;
}

const PROFILE_FIELDS: { key: keyof AgentProfile; label: string; placeholder: string }[] = [
  { key: "fullName", label: "Name", placeholder: "Jordan Ellis" },
  { key: "title", label: "Title", placeholder: "REALTOR® / Broker" },
  { key: "brokerage", label: "Brokerage (required on ads)", placeholder: "Your Brokerage Realty" },
  { key: "phone", label: "Phone", placeholder: "(919) 555-0123" },
  { key: "email", label: "Email", placeholder: "jordan@brokerage.com" },
  { key: "website", label: "Website", placeholder: "jordansellsnc.com" },
];

export function BrandKit({ token, photos, templates, initialProfile }: Props) {
  const favorites = photos.filter((p) => p.favorite);
  const choices = favorites.length ? favorites : photos;
  const [profile, setProfile] = useState<AgentProfile>({ brandColor: "#1f2a44", ...initialProfile });
  const [saved, setSaved] = useState<AgentProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tplId, setTplId] = useState(templates[0]?.id);
  const [photoId, setPhotoId] = useState(choices[0]?.id);
  const [mode, setMode] = useState<"digital" | "print">("digital");
  const [fmtId, setFmtId] = useState(PRINT_FORMATS[0].id);
  const [fields, setFields] = useState({ headline: HEADLINES[0], address: "", price: "", details: "", date: "" });
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);
  const [debounced, setDebounced] = useState(fields);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(fields), 500); // don't re-render the image on every keystroke
    return () => clearTimeout(t);
  }, [fields]);
  const tpl = templates.find((t) => t.id === tplId)!;
  const fmt = PRINT_FORMATS.find((f) => f.id === fmtId)!;
  const needs: string[] = mode === "print" ? fmt.needs : tpl.needs;
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const params = new URLSearchParams({ photo: photoId ?? "", v: String(version) });
  for (const need of needs) {
    const v = debounced[need as keyof typeof debounced];
    if (v) params.set(need, v);
  }
  const query = params.toString();
  const src = mode === "print" ? `/api/brand-kit/${token}/print/${fmt.id}?preview=1&${query}` : `/api/brand-kit/${token}/${tpl.id}?${query}`;
  const aspect = mode === "print" ? `${fmt.widthIn}/${fmt.heightIn}` : `${tpl.width}/${tpl.height}`;

  // Print PDFs can take up to a minute the first time (the headshot is upscaled
  // for large sizes), so fetch with progress instead of a bare link.
  async function downloadPdf() {
    setDownloading(true);
    setDlError(null);
    try {
      const res = await fetch(`/api/brand-kit/${token}/print/${fmt.id}?${query}`);
      if (!res.ok) throw new Error((await res.text()) || "Couldn't create the print file");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fmt.id}-${fmt.widthIn}x${fmt.heightIn}in.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setDlError((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const clean = Object.fromEntries(Object.entries(profile).filter(([, v]) => v));
      await postJson(`/api/studio/${token}/profile`, clean);
      setSaved(profile);
      setVersion((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] [&>*]:min-w-0">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-semibold">Your details</h2>
          <div className="mt-3 space-y-3">
            {PROFILE_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="label text-xs" htmlFor={f.key}>{f.label}</label>
                <input id={f.key} className="input" placeholder={f.placeholder} value={profile[f.key] ?? ""} onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="label !mb-0 text-xs" htmlFor="color">Brand color</label>
              <input id="color" type="color" value={profile.brandColor} onChange={(e) => setProfile({ ...profile, brandColor: e.target.value })} className="h-9 w-14 cursor-pointer rounded border border-line" />
            </div>
          </div>
          <button onClick={save} disabled={!dirty || saving} className="btn-primary mt-4 w-full">{saving ? "Saving…" : dirty ? "Save & update graphics" : "Saved"}</button>
          {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Listing details</h2>
          <div className="mt-3 space-y-3">
            {needs.includes("headline") ? (
              <div>
                <label className="label text-xs" htmlFor="headline">Headline</label>
                <select id="headline" className="input" value={fields.headline} onChange={(e) => setFields({ ...fields, headline: e.target.value })}>
                  {HEADLINES.map((h) => <option key={h} value={h}>{h.charAt(0) + h.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            ) : null}
            {(["address", "price", "details", "date"] as const).filter((k) => needs.includes(k)).map((k) => (
              <div key={k}>
                <label className="label text-xs capitalize" htmlFor={k}>{k === "details" ? "Highlights" : k === "date" ? "Date & time" : k}</label>
                <input
                  id={k}
                  className="input"
                  placeholder={{ address: "412 Oak Hollow Dr, Wake Forest", price: "$489,000", details: "4 bd • 3 ba • 2,450 sqft", date: "Sat, Oct 4 · 1-3 PM" }[k]}
                  value={fields[k]}
                  onChange={(e) => setFields({ ...fields, [k]: e.target.value })}
                />
              </div>
            ))}
            {needs.length === 0 ? <p className="text-sm text-muted">This design uses your details only.</p> : null}
          </div>
        </section>
      </div>

      <div className="order-first min-w-0 lg:order-none">
        <div className="mb-4 inline-flex rounded-lg border border-line bg-card p-1" role="tablist" aria-label="Brand Kit format">
          {(["digital", "print"] as const).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`min-h-10 rounded-md px-4 text-sm font-medium transition-colors duration-200 ${mode === m ? "bg-accent text-on-accent" : "text-muted hover:text-ink"}`}>
              {m === "digital" ? "Social & digital" : "Print"}
            </button>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {mode === "digital"
            ? templates.map((t) => (
                <button key={t.id} onClick={() => setTplId(t.id)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm ${t.id === tplId ? "border-accent bg-accent text-on-accent" : "border-line bg-card"}`}>
                  {t.name}
                </button>
              ))
            : PRINT_FORMATS.map((f) => (
                <button key={f.id} onClick={() => setFmtId(f.id)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm ${f.id === fmtId ? "border-accent bg-accent text-on-accent" : "border-line bg-card"}`}>
                  {f.name} <span className={f.id === fmtId ? "opacity-80" : "text-muted"}>{f.size}</span>
                </button>
              ))}
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {choices.slice(0, 20).map((p) => (
            <button key={p.id} onClick={() => setPhotoId(p.id)} className={`shrink-0 overflow-hidden rounded-md border-2 ${p.id === photoId ? "border-accent" : "border-transparent"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-16 w-12 object-cover" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">{favorites.length ? "Showing your starred favorites." : "Tip: star your favorite headshots to see them here."}</p>
        <div className="card mt-4 grid place-items-center bg-paper p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={src} src={src} alt={`${mode === "print" ? fmt.name : tpl.name} preview`} className="max-h-[640px] w-auto max-w-full rounded-lg shadow-md" style={{ aspectRatio: aspect }} />
        </div>
        {mode === "print" ? (
          <p className="mt-3 text-sm text-muted">
            {fmt.hint} Print-ready PDF: 300 DPI with a 1/8&quot; bleed. Upload it to Vistaprint, a local print shop or your brokerage&apos;s printer.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {mode === "print" ? (
            <button onClick={downloadPdf} disabled={downloading} className="btn-primary">
              {downloading ? "Preparing print file…" : `Download print PDF (${fmt.size})`}
            </button>
          ) : (
            <a href={`${src}&download=1`} className="btn-primary">Download PNG</a>
          )}
          {dirty ? <span className="text-sm text-muted">Save your details to update the design.</span> : null}
          {downloading && needsUpscale(fmt) ? <span className="text-sm text-muted">Sharpening your headshot for print, up to a minute the first time.</span> : null}
        </div>
        {dlError ? <p className="mt-2 text-sm text-bad">{dlError}</p> : null}
      </div>
    </div>
  );
}
