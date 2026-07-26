
This is a large, multi-track request. I've grouped it into 6 tracks. Tracks 1–5 are pure frontend and I can ship them in one pass on the current localStorage stack. Track 6 requires enabling Lovable Cloud (Supabase) — one-way infra change — so I want your go-ahead before doing it.

## Track 1 — /onboarding rebuild (frontend)
- Rewrite `src/routes/onboarding.tsx` as 4-step full-page flow.
- Step 1: Name / 身分證字號 / Email → "發送驗證碼" → 6-digit input (accepts `123456`), 5-min expiry countdown + 60s resend cooldown (reuse existing OTP UX).
- Step 2: 5 lecture cards (exact copy you supplied), swipeable, top progress bar `1/5`, Next button locked 3s per card.
- Step 3: Pool of 8 quiz questions (exact copy), pick 3 at random with no repeats in session, must get 3/3, on any wrong answer show "答錯囉！" and reshuffle 3 new ones.
- Step 4: Confetti + "恭喜通過入社教育訓練！系統已為您開通 30 天體驗帳號！" + CTA "去逛預購商品" → `/coop`. Mints trial via existing `registerTrial`.
- Homepage "體驗帳號 / 立即體驗" already routes to `/onboarding` — verify.

## Track 2 — Labor Points + Wallet (frontend, localStorage)
- Extend `src/lib/auth.tsx` with `laborPoints`, `laborLog[]`, `walletBalance`, `walletLog[]` per user + admin adjust methods.
- Member center (`src/routes/trial.tsx` or new `/account`): "勞動積分" block with log drawer; "電子錢包" block with 儲值 modal (500/1000/2000, mock gateway).
- Checkout page (part of `src/routes/coop.tsx` cart): add "使用勞動積分折抵" checkbox+input (1pt=1元, capped at balance/subtotal); add "儲值金餘額支付" payment option, disabled + tooltip if insufficient.
- Admin: new page `src/routes/admin.wallet.tsx` — table of members with inline +/- points and +/- wallet with note; wire into admin nav.

## Track 3 — 預購截單 + 取貨防呆 + 逾期轉現貨 (frontend)
- Add per-product `cutoffAt` (next Tuesday 12:00 rolling). Top-of-page countdown component on `/coop` and product cards.
- When `now > cutoffAt`: buttons swap to disabled "本週已截單／下週請早".
- Order tracking (member center orders view): if status = 待取貨 and now within pickup window, yellow warning banner "請記得於今日 20:00 前至清大站取貨…".
- Admin preorders (`src/routes/admin.preorders.tsx`): "一鍵轉為逾期現貨" button on overdue 待取貨 orders → status → 逾期未取, add qty back into a `walkInStock` map.

## Track 4 — 值班學生大使工作台 (admin)
- New `src/routes/admin.packing.tsx`: date picker → group all pickup-on-date orders by member → card per member with checkboxes per item → "配貨完成" state when all checked (persist to localStorage).
- New `src/routes/admin.pos.tsx`: grid of `walkInStock` items → click to add to right-side cart → 現金 / 現場掃碼 → 確認收單 decrements stock + appends transaction to a `posTx[]` log.

## Track 5 — 真實台灣互動地圖 (frontend)
- `bun add leaflet react-leaflet @types/leaflet`.
- Replace SVG in `src/routes/governance.tsx` producer map section with `<MapContainer>` centered at `[23.9738, 120.9820]`, CartoDB Positron tiles.
- Producers list (with real lat/lng for 阿里山/花蓮玉里/西螺/南投埔里/東港/卑南/三星) rendered as colored `CircleMarker`s (green=農場, blue=職人, purple=公益).
- Click marker → highlight right-side card; click list item → `map.flyTo(latlng)`.
- Load Leaflet CSS in `__root.tsx` head; import map component behind `<ClientOnly>` / dynamic import to avoid SSR window errors.

## Track 6 — 許願清單 + 即時通知中心 (REQUIRES LOVABLE CLOUD)
Needs Supabase. Will enable Cloud, then:
- Migration: `wishes` (id, user_id, title, description, location, created_at) + `notifications` (id, type, title, content, is_read, created_at) with RLS + grants + realtime publication.
- Frontend: "許願" modal writes to `wishes`; DB trigger (or client insert) also inserts a `notification`.
- Admin: bell icon in `SiteNav` with unread red dot; dropdown of latest 10; new `src/routes/admin.notifications.tsx` list page; `src/routes/admin.wishes.tsx` list page with status.
- Realtime: `supabase.channel().on('postgres_changes', …)` subscription in admin layout → sonner toast "收到一筆新的許願請求！" + short WebAudio beep.

## Technical notes
- All new strings bilingual through `src/lib/i18n.tsx` — strict isolation (no English in zh mode).
- Leaflet SSR: `React.lazy(() => import('@/components/producer-map'))` inside `<ClientOnly>`.
- Confetti: reuse existing lightweight canvas or `bun add canvas-confetti`.
- Cutoff time: `getNextTuesdayNoon()` helper in `src/lib/cutoff.ts`.

## What I need from you
Pick one:
- **"All, enable Cloud"** — I do Tracks 1–6, enable Lovable Cloud now.
- **"1–5 only"** — I ship Tracks 1–5 this turn, skip 許願/通知 realtime.
- **"Just Track N"** — pick a subset and I'll ship only those.

Recommended: **"All, enable Cloud"** — the wishes/notifications realtime is the module that most needs a real backend, and doing it in one pass avoids a second infra migration.
