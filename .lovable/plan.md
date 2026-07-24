This is a very large multi-part request. Before writing code I want to confirm scope and flag a critical infra decision.

## Part A — Frontend/UX work (can implement directly in this project)

1. **Dual-System Split (單一入口)**
   - Site shell already has a Governance/Store toggle; polish it into a segmented pill in the top bar, add trial-days countdown badge, ensure language switcher and role badge are grouped consistently.
   - Confirm route grouping: `/` (landing chooser) → Store side (`/coop`, `/wishlist`, `/calculator`) vs Governance side (`/governance`, `/impact`, `/trial`). No route moves needed; just nav grouping.

2. **Non-Member Conversion Engine**
   - Add dual-price tag component (Member vs Non-Member) on product cards in `/` and `/coop`.
   - Add interactive "Annual Surplus Return Calculator" enhancements on `/calculator` (weekly input → annual + ROI months + share-payback line).
   - Share Deposit $100 voucher awarded after `/trial` quiz completion (persist on user).
   - "Share Exit & Refund Guarantee" drawer in register modal + user profile area.
   - Wishlist: 48h member-first countdown badge on items at 100+ votes; weekly bento menu voting widget with guest-nudge modal.

3. **Backoffice Guest Trial Roster + Edit Days Modal**
   - Rewrite Trial Accounts table in `admin.members.tsx` with: name, email, phone, registered date, days-remaining color badge (green>7 / orange 1–3 / red 0), expiration date, status, Edit Days action.
   - `EditTrialDaysModal`: quick chips (+7/+14/+30/Force expire), custom numeric ± input, date picker for exact expiry, admin note, save. Extend `auth.tsx` with `setTrialExpiry(userId, days|date, note)` and admin-note log.
   - Universal Directory: add a new admin route `/admin/users` (or a tab) listing ALL users — guest / trial / applicant / member / expired — with step, role, actions.

4. **Strict Bilingual i18n Audit**
   - Sweep every route/component; replace remaining hardcoded EN/ZH strings with `t()` calls.
   - Expand `src/lib/i18n.tsx` with full keys listed in the request (userId, role, registrationDate, daysRemaining, expirationDate, status, actions, active, expired, upgraded, editDays, save, cancel, admin, guestNonMember, verifiedMember, etc.).
   - Priority files: `admin.members.tsx`, `admin.forecasting.tsx`, `admin.finance.tsx`, `admin.roles.tsx`, `admin.settings.tsx`, `admin.preorders.tsx`, `admin.surplus.tsx`, `admin.voting.tsx`, `admin.index.tsx`, `governance.tsx`, `wishlist.tsx`, `trial.tsx`, `calculator.tsx`, `register.tsx`, `verify.tsx`, `site-shell.tsx`, `auth-modals.tsx`.
   - Verify by toggling language and grep for hardcoded latin/CJK leftovers.

5. **Taiwan Map + Event Card Images**
   - Replace the abstract map in `/governance` with an inline SVG Taiwan outline; plot pins for Yilan / Hualien / Nantou / Pingtung / Taitung / Chiayi with hover Popover showing name, support amount, CO2 saved, 2-line blurb, thumbnail.
   - Event cards: add `aspect-video` cover image (generate 3 images: farm tour, tasting workshop, seminar), overlay status badge top-right, `hover:scale-105 transition-transform duration-300`.

## Part B — Production infra (needs decisions before I touch it)

Items 1–3 and 5 of your "Critical Bug Fixes" list ask for **real database persistence and real Gmail delivery**. Right now the whole app runs on `localStorage` (`src/lib/auth.tsx`). Wiring real accounts + real email requires enabling **Lovable Cloud** (managed Supabase-backed backend + email service), then:

- Migrate `AuthProvider` from localStorage to Supabase Auth (real signup, OTP/magic-link email verification to actual Gmail inbox).
- Create `profiles`, `verification_steps`, `trial_settings`, `admin_notes` tables with RLS.
- Move Trial-days edits, verification step writes, and admin approvals to server functions so the admin table shows live front-end submissions.
- Configure a real email domain (Lovable Emails) or connect Resend for transactional step-completion notifications.
- Allow editing prior steps until final approval (unlock state on `profiles.status !== 'approved'`).

**This is a big shift and unlocks real cost/quota/domain setup.** I want your go-ahead before enabling Cloud, because:
- You'll need to verify a sender domain for real Gmail delivery (or accept default sender until then).
- All existing demo/local accounts (`admin@coop.tw`, `member@coop.tw`, `demo@tensqmiles.coop`) will need to be recreated as real Supabase users.
- Any data currently in your browser's localStorage will not migrate.

## Questions before I proceed

1. Should I do **Part A now** (frontend + i18n + map + trial-editor + universal directory, all still on the current localStorage mock) and treat **Part B as a follow-up** once you're ready to enable Lovable Cloud? — recommended, keeps this turn shippable.
2. Or enable Lovable Cloud **now** and do Part A + Part B together (bigger change, real emails require you to add a sender domain)?
3. For the real email provider — use **Lovable Emails** (built-in, needs a domain you own) or **Resend** (needs a Resend API key)?

Tell me 1 or 2, and if 2 tell me which email provider, and I'll execute.