import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "會員教育啟蒙 · Member Onboarding — 十圓方里" },
      { name: "description", content: "4-step gamified onboarding: identity, OTP, co-op lectures, and a randomized quiz that unlocks your 30-day trial pass." },
      { property: "og:title", content: "Co-op Member Onboarding — Ten Sq Miles" },
      { property: "og:description", content: "Learn the co-op basics, verify your identity, and activate a 30-day trial with a NT$100 welcome voucher." },
    ],
  }),
  component: OnboardingPage,
});

// ---------- helpers ----------
function digits6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- data ----------
const LECTURES = [
  {
    emoji: "🗳️",
    zh: { title: "民主治理 · 1 社員 1 票", body: "無論你認購 1 股或 100 股，社員大會上每人擁有一票。理事會由社員直選，決策全數公開。" },
    en: { title: "Democratic Governance", body: "Whether you hold 1 share or 100, every member has exactly one vote at the General Meeting. The board is elected directly by members." },
    gradient: "from-primary/20 via-accent/10 to-cyber/10",
  },
  {
    emoji: "💰",
    zh: { title: "結餘分配 · 依消費貢獻", body: "年度結餘的 50% 依照社員的消費貢獻度回饋，不是依股份多寡。買越多，回饋越多；不是股東拿走全部。" },
    en: { title: "Surplus by Contribution", body: "50% of the annual surplus is distributed based on your purchase contribution — not by shareholding. Buy more, get more back." },
    gradient: "from-accent/20 via-primary/10 to-fuchsia-200/40",
  },
  {
    emoji: "🌱",
    zh: { title: "免稅一級農產 · 支持在地", body: "一級農產品在合作社內部交易免營業稅，價格更透明。非社員銷售嚴格控制在 30% 以下。" },
    en: { title: "Tax-Exempt Primary Goods", body: "Primary agricultural goods are tax-exempt for members. Non-member sales are strictly capped below 30% of total revenue." },
    gradient: "from-fuchsia-200/40 via-primary/10 to-accent/20",
  },
];

const QUIZ_POOL = [
  {
    zh: "合作社的結餘主要如何分配？",
    en: "How is co-op surplus primarily distributed?",
    options: [
      { zh: "按股份多寡", en: "By share count", correct: false },
      { zh: "依社員消費貢獻度", en: "By member purchase contribution", correct: true },
      { zh: "全數保留為公積金", en: "Fully retained as reserve", correct: false },
    ],
  },
  {
    zh: "非社員銷售佔比的法定上限？",
    en: "Legal cap on non-member sales?",
    options: [
      { zh: "10%", en: "10%", correct: false },
      { zh: "30%", en: "30%", correct: true },
      { zh: "50%", en: "50%", correct: false },
    ],
  },
  {
    zh: "民主治理的核心原則？",
    en: "Core principle of democratic governance?",
    options: [
      { zh: "股份越多、票越多", en: "More shares = more votes", correct: false },
      { zh: "1 社員 1 票", en: "1 member, 1 vote", correct: true },
      { zh: "理事會全權決定", en: "Board decides all", correct: false },
    ],
  },
  {
    zh: "一級農產品在合作社內部交易的稅務？",
    en: "Tax treatment of primary agricultural goods?",
    options: [
      { zh: "免營業稅", en: "Tax-exempt", correct: true },
      { zh: "應稅 5%", en: "Taxable 5%", correct: false },
      { zh: "應稅 10%", en: "Taxable 10%", correct: false },
    ],
  },
  {
    zh: "合作資本／公積金佔結餘比例？",
    en: "Reserve fund share of surplus?",
    options: [
      { zh: "20%", en: "20%", correct: false },
      { zh: "50%", en: "50%", correct: true },
      { zh: "80%", en: "80%", correct: false },
    ],
  },
  {
    zh: "體驗通行證有效期為？",
    en: "Trial pass duration?",
    options: [
      { zh: "7 天", en: "7 days", correct: false },
      { zh: "30 天", en: "30 days", correct: true },
      { zh: "90 天", en: "90 days", correct: false },
    ],
  },
  {
    zh: "誰有權投票理事？",
    en: "Who can vote for the board?",
    options: [
      { zh: "所有已驗證社員", en: "All verified members", correct: true },
      { zh: "僅前 10 大股東", en: "Only top 10 shareholders", correct: false },
      { zh: "僅理事會提名者", en: "Only board nominees", correct: false },
    ],
  },
  {
    zh: "預購商品什麼時候扣款？", en: "When are pre-orders charged?",
    options: [
      { zh: "訂單成立時支付訂金／全額", en: "Deposit/full at order time", correct: true },
      { zh: "貨到時付款", en: "On delivery", correct: false },
      { zh: "月結", en: "Monthly billing", correct: false },
    ],
  },
];

