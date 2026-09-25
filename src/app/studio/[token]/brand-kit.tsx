"use client";
import { useEffect, useMemo, useState } from "react";
import type { AgentProfile } from "@/lib/db/schema";
import { postJson, type PhotoView, type TemplateView } from "./types";

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
  const [fields, setFields] = useState({ address: "", price: "", details: "", date: "" });
  const [debounced, setDebounced] = useState(fields);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(fields), 500); // don't re-render the image on every keystroke
    return () => clearTimeout(t);
  }, [fields]);
  const tpl = templates.find((t) => t.id === tplId)!;
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const src = useMemo(() => {
    const q = new URLSearchParams({ photo: photoId ?? "", v: String(version) });
    for (const need of tpl.needs) {
      const v = debounced[need as keyof typeof debounced];
      if (v) q.set(need, v);
    }
    return `/api/brand-kit/${token}/${tpl.id}?${q}`;
  }, [token, tpl, photoId, debounced, version]);

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
            {(["address", "price", "details", "date"] as const).filter((k) => tpl.needs.includes(k)).map((k) => (
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
            {tpl.needs.length === 0 ? <p className="text-sm text-muted">This graphic uses your details only.</p> : null}
          </div>
        </section>
      </div>

      <div className="order-first min-w-0 lg:order-none">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {templates.map((t) => (
            <button key={t.id} onClick={() => setTplId(t.id)} className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm ${t.id === tplId ? "border-accent bg-accent text-on-accent" : "border-line bg-card"}`}>
              {t.name}
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
          <img key={src} src={src} alt={`${tpl.name} preview`} className="max-h-[640px] w-auto rounded-lg shadow-md" style={{ aspectRatio: `${tpl.width}/${tpl.height}` }} />
        </div>
        <div className="mt-4 flex gap-2">
          <a href={`${src}&download=1`} className="btn-primary">Download PNG</a>
          {dirty ? <span className="self-center text-sm text-muted">Save your details to update the graphic.</span> : null}
        </div>
      </div>
    </div>
  );
}
