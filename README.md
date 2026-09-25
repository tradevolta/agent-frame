# AgentFrame: AI headshots + Brand Kit for real estate agents

Agents upload 10–20 selfies. We train a private AI model of their face, generate
headshots in 12 real-estate styles, and turn them into ready-to-post marketing
graphics (Just Listed, Open House, Sold, business card, email signature…) with
the brokerage name built in.

- **Starter $29**: 40 headshots, 4 styles, 1 redo
- **Agent Pro $49**: ~100 headshots, all 12 styles, Brand Kit, 3 redos
- **Brokerage Team $39/agent** (5+ seats): one invite link, manager dashboard, matching backdrop
- **Always Fresh $79/yr**: a new Pro shoot every 6 months

The brand name, domain and support email are set by environment variables (see `src/lib/brand.ts`), so renaming the product needs no code change.
See [`docs/MARKETING.md`](docs/MARKETING.md) for domain ideas and the go-to-market plan.

## Stack

| Concern | Choice | Local fallback (no keys) |
|---|---|---|
| App | Next.js 16 (App Router) on Vercel | – |
| Database | Postgres via Neon + Drizzle ORM | Embedded PGlite in `.data/` |
| Payments | Stripe Checkout + webhooks | Fake checkout at `/api/mock-checkout` |
| AI | fal.ai: FLUX LoRA portrait trainer + FLUX LoRA generation | Echoes your uploads back as "results" |
| Storage | Vercel Blob | Local disk served by `/api/files` |
| Email | Zoho Mail (SMTP via nodemailer) | Logged to the console |
| Graphics | `next/og` (Satori) rendered on demand | same |

Everything is stateless and serverless, so it scales horizontally on Vercel. The AI work
runs asynchronously on fal.ai's queue and reports back through signed webhooks,
with a polling fallback (`syncOrder`) if a webhook is missed.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000, mock mode, no accounts needed
npm test               # unit tests
npm run lint && npm run typecheck
```

Full end-to-end smoke test (checkout → upload → generate → brand kit → teams → subscription → free tool):

```bash
npm run build
ALLOW_MOCK_PAYMENTS=true APP_SIGNING_SECRET=test ADMIN_PASSWORD=test npx next start &
npm run e2e:mock
```

## Deploy to Vercel (about 30 minutes)

1. **Import the repo** in Vercel → New Project. Framework: Next.js (defaults are fine).
2. **Storage** tab → add **Neon Postgres** (sets `DATABASE_URL`) and **Blob** (sets `BLOB_READ_WRITE_TOKEN`).
   Migrations run automatically during `npm run build`.
3. **Stripe** (start in test mode):
   - Copy the secret key → `STRIPE_SECRET_KEY`.
   - Developers → Webhooks → add endpoint `https://YOURDOMAIN/api/webhooks/stripe` with events
     `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`
     → copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
   - Optional: create a coupon (e.g. 20% off, once) → `STRIPE_REFERRAL_COUPON_ID` to power referral links.
4. **fal.ai** → create an API key → `FAL_KEY`. Add about $20 of credit.
5. **Zoho Mail** → create (or reuse) a mailbox such as `studio@yourdomain.com`. In Zoho Accounts → Security →
   App Passwords, generate a password for "AgentFrame". Set `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, and `SMTP_HOST`
   (`smtppro.zoho.com` for custom-domain accounts, `smtp.zoho.com` for free personal ones; use `.eu`/`.in` if your
   Zoho account lives in those data centers). Make sure SPF and DKIM for your domain are set up in Zoho so
   emails don't land in spam.
6. Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com`, `APP_SIGNING_SECRET` (`openssl rand -base64 32`),
   `ADMIN_PASSWORD`, `CRON_SECRET`, plus the `NEXT_PUBLIC_BRAND_*` values. See `.env.example`.
7. **Domains** tab → add your domain. Redeploy.
8. Open `/admin` → **Generate sample photos**. This creates the 12 style samples (AI-generated
   fictional agents, about $0.75 total) and shows them on the site. Then place a real $29 order
   yourself with a 100% Stripe promo code to check the quality of actual shoots.

`/admin` starts with a **setup checklist** showing which services are connected. Until the database and
Stripe are connected, visitors see a clear "not available yet" message instead of an error.

Stripe notifications can't reach a `*.vercel.app` address while Vercel Authentication is on. Connect your
domain before taking real orders. As a fallback, a studio page also asks Stripe directly whether a pending
order was paid.

Cron jobs (`vercel.json`): daily webhook recovery sync and daily selfie purge (7-day retention).
On Vercel Pro you can make the sync hourly.

## Where things live

```
src/lib/pipeline.ts     order lifecycle: payment → uploads → training → generation → delivery, redos, retries, purge
src/lib/payments.ts     Stripe checkout for orders, teams, subscriptions + webhook fulfillment (idempotent)
src/lib/ai.ts           fal.ai queue wrapper (+ mock)
src/lib/styles.ts       the 12 realtor styles and prompt builder
src/lib/brandkit.tsx    Brand Kit graphic templates (next/og)
src/lib/accounts.ts     team seats + Always Fresh subscription shoots
src/app/studio/[token]  customer studio (upload, progress, gallery, redo, brand kit)
src/app/admin           revenue, costs, orders, retries, leads CSV (basic auth)
src/content/            SEO city pages + guide articles
```

Access model: customers don't have passwords. Each studio, team dashboard and account
page is a long random capability URL that we email to them. Admin is behind HTTP basic auth.

## Before you launch

- [ ] Have a lawyer review `/terms` and `/privacy` (they're a solid starting draft, not legal advice).
- [ ] Double-check the NC advertising guidance in `src/content/posts.tsx` against current NCREC rules.
- [ ] Run 3–5 real shoots (you, friends) and tune prompts in `src/lib/styles.ts` if needed.
- [ ] Add real sample images to `public/samples/`.
- [ ] Switch Stripe to live mode and update the keys and webhook secret.
- [ ] Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.
