import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { env } from "./env";

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
  if (process.env.DATABASE_URL || !process.env.VERCEL) {
    try {
      const db = await getDb();
      await db.execute(sql`select 1`);
      dbOk = true;
      dbDetail = process.env.DATABASE_URL ? "Connected" : "Local dev database";
    } catch (e) {
      dbDetail = `Error: ${String(e).slice(0, 120)}`;
    }
  }
  const stripeOk = !!env.stripeSecret && !!env.stripeWebhookSecret;
  return [
    { name: "Database (Neon)", ok: dbOk, detail: dbDetail, fix: "Vercel → Storage → Create → Neon, connect to this project, then redeploy." },
    {
      name: "Payments (Stripe)",
      ok: stripeOk || env.allowMockPayments,
      detail: stripeOk ? "Configured" : env.allowMockPayments ? "Mock checkout (dev only)" : !env.stripeSecret ? "STRIPE_SECRET_KEY missing" : "STRIPE_WEBHOOK_SECRET missing",
      fix: "Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (webhook → /api/webhooks/stripe). See README.",
    },
    { name: "AI (fal.ai)", ok: !!env.falKey, detail: env.falKey ? "Configured" : "FAL_KEY missing (mock AI)", fix: "Add FAL_KEY." },
    { name: "File storage (Blob)", ok: !!env.blobToken || !process.env.VERCEL, detail: env.blobToken ? "Configured" : "Local disk (dev only)", fix: "Vercel → Storage → Blob." },
    { name: "Email (Zoho SMTP)", ok: !!env.smtpUser && !!env.smtpPass, detail: env.smtpUser ? `Sending as ${env.smtpUser}` : "Not set: emails are only logged", fix: "Add SMTP_USER, SMTP_PASS, EMAIL_FROM." },
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
