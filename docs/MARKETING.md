# Go-to-market plan (introvert-friendly)

Goal: **first sale within 2–3 weeks of launch**, then 100 orders/month. Nothing
below requires phone calls, walk-ins or being on camera.

## 1. Domain name

I couldn't check availability from the build environment. Check each one at your
registrar (Cloudflare Registrar or Porkbun are at-cost), and buy the `.com` if you can.

| Name | Domains to check | Why |
|---|---|---|
| **AgentFrame** (current default) | agentframe.ai, getagentframe.com, agentframe.co | Short, covers headshots *and* brand kit, not tied to "realtor" |
| ListingFace | listingface.com, listingface.ai | Memorable, real-estate specific |
| OpenHouse Studio | openhousestudio.ai, openhouse.studio | Warm, clearly real estate |
| AgentPortrait | agentportrait.com, agentportraits.ai | Very clear about what it does |
| PorchLight Portraits | porchlightportraits.com | Friendly, matches the "Front Porch" style |
| BrokerShot | brokershot.com, brokershot.ai | Short; works for teams and brokerages |

**Avoid "realtor" in the domain or brand.** REALTOR® is a trademark of the National Association of REALTORS®,
and it has enforced that against domain names. That's also why the site text only uses
"realtor" in a descriptive way and includes a non-affiliation note in the footer.

To rename, set `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BRAND_DOMAIN`, `NEXT_PUBLIC_SUPPORT_EMAIL` and `EMAIL_FROM` in Vercel.

## 2. What's already built into the product

| Asset | Where | Job |
|---|---|---|
| Free Just Listed maker | `/free-just-listed` | Lead magnet + shareable (watermark links back) + SEO |
| 27 city landing pages | `/realtor-headshots/[city]` | Rank for "realtor headshots Raleigh", etc. |
| 5 SEO guides | `/blog` | Rank for "realtor headshot tips", "AI headshots vs photographer" |
| Referral links | shown after delivery | Customer refers a colleague; referral coupon + 2 free redos for referrer |
| Team pricing | `/teams` | One broker sale = 5–50 agents |
| Newsletter capture + CSV export | homepage, `/admin` | Build the email list from day one |
| Schema.org Product/FAQ/Article data | all pages | Rich results in Google |

## 3. Launch plan

### Week 0: set up (1–2 days)
- Deploy (see README), buy the domain, set up Stripe live mode.
- Do your own shoot plus 2–3 friends'. Put the best results in `public/samples/`. **Real samples are the #1 conversion driver.**
- Make a before/after image: 4 selfies → 4 headshots.
- Google Search Console: submit the sitemap. Bing Webmaster Tools: import from Google.

### Week 1: free distribution (text-only, no calls)
1. **Facebook groups for NC agents** (e.g. Triangle, Charlotte and NC agent groups; search "NC real estate agents").
   Don't pitch. Post *value*: "I built a free Just Listed graphic maker, no signup needed besides email. Feedback welcome."
   Agents love free tools, and the watermark and upgrade path do the selling.
2. **Reddit**: r/realtors and r/RealEstate. Read each subreddit's self-promo rules first. Share the free tool or the
   "AI vs photographer" guide as a genuine post, and answer questions in comments.
3. **AI tool directories** (free backlinks + traffic): There's An AI For That, Futurepedia, Toolify, AI Tool Hunt, SaaSHub.
   Also launch on **Product Hunt** on a Tuesday–Thursday.
4. **Founding-agent offer**: create a Stripe promo code `FOUNDING` for 30% off the first 50 orders. Put it in every post.

### Week 2: content engine (about 1 hour a day, all async)
- **Faceless short videos** on TikTok, Instagram Reels and YouTube Shorts: screen-record "selfies → headshots in 60 seconds",
  with a caption and voiceover by text-to-speech or none. Post 1 a day. Show the Brand Kit too. That's the differentiator.
- **Pinterest**: pin every Brand Kit template and style sample. Real estate content does well on Pinterest, and pins last for months.
- Publish one new guide per week (e.g. "Best headshot backgrounds for realtors", "How often should agents update headshots").

### Weeks 3–4: leverage (the fastest volume)
1. **Pre-licensing schools and instructors.** Every new licensee needs a headshot within weeks. Email NC real estate
   schools and instructors offering an affiliate cut (20%) or a student discount code. This is async email, not calls.
2. **Brokerage onboarding**: email broker-in-charge and recruiting contacts at growing Triangle brokerages with the
   team page link: "matching headshots for every new agent you onboard, $39/agent." One yes = 10–50 orders.
3. **Email your leads** (from `/admin` → Export CSV) using Zoho Campaigns (pairs with your Zoho Mail), Beehiiv or MailerLite. Don't send bulk email from your Zoho mailbox: it has daily sending limits and bulk mail from it can get the account suspended:
   a 3-email sequence of tips, then samples, then the founding discount deadline.
   *(Cold outreach must follow CAN-SPAM: real identity, physical address, and an unsubscribe link.)*

### Month 2+: paid, only after it converts
- Once you have 10+ organic sales, test **Meta ads** at $10–20/day targeting real estate agents or new licensees,
  using before/after creative. Turn off anything that costs more than about $20 per sale on the $49 plan.
- **Google Ads** on high-intent terms: "realtor headshots near me", "ai headshots for realtors" ($5–10/day).
- Add an affiliate program (Rewardful or PromoteKit, both integrate with Stripe) for real estate coaches and YouTubers.

## 4. Metrics to watch (all visible in `/admin`)

| Metric | Healthy target |
|---|---|
| Visitor → checkout started | 3–6% |
| Checkout → paid | 40%+ (watch the "abandoned checkouts" stat) |
| AI cost per Pro order | under $8 |
| Redo rate | under 30%; if higher, tune prompts in `src/lib/styles.ts` |
| Refund rate | under 5% |
| Share of Pro plan among orders | 50%+ (Brand Kit is the upsell) |

## 5. Pricing experiments to try after 50 sales
- Raise Pro to $59 (competitors charge $29–75 for headshots *without* marketing graphics).
- Offer an "Express 30-min" add-on (+$15) using faster training settings.
- Add seasonal Brand Kit template packs (spring market, holidays) to drive Always Fresh subscriptions.
