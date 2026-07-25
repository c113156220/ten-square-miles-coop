
This request bundles two very different kinds of work. Part A is pure frontend/UX and I can ship it in this turn. Part B (real SMTP, real database persistence, real-time backoffice sync) requires enabling Lovable Cloud and configuring an email domain — that's a one-way infra change I don't want to do without your explicit go-ahead.

## Part A — Ship now (frontend only, still on localStorage)

### 1. Interactive Taiwan producer map (`src/routes/governance.tsx`)
- Replace the abstract map with an inline SVG outline of Taiwan.
- Plot pins for Yilan, Hualien, Nantou, Pingtung, Taitung, Chiayi.
- Hover popover per pin: producer name, location, support amount + CO₂/plastic-saved impact badge, 2-line blurb, thumbnail (generated).
- Bilingual labels via `t()`.

### 2. Event cards visual overhaul (`src/routes/governance.tsx`)
- Add `aspect-video` cover image container to every event card (3 generated covers: farm tour, tasting workshop, seminar).
- Top-right overlaid status badge (Free for Members / Limited Seats).
- Hover zoom: `transition-transform duration-300 hover:scale-105`, `overflow-hidden` wrapper.

### 3. OTP verification UX (`src/components/auth-modals.tsx` + new onboarding step)
- 5-minute countdown on the code input; expired state shows "OTP Code expired. Please request a new code." and disables Verify.
- Resend Code button with 60s cooldown (extend existing pattern).
- 6-digit code input; accepts `123456` in dev mode.

### 4. Member Education Onboarding flow (new `/onboarding` route)
- Full-page 4-step flow; homepage "體驗帳號 / 立即體驗" button routes here.
- **Step 1** — Identity form (Name, ID/Student ID, Email) → Send code → 6-digit input (OTP UX from #3).
- **Step 2** — Swipeable "合作社十講" card carousel, 3 cards (一人一票 / 營業不營利 / 免稅福利), top progress bar, 3-second read-lock before Next unlocks.
- **Step 3** — Randomized quiz: pool of 8 questions (as specified), pick 3 per attempt, must get all 3 correct, on fail restart with 3 new random questions.
- **Step 4** — Confetti celebration + welcome voucher message + CTA "去逛預購商品" → `/coop`. On success, mint the trial account via existing `auth.tsx` (30-day trial + voucher flag).

All strings bilingual through `src/lib/i18n.tsx`.

## Part B — Needs your go-ahead (I will NOT touch until you confirm)

These three items require Lovable Cloud + real email:

- **Real SMTP transactional emails** for the 4 verification-step notifications (Step 1/2/3/Final Approval). Requires either Lovable Emails with a sender domain you own, or a Resend API key.
- **Persistent DB for registration/verification** (`profiles`, `member_applications`, `verification_steps`, `admin_notes`) replacing `localStorage` in `src/lib/auth.tsx`.
- **Real-time backoffice audit table** — front-end step submissions appear in `/admin/members` without refresh (Supabase realtime subscription).

Impact if we do Part B:
- Enabling Cloud is one-way (easy to add, can't undo cleanly).
- Existing demo accounts (`admin@coop.tw`, `member@coop.tw`, `demo@tensqmiles.coop`) get recreated as real Supabase users; anything in your browser's localStorage won't migrate.
- For real Gmail delivery I need you to pick: **Lovable Emails** (built-in, needs a domain you own for verified sending) or **Resend** (needs your Resend API key).

## What I need from you

Reply with one of:
- **"A only"** — I ship Part A now, we do Part B in a follow-up turn.
- **"A + B, Lovable Emails, domain: yourdomain.com"** — I do everything; you'll set DNS after.
- **"A + B, Resend"** — I do everything; you'll paste a Resend API key when I prompt.

Recommended: **A only** first so you get the visible UX/onboarding wins immediately, then we do the infra migration cleanly in its own turn.
