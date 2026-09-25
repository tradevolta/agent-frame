"use client";
import { useCallback, useEffect, useState } from "react";
import type { AgentProfile } from "@/lib/db/schema";
import { UploadStep } from "./upload-step";
import { Gallery } from "./gallery";
import { BrandKit } from "./brand-kit";
import { api, type StatusView, type StyleView, type TemplateView } from "./types";

interface Props {
  token: string;
  initial: StatusView;
  uploads: { id: string; url: string }[];
  plan: { name: string; styleCount: number; brandKit: boolean; photosPerStyle: number };
  isTeam: boolean;
  styles: StyleView[];
  chosenStyles: string[];
  colors: { id: string; label: string; hex: string }[];
  templates: TemplateView[];
  profile: AgentProfile;
  referralUrl: string | null;
  minUploads: number;
  maxUploads: number;
}

const POLL_MS: Record<string, number> = { pending_payment: 2500, training: 10000, generating: 6000 };

export function Studio(props: Props) {
  const [view, setView] = useState<StatusView>(props.initial);
  const [tab, setTab] = useState<"photos" | "brand">("photos");

  const refresh = useCallback(async () => {
    try {
      setView(await api<StatusView>(`/api/studio/${props.token}/status`));
    } catch {}
  }, [props.token]);

  useEffect(() => {
    const ms = POLL_MS[view.status];
    if (!ms) return;
    const t = setInterval(refresh, ms);
    return () => clearInterval(t);
  }, [view.status, refresh]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">{props.plan.name}{props.isTeam ? " · Team seat" : ""}</p>
          <h1 className="font-display text-3xl md:text-4xl">Your headshot studio</h1>
        </div>
        <p className="max-w-sm text-xs text-muted">Bookmark this page. It&apos;s your private link, and we also emailed it to you.</p>
      </div>

      {view.status === "pending_payment" && (
        <Panel title="Confirming your payment…">
          <p>This usually takes a few seconds. The page will update automatically.</p>
        </Panel>
      )}

      {view.status === "awaiting_upload" && (
        <UploadStep
          token={props.token}
          initialUploads={props.uploads}
          plan={props.plan}
          isTeam={props.isTeam}
          styles={props.styles}
          colors={props.colors}
          minUploads={props.minUploads}
          maxUploads={props.maxUploads}
          onSubmitted={refresh}
        />
      )}

      {(view.status === "training" || view.status === "generating") && <Processing view={view} />}

      {view.status === "completed" && (
        <>
          {props.plan.brandKit ? (
            <div className="mb-6 inline-flex rounded-lg border border-line bg-card p-1 text-sm">
              {(["photos", "brand"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`min-h-11 rounded-md px-5 py-2.5 font-medium ${tab === t ? "bg-accent text-on-accent" : "text-muted"}`}>
                  {t === "photos" ? "Headshots" : "Brand Kit"}
                </button>
              ))}
            </div>
          ) : null}
          {tab === "photos" || !props.plan.brandKit ? (
            <Gallery token={props.token} view={view} styles={props.styles} chosenStyles={props.chosenStyles} onChange={refresh} setView={setView} />
          ) : (
            <BrandKit token={props.token} photos={view.photos} templates={props.templates} initialProfile={props.profile} />
          )}
          {props.referralUrl ? <Referral url={props.referralUrl} /> : null}
        </>
      )}

      {view.status === "failed" && (
        <Panel title="We hit a snag">
          <p>Your shoot didn&apos;t finish. We&apos;ve been notified and will re-run it or refund you in full. You don&apos;t need to do anything, but you can reply to your confirmation email with questions.</p>
        </Panel>
      )}
      {view.status === "refunded" && <Panel title="This order was refunded"><p>If that&apos;s unexpected, reply to your confirmation email.</p></Panel>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card max-w-2xl p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 text-muted">{children}</div>
    </div>
  );
}

function Processing({ view }: { view: StatusView }) {
  const pct = view.status === "training" ? 8 : view.progress.total ? 15 + Math.round((view.progress.done / view.progress.total) * 85) : 15;
  return (
    <div className="card max-w-2xl p-8">
      <h2 className="text-xl font-semibold">{view.status === "training" ? "Learning your features…" : "Photographing you in each style…"}</h2>
      <p className="mt-2 text-muted">
        {view.status === "training"
          ? "We're training your private AI model. This is the longest step (usually 20-40 minutes)."
          : `Generating your headshots${view.progress.total ? ` (${view.progress.done}/${view.progress.total} batches done)` : ""}.`}{" "}
        You can close this page. We&apos;ll email you when everything is ready.
      </p>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      {view.photos.length > 0 ? (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {view.photos.slice(-12).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.url} alt="" className="aspect-[3/4] w-full rounded-md object-cover" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Referral({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card mt-10 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="font-semibold">Give your colleagues a discount, get free redos</h3>
        <p className="text-sm text-muted">Agents who buy through your link save on their order. You get 2 extra redos for each one.</p>
      </div>
      <div className="flex w-full gap-2 md:w-auto">
        <input readOnly value={url} className="input md:w-80" aria-label="Referral link" />
        <button
          className="btn-ghost shrink-0"
          onClick={() => {
            navigator.clipboard.writeText(url).then(() => setCopied(true));
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
