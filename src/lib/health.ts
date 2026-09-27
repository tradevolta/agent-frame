import "server-only";
import { sql } from "drizzle-orm";
import { dbDiagnostics, getDb } from "./db";
import { env } from "./env";
import { databaseUrl } from "./db/url";
import { emailProvider } from "./email";

export interface Check {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
}

// Supabase pooler hosts carry their AWS region (aws-0-us-east-1.pooler.supabase.com).
// Matching Vercel function regions, so the app can run next to its database.
const VERCEL_REGION_FOR: Record<string, string> = {
  "us-east-1": "iad1", "us-east-2": "cle1", "us-west-1": "sfo1", "us-west-2": "pdx1", "ca-central-1": "yul1",
  "sa-east-1": "gru1", "eu-west-1": "dub1", "eu-west-2": "lhr1", "eu-west-3": "cdg1", "eu-central-1": "fra1",
  "eu-north-1": "arn1", "ap-south-1": "bom1", "ap-southeast-1": "sin1", "ap-southeast-2": "syd1",
  "ap-northeast-1": "hnd1", "ap-northeast-2": "icn1",
};

/** Database and function regions, e.g. ", database us-west-1 / app iad1 (move the app to sfo1…)". */
export function regionInfo(): { db?: string; app?: string; suggested?: string } {
  const db = dbDiagnostics.host?.match(/aws-\d+-([a-z]+-[a-z]+-\d+)\.pooler/)?.[1];
  const app = process.env.VERCEL_REGION;
  const suggested = db ? VERCEL_REGION_FOR[db] : undefined;
  return { db, app, suggested };
}

function regionNote(): string {
  const { db, app, suggested } = regionInfo();
  if (!db || !app) return "";
  if (!suggested || suggested === app) return ` (database ${db}, app ${app})`;
  return (
    ` (database ${db}, app ${app}: every query crosses regions. ` +
    `Vercel → Settings → Functions → Function Region → ${suggested}, then redeploy)`
  );
}

/** "live" or "test", from the secret key's prefix (sk_live_ / rk_live_ vs sk_test_ / rk_test_). */
function stripeMode(): string {
  return /^(sk|rk)_live_/.test(env.stripeSecret ?? "") ? "live" : /^(sk|rk)_test_/.test(env.stripeSecret ?? "") ? "test" : "unknown";
}

/** What's configured in this deployment. Powers the setup checklist on /admin. */
export async function healthChecks(): Promise<Check[]> {
  let dbOk = false;
  let dbDetail = "Not set";
  let dbMs: number | undefined;
  if (databaseUrl() || !process.env.VERCEL) {
    try {
      const db = await getDb();
      const t0 = Date.now();
      await Promise.race([
        db.execute(sql`select 1`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("query timed out after 10s")), 10_000)),
      ]);
      dbMs = Date.now() - t0;
      dbOk = true;
      dbDetail = databaseUrl()
        ? `Connected${dbDiagnostics.host ? ` via ${dbDiagnostics.host}` : ""}, ${dbMs} ms per query${regionNote()}${dbDiagnostics.error ? ` (fallback used; first attempt: ${dbDiagnostics.error})` : ""}`
        : "Local dev database";
    } catch (e) {
      dbDetail = `Error: ${String((e as Error)?.message ?? e).slice(0, 400)}`;
    }
  }
  const stripeOk = !!env.stripeSecret && !!env.stripeWebhookSecret;
  return [
    { name: "Database", ok: dbOk, detail: dbDetail, fix: "Vercel → Storage → connect Supabase (or Neon) to this project, then redeploy." },
    {
      name: "Payments (Stripe)",
      ok: stripeOk || env.allowMockPayments,
      detail: stripeOk ? `Configured (${stripeMode()} mode)` : env.allowMockPayments ? "Mock checkout (dev only)" : !env.stripeSecret ? "STRIPE_SECRET_KEY missing" : "STRIPE_WEBHOOK_SECRET missing",
      fix: "Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (webhook → /api/webhooks/stripe). See README.",
    },
    { name: "AI (fal.ai)", ok: !!env.falKey, detail: env.falKey ? "Configured" : "FAL_KEY missing (mock AI)", fix: "Add FAL_KEY." },
    { name: "File storage (Blob)", ok: !!env.blobToken || !process.env.VERCEL, detail: env.blobToken ? "Configured" : "Local disk (dev only)", fix: "Vercel → Storage → Blob." },
    {
      name: "Email",
      ok: emailProvider() !== "none" && !!process.env.EMAIL_FROM,
      detail:
        emailProvider() === "none"
          ? "Not set: emails are only logged"
          : !process.env.EMAIL_FROM
            ? `${emailProvider() === "zeptomail" ? "ZeptoMail" : "SMTP"} set, but EMAIL_FROM is missing`
            : `${emailProvider() === "zeptomail" ? "ZeptoMail" : "Zoho SMTP"}, sending as ${env.emailFrom}`,
      fix: "Add ZEPTOMAIL_TOKEN and EMAIL_FROM (a sender on your verified ZeptoMail domain).",
    },
    {
      name: "Public domain",
      ok: !!process.env.NEXT_PUBLIC_APP_URL,
      detail: process.env.NEXT_PUBLIC_APP_URL ?? "Using the vercel.app address",
      fix:
        "Vercel Authentication blocks the vercel.app address for visitors, emailed studio links and Stripe/fal notifications. " +
        "Connect your domain (Settings → Domains), then set NEXT_PUBLIC_APP_URL to it and redeploy.",
    },
  ];
}