function pick3<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 3);
}

// ---------- page ----------
function OnboardingPage() {
  const { locale } = useI18n();
  const [step, setStep] = useState(1);

  // step 1 state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpNow, setOtpNow] = useState(Date.now());
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setOtpNow(Date.now());
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const otpSecondsLeft = otpExpiresAt ? Math.max(0, Math.ceil((otpExpiresAt - otpNow) / 1000)) : 0;
  const otpMinLabel = `${Math.floor(otpSecondsLeft / 60)}:${(otpSecondsLeft % 60).toString().padStart(2, "0")}`;

  function sendOtp() {
    const code = digits6();
    setOtpSent(code);
    setOtpInput("");
    setOtpError(null);
    setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
    setResendCooldown(60);
  }

  function verifyOtp() {
    if (!otpSent) return;
    if (otpSecondsLeft <= 0) {
      setOtpError(locale === "zh" ? "驗證碼已過期，請重新發送。" : "Code expired. Please resend.");
      return;
    }
    if (otpInput.trim() !== otpSent) {
      setOtpError(locale === "zh" ? "驗證碼錯誤，請再試一次。" : "Wrong code. Try again.");
      return;
    }
    setOtpError(null);
    setStep(2);
  }

  // step 2: lectures with 3s read-lock
  const [lectureIdx, setLectureIdx] = useState(0);
  const [readSeconds, setReadSeconds] = useState(0);
  useEffect(() => {
    if (step !== 2) return;
    setReadSeconds(0);
    const t = setInterval(() => setReadSeconds((s) => Math.min(3, s + 1)), 1000);
    return () => clearInterval(t);
  }, [step, lectureIdx]);

  // step 3: quiz
  const questions = useMemo(() => pick3(QUIZ_POOL), [step === 3]);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);

  function submitAnswer() {
    if (picked === null) return;
    const correct = questions[qIdx].options[picked].correct;
    if (!correct) {
      setWrong(true);
      return;
    }
    setWrong(false);
    if (qIdx === questions.length - 1) {
      setStep(4);
    } else {
      setQIdx(qIdx + 1);
      setPicked(null);
    }
  }

  // step 4: activation
  const { registerTrial, openLogin } = useAuth();
  const router = useRouter();
  const [activated, setActivated] = useState<{ email: string; password: string } | null>(null);
  const [activationError, setActivationError] = useState<string | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (step !== 4 || firedRef.current) return;
    firedRef.current = true;
    // confetti
    setTimeout(() => confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } }), 200);
    setTimeout(() => confetti({ particleCount: 100, spread: 120, angle: 60, origin: { x: 0, y: 0.7 } }), 500);
    setTimeout(() => confetti({ particleCount: 100, spread: 120, angle: 120, origin: { x: 1, y: 0.7 } }), 800);
    // register trial user
    const generatedPw = "coop-" + Math.random().toString(36).slice(2, 8);
    const r = registerTrial({ name, email, phone, password: generatedPw });
    if (r.ok) {
      setActivated({ email, password: generatedPw });
    } else {
      setActivationError(r.error);
    }
  }, [step]);

  const stepLabels: [string, string][] = [
    ["身份驗證", "Identity"],
    ["社務教育", "Lectures"],
    ["合作社小考", "Quiz"],
    ["啟用通行證", "Activate"],
  ];

  return (
    <SiteShell>
      <PageHeader
        eyebrow={locale === "zh" ? "會員教育啟蒙 · 4 步驟" : "Member Onboarding · 4 steps"}
        title={locale === "zh" ? "3 分鐘認識合作社，領取 NT$100 迎新券" : "Learn the co-op in 3 minutes, unlock a NT$100 welcome voucher"}
        subtitle={locale === "zh" ? "OTP 驗證 → 民主／稅務短講 → 隨機小考 → 30 天體驗通行證" : "OTP → Micro-lectures → Randomized quiz → 30-day trial pass"}
      />

      {/* Stepper */}
      <div className="mb-8 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-white/70 p-2 shadow-soft backdrop-blur">
        {stepLabels.map(([zh, en], i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div
              key={n}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-center transition-all ${
                active ? "bg-primary/10 ring-1 ring-primary/30" : done ? "bg-primary/5" : ""
              }`}
            >
              <span
                className={`mb-1 grid size-7 place-items-center rounded-full font-mono text-xs ${
                  done ? "bg-primary text-primary-foreground" : active ? "bg-primary/80 text-primary-foreground" : "bg-surface text-muted-foreground"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {locale === "zh" ? zh : en}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
          <h2 className="text-xl font-bold">{locale === "zh" ? "① 實名與 OTP 驗證" : "① Identity & OTP"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh"
              ? "填寫真實姓名、Email 與手機，系統將寄出 6 位數驗證碼（5 分鐘內有效）。"
              : "Enter your real name, email and phone. We'll send a 6-digit code valid for 5 minutes."}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "姓名" : "Full name"}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder={locale === "zh" ? "王小明" : "Alex Chen"}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="you@gmail.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "手機" : "Phone"}
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="09xx-xxx-xxx"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              disabled={!name || !email || !phone || (resendCooldown > 0 && !!otpSent)}
              onClick={sendOtp}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {otpSent
                ? resendCooldown > 0
                  ? locale === "zh" ? `重新寄送 (${resendCooldown}s)` : `Resend (${resendCooldown}s)`
                  : locale === "zh" ? "重新寄送驗證碼" : "Resend code"
                : locale === "zh" ? "寄送驗證碼" : "Send OTP"}
            </button>
            {otpSent && (
              <span className={`inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1.5 font-mono text-xs ${otpSecondsLeft <= 30 ? "text-red-600" : "text-muted-foreground"}`}>
                ⏱ {locale === "zh" ? "剩餘" : "Expires in"} {otpMinLabel}
              </span>
            )}
          </div>

          {otpSent && (
            <div className="mt-5 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                {locale === "zh" ? "開發模式測試信箱 — 模擬 Gmail 收件" : "Dev inbox — mock Gmail delivery"}
              </p>
              <p className="mb-3 text-sm">
                {locale === "zh" ? "您的驗證碼是：" : "Your verification code is:"}{" "}
                <span className="rounded bg-white px-2 py-1 font-mono text-lg font-bold tracking-widest text-primary">{otpSent}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-40 rounded-lg border border-border bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-primary"
                />
                <button
                  onClick={verifyOtp}
                  className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background hover:brightness-110"
                >
                  {locale === "zh" ? "驗證並繼續" : "Verify & continue"}
                </button>
              </div>
              {otpError && (
                <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{otpError}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">
              {locale === "zh" ? `② 社務教育短講 ${lectureIdx + 1} / ${LECTURES.length}` : `② Lectures ${lectureIdx + 1} / ${LECTURES.length}`}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {readSeconds < 3
                ? locale === "zh" ? `解鎖中 ${readSeconds}/3s` : `Reading ${readSeconds}/3s`
                : locale === "zh" ? "✓ 可繼續" : "✓ Unlocked"}
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{ width: `${((lectureIdx + Math.min(readSeconds, 3) / 3) / LECTURES.length) * 100}%` }}
            />
          </div>

          <article
            className={`mt-6 rounded-2xl border border-border bg-gradient-to-br ${LECTURES[lectureIdx].gradient} p-8 shadow-soft`}
          >
            <div className="text-5xl">{LECTURES[lectureIdx].emoji}</div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">
              {locale === "zh" ? LECTURES[lectureIdx].zh.title : LECTURES[lectureIdx].en.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-foreground/80">
              {locale === "zh" ? LECTURES[lectureIdx].zh.body : LECTURES[lectureIdx].en.body}
            </p>
          </article>

          <div className="mt-6 flex items-center justify-between">
            <button
              disabled={lectureIdx === 0}
              onClick={() => setLectureIdx((i) => Math.max(0, i - 1))}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              ← {locale === "zh" ? "上一張" : "Prev"}
            </button>
            {lectureIdx < LECTURES.length - 1 ? (
              <button
                disabled={readSeconds < 3}
                onClick={() => setLectureIdx((i) => i + 1)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                {locale === "zh" ? "下一張" : "Next"} →
              </button>
            ) : (
              <button
                disabled={readSeconds < 3}
                onClick={() => setStep(3)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {locale === "zh" ? "開始小考 →" : "Start quiz →"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8">
          <h2 className="text-xl font-bold">
            {locale === "zh" ? `③ 隨機小考 Q${qIdx + 1} / ${questions.length}` : `③ Randomized quiz Q${qIdx + 1} / ${questions.length}`}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "zh" ? "從 8 題題庫中隨機抽 3 題，需全部答對才能啟用通行證。" : "3 random from 8 — must be 100% correct to activate."}
          </p>

          <div className="mt-5 rounded-xl border border-border bg-white/70 p-5">
            <p className="text-base font-semibold">
              {locale === "zh" ? questions[qIdx].zh : questions[qIdx].en}
            </p>
            <div className="mt-4 space-y-2">
              {questions[qIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { setPicked(i); setWrong(false); }}
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-all ${
                    picked === i ? "border-primary bg-primary/5 font-semibold" : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  {locale === "zh" ? opt.zh : opt.en}
                </button>
              ))}
            </div>
            {wrong && (
              <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                {locale === "zh" ? "❌ 答錯了，請重新選擇。" : "❌ Wrong answer. Please try again."}
              </p>
            )}
            <button
              disabled={picked === null}
              onClick={submitAnswer}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
            >
              {qIdx === questions.length - 1
                ? locale === "zh" ? "提交並啟用通行證 🎉" : "Submit & activate 🎉"
                : locale === "zh" ? "下一題 →" : "Next →"}
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-8 text-center shadow-elevated backdrop-blur md:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-3xl text-primary-foreground shadow-glow">
            🎉
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            {locale === "zh" ? "歡迎加入十圓方里！" : "Welcome to Ten Sq Miles!"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "zh"
              ? "你的 30 天體驗通行證已啟用，並獲得 NT$100 迎新券（可折抵首次預購）。"
              : "Your 30-day trial pass is active, plus a NT$100 welcome voucher for your first pre-order."}
          </p>

          {activated && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-white/80 p-5 text-left shadow-soft">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "自動建立的登入憑證" : "Auto-generated login"}
              </p>
              <p className="mt-2 text-sm">
                Email: <span className="font-mono font-bold">{activated.email}</span>
              </p>
              <p className="text-sm">
                {locale === "zh" ? "臨時密碼" : "Password"}: <span className="font-mono font-bold">{activated.password}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {locale === "zh" ? "請截圖保存；下次登入可於個人頁面更改密碼。" : "Screenshot this; you can change it later in your profile."}
              </p>
            </div>
          )}
          {activationError && (
            <p className="mx-auto mt-4 max-w-md rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              {activationError}
            </p>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "迎新券" : "Voucher"}
              </p>
              <p className="mt-1 text-2xl font-bold text-primary">NT$100</p>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "通行證期限" : "Trial length"}
              </p>
              <p className="mt-1 text-2xl font-bold">30d</p>
            </div>
            <div className="rounded-xl border border-border bg-white/70 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "小考成績" : "Quiz score"}
              </p>
              <p className="mt-1 text-2xl font-bold">100%</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.navigate({ to: "/coop" })}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
            >
              {locale === "zh" ? "開始逛共同購買 →" : "Browse the co-op →"}
            </button>
            <button
              onClick={openLogin}
              className="rounded-full border border-border bg-white/70 px-6 py-2.5 text-sm font-semibold"
            >
              {locale === "zh" ? "登入帳號" : "Sign in"}
            </button>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
