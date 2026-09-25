# Design audit: taste-skill

Audited against [taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT), vendored in
`.claude/skills/taste-skill` and `.claude/skills/redesign-skill` so future changes follow the same rules.

**Design read:** consumer-facing SaaS landing for real estate agents (non-technical, trust-first buyers),
with a clean and credible language, leaning toward Tailwind v4 + Geist + restrained motion.
**Dials:** DESIGN_VARIANCE 6 · MOTION_INTENSITY 3 · VISUAL_DENSITY 4.
**Mode:** redesign, preserve (URLs, nav labels, copy voice and form fields unchanged).

## What failed, and what changed

| Rule (skill section) | Before | After |
|---|---|---|
| Serif discipline (4.1): Fraunces is banned as a default | Fraunces display headings | Geist only, 650 weight, tight tracking |
| Premium-consumer palette ban (4.2) | Warm cream `#faf8f5` + brass `#c08a2e` + espresso `#1c1917` | Cool neutrals + one cobalt accent `#2446a6` |
| One accent color (4.2) | Navy + gold | Cobalt only |
| Page theme lock (4.11) | Dark navy Brand Kit section in a light page | Tinted light band in the same theme |
| Dark mode (6.C, 8) | Light only | Full dark theme via `prefers-color-scheme` tokens |
| Em-dash ban (9.G) | 20+ em/en dashes in UI, emails, content | Zero (checked in the browser) |
| Hero discipline (4.7) | 27-word subtext, bullet list and status-dot pill inside hero | 19-word subtext, bullets moved to a trust strip below |
| Duplicate CTA intent (4.5) | "Get headshots" + "Get my headshots from $29" | One label: "Get headshots" |
| Div-based fake product previews (4.8, 9.E) | HTML mock-ups of the Brand Kit | Real graphics from the actual renderer (`/api/brand-kit-demo/*`) |
| Hand-rolled SVGs / emoji (3.C, 3.D) | Hand-drawn logo, silhouettes, ✓ ★ ✕ ○ ← symbols, 📸 in email | Phosphor icons; silhouettes removed |
| Three equal cards (9.C) | "How it works" as three numbered cards | Heading column + stacked steps with icons |
| Pills overlaid on images (9.F) | "MLS-safe" pill on style images | Caption below the image |
| Accordion FAQ (redesign audit) | `<details>` accordion | Two-column list, answers visible |
| Eyebrow restraint (4.7) | Uppercase wide-tracking eyebrows | Sentence-case labels, max 1 per 3 sections |
| Interactive states (4.5) | No press feedback, default focus | `active:scale-[0.98]`, 200ms transitions, visible focus ring |
| Skip link, active nav (redesign audit) | Missing | Added |
| No placeholder-as-label (4.6) | Newsletter email had placeholder only | Visible label + inline error |
| No `window.alert()` (redesign audit) | Admin retry used `alert()` | Inline error |
| Reduced motion (6.B) | Not handled | Transitions and smooth scroll disabled under `prefers-reduced-motion` |

## Still open

1. **Real sample images (4.8).** The 12 style tiles are gradient placeholders. The skill is clear that a page
   without real imagery is incomplete. Fix: run real shoots, then drop outputs in
   `public/samples/<style-id>.jpg` (e.g. `front-porch.jpg`). The tiles pick them up automatically.
2. **Pricing uses three columns (4.9 / redesign audit).** Kept on purpose: the recommended plan is
   highlighted by color and border, which the skill allows, and three columns are the clearest way to compare plans.
3. **Brand Kit graphics use a warm off-white panel.** These are the customer's marketing output, not site
   chrome, so they follow the customer's brand color rather than the site palette.
4. **Lighthouse (6.D)** was not run in this environment. Run it once the site is on the custom domain.
