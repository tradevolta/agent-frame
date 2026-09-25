"use client";
import { CheckCircle, Circle, X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { api, postJson, type StyleView } from "./types";

interface Props {
  token: string;
  initialUploads: { id: string; url: string }[];
  plan: { name: string; styleCount: number };
  isTeam: boolean;
  styles: StyleView[];
  colors: { id: string; label: string; hex: string }[];
  minUploads: number;
  maxUploads: number;
  onSubmitted: () => void;
}

/** Downscale to max 1024px JPEG in the browser: faster uploads, well under body limits. */
async function resize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(`Couldn't read ${file.name}. Try a JPG or PNG.`);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Resize failed"))), "image/jpeg", 0.9));
}

export function UploadStep(props: Props) {
  const [uploads, setUploads] = useState(props.initialUploads);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<"woman" | "man" | "person" | "">("");
  const [attire, setAttire] = useState<"formal" | "business_casual" | "style_default">("style_default");
  const [color, setColor] = useState("navy");
  const pickAll = props.plan.styleCount >= props.styles.length;
  const [picked, setPicked] = useState<string[]>(pickAll ? props.styles.map((s) => s.id) : []);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const room = props.maxUploads - uploads.length - pending;
    const list = Array.from(files).slice(0, Math.max(room, 0));
    if (list.length < files.length) setError(`Only ${props.maxUploads} photos are allowed; extras were skipped.`);
    setPending((p) => p + list.length);
    // Three uploads at a time.
    const queue = [...list];
    await Promise.all(
      Array.from({ length: 3 }, async () => {
        while (queue.length) {
          const file = queue.shift()!;
          try {
            const blob = await resize(file);
            const fd = new FormData();
            fd.append("file", blob, "photo.jpg");
            const row = await api<{ id: string; url: string }>(`/api/studio/${props.token}/uploads`, { method: "POST", body: fd });
            setUploads((u) => [...u, row]);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setPending((p) => p - 1);
          }
        }
      }),
    );
  }

  async function remove(id: string) {
    setUploads((u) => u.filter((x) => x.id !== id));
    await api(`/api/studio/${props.token}/uploads?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  function toggle(id: string) {
    if (pickAll) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= props.plan.styleCount ? p : [...p, id]));
  }

  const enough = uploads.length >= props.minUploads;
  const stylesOk = pickAll || picked.length === props.plan.styleCount;
  const ready = enough && subject && stylesOk && consent && pending === 0;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await postJson(`/api/studio/${props.token}/submit`, { subject, attire, backdropColor: color, styles: picked, consent });
      props.onSubmitted();
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section className="card p-6">
          <h2 className="text-lg font-semibold">1. Upload {props.minUploads}-{props.maxUploads} photos of yourself</h2>
          <p className="mt-1 text-sm text-muted">Recent photos, only you in the frame, different angles, lighting and outfits. No sunglasses, hats or filters.</p>
          <div
            className="mt-4 grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line bg-paper p-8 text-center hover:border-accent/40"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            <p className="font-medium">Drop photos here or tap to choose</p>
            <p className="text-xs text-muted">JPG, PNG, WebP or HEIC from your phone</p>
            <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={enough ? "font-medium text-ok" : "text-muted"}>
              {uploads.length} uploaded{pending ? `, ${pending} uploading…` : ""} {enough ? <CheckCircle size={16} weight="fill" className="inline align-[-3px]" aria-label="enough photos" /> : `(need ${props.minUploads - uploads.length} more)`}
            </span>
          </div>
          {uploads.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {uploads.map((u) => (
                <div key={u.id} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.url} alt="" className="aspect-square w-full rounded-md object-cover" />
                  <button onClick={() => remove(u.id)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100" aria-label="Remove photo">
                    <X size={14} weight="bold" className="mx-auto" aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">2. About you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label">Describe you as</span>
              <div className="flex gap-2">
                {(["woman", "man", "person"] as const).map((s) => (
                  <button key={s} onClick={() => setSubject(s)} className={`btn-ghost flex-1 !px-2 capitalize ${subject === s ? "!border-accent !bg-accent/5" : ""}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="attire">Wardrobe</label>
              <select id="attire" className="input" value={attire} onChange={(e) => setAttire(e.target.value as typeof attire)}>
                <option value="style_default">Mix: suits & blazers</option>
                <option value="formal">Always formal</option>
                <option value="business_casual">Business casual</option>
              </select>
            </div>
            {!props.isTeam && (
              <div className="sm:col-span-2">
                <span className="label">Brand color backdrop</span>
                <div className="flex flex-wrap gap-2">
                  {props.colors.map((c) => (
                    <button key={c.id} onClick={() => setColor(c.id)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${color === c.id ? "border-accent" : "border-line"}`}>
                      <span className="h-4 w-4 rounded-full" style={{ background: c.hex }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">3. {pickAll ? "Your styles (all included)" : `Pick ${props.plan.styleCount} styles`}</h2>
          {props.isTeam ? <p className="mt-1 text-sm text-muted">Your team&apos;s matching backdrop is included automatically.</p> : null}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {props.styles.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggle(s.id)} className={`rounded-lg border p-3 text-left text-sm ${on ? "border-accent bg-accent/5" : "border-line bg-card"} ${pickAll ? "cursor-default" : ""}`}>
                  <div className="flex items-center gap-1.5 font-medium">{on ? <CheckCircle size={16} weight="fill" className="text-accent" aria-hidden /> : null}{s.name}</div>
                  <div className="text-xs text-muted">{s.description}</div>
                </button>
              );
            })}
          </div>
          {!pickAll ? <p className="mt-2 text-xs text-muted">{picked.length}/{props.plan.styleCount} selected</p> : null}
        </section>
      </div>

      <aside className="h-fit lg:sticky lg:top-24">
        <div className="card p-6">
          <h3 className="font-semibold">Ready to start?</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <ReadyItem ok={enough}>{props.minUploads}+ photos</ReadyItem>
            <ReadyItem ok={!!subject}>About you</ReadyItem>
            <ReadyItem ok={stylesOk}>Styles</ReadyItem>
          </ul>
          <label className="mt-4 flex gap-2 text-xs text-muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
            These are photos of me, and I agree to the Terms. My selfies are deleted after 7 days.
          </label>
          <button onClick={submit} disabled={!ready || submitting} className="btn-primary mt-4 w-full">
            {submitting ? "Starting…" : "Create my headshots"}
          </button>
          {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
        </div>
      </aside>
    </div>
  );
}

function ReadyItem({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-ok" : "text-muted"}`}>
      {ok ? <CheckCircle size={16} weight="fill" aria-hidden /> : <Circle size={16} aria-hidden />}
      {children}
    </li>
  );
}
