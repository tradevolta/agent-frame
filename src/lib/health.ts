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

/** What's configured in this deployment. Powers the setup checklist on /admin. */
export async function healthChecks(): Promise<Check[]> {
  let dbOk = false;
  let dbDetail = "Not set";
  if (databaseUrl() || !process.env.VERCEL) {
    try {
      const db = await getDb();
      await Promise.race([
        db.execute(sql`select 1`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("query timed out after 10s")), 10_000)),
      ]);
      dbOk = true;
      dbDetail = databaseUrl()
        ? `Connected${dbDiagnostics.host ? ` via ${dbDiagnostics.host}` : ""}${dbDiagnostics.error ? ` (fallback used; first attempt: ${dbDiagnostics.error})` : ""}`
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
      detail: stripeOk ? "Configured" : env.allowMockPayments ? "Mock checkout (dev only)" : !env.stripeSecret ? "STRIPE_SECRET_KEY missing" : "STRIPE_WEBHOOK_SECRET missing",
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
