import "server-only";
import { brand, appUrl } from "./brand";
import { env } from "./env";

interface Mail {
  to: string;
  subject: string;
  html: string;
}

type Transport = { sendMail(m: Record<string, unknown>): Promise<unknown> };
let transport: Promise<Transport> | null = null;

function getTransport(): Promise<Transport> {
  transport ??= import("nodemailer").then((nodemailer) =>
    nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: env.smtpUser, pass: env.smtpPass },
    }),
  );
  return transport;
}

export async function sendEmail(mail: Mail): Promise<void> {
  if (!env.smtpUser || !env.smtpPass) {
    console.info(`[email:mock] to=${mail.to} subject="${mail.subject}"`);
    return;
  }
  try {
    const t = await getTransport();
    await t.sendMail({ from: env.emailFrom, replyTo: brand.supportEmail, ...mail });
  } catch (err) {
    // Email must never break checkout or generation.
    console.error("[email] send failed", err);
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, body: string, cta?: { label: string; href: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f3ef;font-family:Helvetica,Arial,sans-serif;color:#1c1917">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-weight:700;font-size:18px;margin-bottom:24px">${esc(brand.name)}</div>
<div style="background:#fff;border-radius:12px;padding:28px">
<h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
${body}
${cta ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="background:#1c1917;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600">${esc(cta.label)}</a></p>` : ""}
</div>
<p style="font-size:12px;color:#78716c;margin-top:20px">Questions? Just reply or write ${esc(brand.supportEmail)}. Keep this email — the link above is your private studio link.</p>
</div></body></html>`;
}

export const emails = {
  orderPaid(to: string, token: string, planName: string) {
    return sendEmail({
      to,
      subject: `Your ${brand.name} studio is ready — upload your selfies`,
      html: layout(
        "You're in! Next: upload 10–20 selfies",
        `<p>Thanks for choosing <b>${esc(planName)}</b>. Upload a mix of recent photos (different angles, lighting and outfits, no sunglasses or group shots). It takes about 3 minutes.</p>`,
        { label: "Open my studio", href: appUrl(`/studio/${token}`) },
      ),
    });
  },
  photosReady(to: string, token: string, count: number) {
    return sendEmail({
      to,
      subject: `Your ${count} headshots are ready 📸`,
      html: layout(
        "Your headshots are ready",
        `<p>We generated <b>${count}</b> headshots. Favorite the best ones, download in full resolution, and build your Brand Kit graphics.</p><p>Not quite you? Use a free redo on any style.</p>`,
        { label: "See my headshots", href: appUrl(`/studio/${token}`) },
      ),
    });
  },
  generationFailed(to: string, token: string) {
    return sendEmail({
      to,
      subject: `We hit a snag with your ${brand.name} order`,
      html: layout(
        "Something went wrong — we're on it",
        `<p>Your shoot didn't finish. Our team has been notified and will re-run it or refund you in full. No action needed.</p>`,
        { label: "Check status", href: appUrl(`/studio/${token}`) },
      ),
    });
  },
  teamPaid(to: string, teamToken: string, joinCode: string, seats: number, teamName: string) {
    return sendEmail({
      to,
      subject: `${teamName}: your ${seats} headshot seats are active`,
      html: layout(
        "Your team is set up",
        `<p>Share this invite link with your agents. Each agent claims one seat and gets their own private studio:</p>
<p style="background:#f5f3ef;padding:12px;border-radius:8px;word-break:break-all"><b>${appUrl(`/join/${joinCode}`)}</b></p>
<p>Track who has finished from your manager dashboard.</p>`,
        { label: "Open manager dashboard", href: appUrl(`/team/${teamToken}`) },
      ),
    });
  },
  subscriptionActive(to: string, token: string) {
    return sendEmail({
      to,
      subject: `Welcome to ${brand.name} Always Fresh`,
      html: layout(
        "You're always fresh",
        `<p>Your first shoot is ready to start. Every 6 months you can start a brand-new shoot from your account page.</p>`,
        { label: "Open my account", href: appUrl(`/account/${token}`) },
      ),
    });
  },
  leadMagnet(to: string) {
    return sendEmail({
      to,
      subject: "Your free Just Listed graphic + the realtor headshot checklist",
      html: layout(
        "Here's your free graphic",
        `<p>Thanks for trying our free Just Listed maker. Quick checklist for a headshot that gets calls:</p>
<ul><li>Eyes sharp, shoulders angled, genuine smile</li><li>Update every 1–2 years (clients notice)</li><li>Same photo everywhere: MLS, Zillow, Google, cards</li><li>Brokerage name on every ad (NC Real Estate Commission rule)</li></ul>
<p>Want a studio-quality AI headshot without a photographer?</p>`,
        { label: "Get my headshots", href: appUrl("/#pricing") },
      ),
    });
  },
};
