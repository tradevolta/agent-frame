"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Circle } from "@phosphor-icons/react";
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

const POLL_MS: Record<string, number> = { pending_payment: 2500, queued: 30000, failed: 60000, training: 10000, generating: 6000 };

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

      {(view.status === "queued" || view.status === "failed" || view.status === "training" || view.status === "generating") && <Processing view={view} />}

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

const TRAINING_MINUTES = 30; // typical fal.ai portrait training time

type Step = { label: string; state: "done" | "active" | "waiting" | "todo"; note?: string };

/**
 * Where the shoot is, as a percentage and a list of steps. The customer never
 * sees an error: queued (retrying) and failed (owner alerted) orders read as
 * "waiting for a free spot" on the training step.
 */
function progressOf(view: StatusView, now: number | null): { pct: number; steps: Step[]; eta: string } {
  const inLine = view.status === "queued" || view.status === "failed";
  const trainingDone = view.status === "generating" || view.status === "completed";
  const elapsedMin = view.startedAt && now ? Math.max(0, (now - Date.parse(view.startedAt)) / 60_000) : 0;
  const trainFrac = Math.min(elapsedMin / TRAINING_MINUTES, 0.95);
  const genFrac = view.progress.total ? view.progress.done / view.progress.total : 0;

  let pct = 10;
  if (view.status === "training") pct = 10 + Math.round(trainFrac * 45);
  if (view.status === "generating") pct = 55 + Math.round(genFrac * 44);
  if (view.status === "completed") pct = 100;

  const minutesLeft =
    view.status === "training" ? Math.max(5, Math.round(TRAINING_MINUTES - elapsedMin)) + 5 : view.status === "generating" ? Math.max(1, Math.round((1 - genFrac) * 5)) : null;
  const eta = inLine ? "Starting soon" : minutesLeft ? `About ${minutesLeft} min left` : "";

  const steps: Step[] = [
    { label: "Payment", state: "done" },
    { label: "Selfies uploaded", state: "done" },
    {
      label: "Learning your face",
      state: trainingDone ? "done" : inLine ? "waiting" : "active",
      note: inLine ? "Waiting for a free spot in our AI studio" : view.status === "training" ? "Usually 20-40 minutes" : undefined,
    },
    {
      label: "Taking your photos",
      state: view.status === "completed" ? "done" : view.status === "generating" ? "active" : "todo",
      note:
        view.status === "generating" && view.progress.total
          ? `${view.progress.done} of ${view.progress.total} photo sets done${view.progress.waiting ? `, ${view.progress.waiting} waiting their turn` : ""}`
          : undefined,
    },
    { label: "Ready to download", state: view.status === "completed" ? "done" : "todo" },
  ];
  return { pct, steps, eta };
}

function Gauge({ pct, label }: { pct: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Shoot progress">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-line" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-3xl font-semibold tabular-nums">{pct}%</span>
        {label ? <span className="mt-0.5 px-4 text-[11px] leading-tight text-muted">{label}</span> : null}
      </div>
    </div>
  );
}

function Processing({ view }: { view: StatusView }) {
  // Wall-clock time drives the training part of the gauge; start null so the
  // server and first client render match, then tick every 15 seconds.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  const { pct, steps, eta } = progressOf(view, now);
  const inLine = view.status === "queued" || view.status === "failed";
  const title = inLine ? "Your shoot is next in line" : view.status === "training" ? "Learning your features…" : "Photographing you in each style…";

  return (
    <div className="card max-w-2xl p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Gauge pct={pct} label={eta} />
        <div className="w-full min-w-0 flex-1">
          <h2 className="text-center text-xl font-semibold sm:text-left">{title}</h2>
          <ol className="mx-auto mt-4 max-w-xs space-y-3 sm:mx-0">
            {steps.map((s) => (
              <li key={s.label} className="flex gap-3">
                <StepIcon state={s.state} />
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${s.state === "todo" ? "text-muted" : ""}`}>{s.label}</div>
                  {s.note ? <div className="text-xs text-muted">{s.note}</div> : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">
        Everything is saved, so you can close this page. We&apos;ll email you when your headshots are ready.
      </p>
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

function StepIcon({ state }: { state: Step["state"] }) {
  if (state === "done") return <CheckCircle size={20} weight="fill" className="mt-px shrink-0 text-ok" aria-label="done" />;
  if (state === "todo") return <Circle size={20} className="mt-px shrink-0 text-line" aria-label="not started" />;
  return (
    <span className="relative mt-px grid h-5 w-5 shrink-0 place-items-center" aria-label={state === "active" ? "in progress" : "waiting"}>
      <span className={`absolute h-5 w-5 rounded-full ${state === "active" ? "bg-accent/25" : "bg-muted/20"} animate-ping motion-reduce:animate-none`} />
      <span className={`h-2.5 w-2.5 rounded-full ${state === "active" ? "bg-accent" : "bg-muted"}`} />
    </span>
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
