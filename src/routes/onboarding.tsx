import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "入社教育訓練 · Member Onboarding — 十圓方里" },
      { name: "description", content: "四步驟入社教育訓練：實名驗證、合作社十講、隨機理念快問快答，通關後開通 30 天體驗帳號。" },
      { property: "og:title", content: "Co-op Member Onboarding — Ten Sq Miles" },
      { property: "og:description", content: "Verify identity, read the 5 co-op lectures, pass the random quiz, activate your 30-day trial pass." },
    ],
  }),
  component: OnboardingPage,
});

function digits6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------- Lecture cards (Cooperative 10 Lectures — 5 curated) ----------
type Lecture = {
  emoji: string;
  gradient: string;
  zh: { title: string; body: string };
  en: { title: string; body: string };
};

const LECTURES: Lecture[] = [
  {
    emoji: "🗳️",
    gradient: "from-primary/20 via-accent/10 to-cyber/10",
    zh: {
      title: "一人一票，營業不營利",
      body: "合作社是『認人不認錢』的民主組織。無論出資多寡，每位社員在『社員大會』（合作社最高權力機關）都擁有一人一票的平權決定權。結餘不分給大股東，而是回饋給社員與社區。",
    },
    en: {
      title: "One member, one vote — not for private profit",
      body: "A co-op is a democratic organisation that recognises people, not capital. Regardless of shareholding, every member has one equal vote at the General Meeting (the highest authority). Surplus is returned to members and the community, not to major shareholders.",
    },
  },
  {
    emoji: "👥",
    gradient: "from-accent/20 via-primary/10 to-fuchsia-200/40",
    zh: {
      title: "社員不是顧客，而是主人",
      body: "一般商店會員只是有折價券的『顧客』。但合作社社員兼具『使用者、擁有者、共創者與治理者』的多重身分，可以主動在系統『許願／提案』想要的永續商品或走讀活動。",
    },
    en: {
      title: "Members are owners, not just customers",
      body: "Store loyalty members are customers with coupons. Co-op members are simultaneously users, owners, co-creators and governors — you can post wishes and propose the sustainable goods and events you want.",
    },
  },
  {
    emoji: "🎓",
    gradient: "from-fuchsia-200/40 via-primary/10 to-accent/20",
    zh: {
      title: "認購社股，學生特別保護",
      body: "加入合作社需認購社股（每股 100 元，一般人上限 100 股）。為了確保平權、防止資本支配，在校全職學生身份的社員，每人至多只能認購 10 股（共 1,000 元）。",
    },
    en: {
      title: "Share subscription — with student safeguards",
      body: "Joining requires buying co-op shares (NT$100 each, capped at 100 shares for ordinary members). To prevent capital dominance, full-time student members may only subscribe up to 10 shares (NT$1,000).",
    },
  },
  {
    emoji: "💰",
    gradient: "from-primary/15 via-white to-accent/15",
    zh: {
      title: "結餘 30% 提撥公積金，50% 消費回饋",
      body: "合作社年終結算有結餘時，依法必須提撥 30% 作為公積金強化營運。而高達 50% 的結餘會作為『社員分配金』，依照每位社員的『交易額（消費貢獻度）比例』分紅回饋！",
    },
    en: {
      title: "30% to reserve fund, 50% back to buyers",
      body: "When there is an annual surplus, 30% is legally allocated to the reserve fund to strengthen operations. Up to 50% is distributed to members as dividends — in proportion to each member's purchase contribution.",
    },
  },
  {
    emoji: "🌱",
    gradient: "from-accent/15 via-primary/10 to-fuchsia-200/30",
    zh: {
      title: "社員專屬免稅福利",
      body: "一級農產品（如米、青菜）不論是誰買都免稅。但如果是加工食品（如健康便當、手工醬油），只有完成入社的『正式社員』才享有免徵 5% 營業稅的法規優惠！",
    },
    en: {
      title: "Members-only tax exemption",
      body: "Primary agricultural goods (rice, vegetables) are tax-exempt for everyone. But for processed foods (healthy bento, handcrafted soy sauce), only verified members enjoy the statutory 5% business-tax exemption.",
    },
  },
];

// ---------- Quiz pool (8 questions per spec) ----------
type Question = {
  zh: string;
  en: string;
  options: { zh: string; en: string; correct: boolean }[];
};

const QUIZ_POOL: Question[] = [
  {
    zh: "十里方圓合作社的最高權力決策機關是誰？",
    en: "Who is the highest decision-making body of the co-op?",
    options: [
      { zh: "理事主席", en: "The board chair", correct: false },
      { zh: "社員大會", en: "The General Meeting of members", correct: true },
    ],
  },
  {
    zh: "在校學生加入合作社，股金認購上限是多少？",
    en: "What is the share-subscription cap for full-time students?",
    options: [
      { zh: "學生上限 10 股共 1,000 元以確保平等", en: "Capped at 10 shares (NT$1,000) to ensure equality", correct: true },
      { zh: "無上限", en: "No cap", correct: false },
    ],
  },
  {
    zh: "合作社的決策投票機制，和一般股份有限公司最大的差異是什麼？",
    en: "How does co-op voting differ from a corporation?",
    options: [
      { zh: "誰出錢多決定一切", en: "Bigger capital gets more power", correct: false },
      { zh: "認人不認錢，每位社員都是『一人一票』的平權參與", en: "People not money — each member gets one equal vote", correct: true },
    ],
  },
  {
    zh: "購買合作社的『加工食品（如便當、醬油）』，誰享有免徵 5% 營業稅福利？",
    en: "Who is exempt from 5% business tax on processed foods?",
    options: [
      { zh: "只有完成入社的正式社員", en: "Only verified full members", correct: true },
      { zh: "所有人", en: "Everyone", correct: false },
    ],
  },
  {
    zh: "在十里方圓合作社中，社員的身分和一般商店的『顧客』有何不同？",
    en: "How does a co-op member differ from a store customer?",
    options: [
      { zh: "只是有打折優惠的消費者", en: "Just a discount-holding consumer", correct: false },
      { zh: "同時是合作社的『使用者、擁有者、共創者與治理者』", en: "Simultaneously user, owner, co-creator and governor", correct: true },
    ],
  },
  {
    zh: "合作社年底的結餘如何分配？",
    en: "How is the annual surplus distributed?",
    options: [
      { zh: "依據社員的『消費貢獻度』按比例回饋", en: "Distributed by each member's purchase contribution", correct: true },
      { zh: "按出資比例分給大股東", en: "By share ratio to major shareholders", correct: false },
    ],
  },
  {
    zh: "合作社被稱為『營業不營利』的組織，這代表什麼意思？",
    en: "What does 'operate but not for private profit' mean?",
    options: [
      { zh: "合作社只能賠錢不能有收入", en: "The co-op must never earn revenue", correct: false },
      { zh: "產生結餘不是為大股東賺錢，而是回饋給社員與社區", en: "Surplus isn't for shareholders — it returns to members and community", correct: true },
    ],
  },
  {
    zh: "根據章程，合作社提撥『公積金』的比例為多少？",
    en: "What share of surplus goes to the reserve fund?",
    options: [
      { zh: "30%", en: "30%", correct: true },
      { zh: "10%", en: "10%", correct: false },
    ],
  },
];

function pick3<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 3);
}

function shuffleOptions(q: Question): Question {
  const opts = [...q.options];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { ...q, options: opts };
}

function OnboardingPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { registerTrial, openLogin } = useAuth();
  const [step, setStep] = useState(1);

  // ---------- Step 1: identity + OTP ----------
  const [name, setName] = useState("");
  const [idNo, setIdNo] = useState("");
  const [email, setEmail] = useState("");
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
      setOtpError(locale === "zh" ? "驗證碼已過期，請重新發送。" : "Code expired. Please request a new code.");
      return;
    }
    // Accept mock 123456 OR the actual generated code
    const val = otpInput.trim();
    if (val !== otpSent && val !== "123456") {
      setOtpError(locale === "zh" ? "驗證碼錯誤，請再試一次。" : "Wrong code. Try again.");
      return;
    }
    setOtpError(null);
    setStep(2);
  }

  // ---------- Step 2: swipeable lectures w/ 3s read-lock ----------
  const [lectureIdx, setLectureIdx] = useState(0);
  const [readSeconds, setReadSeconds] = useState(0);
  useEffect(() => {
    if (step !== 2) return;
    setReadSeconds(0);
    const t = setInterval(() => setReadSeconds((s) => Math.min(3, s + 1)), 1000);
    return () => clearInterval(t);
  }, [step, lectureIdx]);

  // ---------- Step 3: randomized quiz ----------
  const [quizAttempt, setQuizAttempt] = useState(0); // bump to reshuffle
  const questions = useMemo(
    () => pick3(QUIZ_POOL).map(shuffleOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step === 3, quizAttempt],
  );
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [failModal, setFailModal] = useState(false);

  function submitAnswer() {
    if (picked === null) return;
    const correct = questions[qIdx].options[picked].correct;
    if (!correct) {
      setFailModal(true);
      return;
    }
    if (qIdx === questions.length - 1) {
      setStep(4);
    } else {
      setQIdx(qIdx + 1);
      setPicked(null);
    }
  }

  function restartQuiz() {
    setFailModal(false);
    setQIdx(0);
    setPicked(null);
    setQuizAttempt((n) => n + 1);
  }

  // ---------- Step 4: activation ----------
  const [activated, setActivated] = useState<{ email: string; password: string } | null>(null);
  const [activationError, setActivationError] = useState<string | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (step !== 4 || firedRef.current) return;
    firedRef.current = true;
    setTimeout(() => confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } }), 200);
    setTimeout(() => confetti({ particleCount: 100, spread: 120, angle: 60, origin: { x: 0, y: 0.7 } }), 500);
    setTimeout(() => confetti({ particleCount: 100, spread: 120, angle: 120, origin: { x: 1, y: 0.7 } }), 800);
    const generatedPw = "coop-" + Math.random().toString(36).slice(2, 8);
    const phone = "09" + Math.floor(10000000 + Math.random() * 89999999).toString();
    const r = registerTrial({ name, email, phone, password: generatedPw });
    if (r.ok) setActivated({ email, password: generatedPw });
    else setActivationError(r.error);
  }, [step]);

  const stepLabels: [string, string][] = [
    ["身分驗證", "Identity"],
    ["合作社十講", "Lectures"],
    ["理念快問快答", "Quiz"],
    ["解鎖體驗", "Activate"],
  ];

  const canSendOtp = name.trim() && idNo.trim() && email.trim();

  return (
    <SiteShell>
      <PageHeader
        eyebrow={locale === "zh" ? "入社教育訓練 · 4 步驟闖關" : "Member Onboarding · 4 steps"}
        title={locale === "zh" ? "3 分鐘認識合作社，解鎖 30 天體驗帳號" : "Learn the co-op in 3 minutes, unlock a 30-day trial pass"}
        subtitle={locale === "zh" ? "實名驗證 → 合作社十講 → 隨機小考 → 30 天通行證＋NT$100 迎新券" : "Identity + OTP → Lectures → Random quiz → 30-day trial + NT$100 voucher"}
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
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8 animate-fade-in">
          <h2 className="text-xl font-bold">{locale === "zh" ? "① 防弊身分驗證" : "① Identity & Email verification"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh"
              ? "為避免冒用他人身分證註冊，請填寫真實資料，系統將寄出 6 位數驗證碼（5 分鐘內有效）。"
              : "To prevent identity theft, please fill in real details. We'll send a 6-digit code valid for 5 minutes."}
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
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "身分證字號 / 學號" : "ID No. / Student ID"}
              </span>
              <input
                value={idNo}
                onChange={(e) => setIdNo(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="A123456789"
                maxLength={20}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "電子信箱" : "Email"}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="you@gmail.com"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              disabled={!canSendOtp || (resendCooldown > 0 && !!otpSent)}
              onClick={sendOtp}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {otpSent
                ? resendCooldown > 0
                  ? locale === "zh" ? `重新寄送 (${resendCooldown}s)` : `Resend (${resendCooldown}s)`
                  : locale === "zh" ? "重新寄送驗證碼" : "Resend code"
                : locale === "zh" ? "發送驗證碼" : "Send verification code"}
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
                <span className="ml-2 text-xs text-muted-foreground">
                  {locale === "zh" ? "（或輸入 123456 快速通過）" : "(or enter 123456 to fast-pass)"}
                </span>
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
                  disabled={otpSecondsLeft <= 0}
                  className="rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {locale === "zh" ? "驗證並繼續" : "Verify & continue"}
                </button>
                {otpSecondsLeft <= 0 && (
                  <span className="text-xs font-semibold text-red-600 line-through">
                    {locale === "zh" ? "驗證碼已過期" : "Code expired"}
                  </span>
                )}
              </div>
              {otpError && (
                <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{otpError}</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* STEP 2 — swipeable lecture cards */}
      {step === 2 && (
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8 animate-fade-in">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">
              {locale === "zh" ? `② 合作社十講 · 進度 ${lectureIdx + 1} / ${LECTURES.length}` : `② Co-op lectures · Progress ${lectureIdx + 1} / ${LECTURES.length}`}
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {readSeconds < 3
                ? locale === "zh" ? `閱讀中 ${readSeconds}/3s` : `Reading ${readSeconds}/3s`
                : locale === "zh" ? "✓ 可繼續" : "✓ Unlocked"}
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
              style={{ width: `${((lectureIdx + Math.min(readSeconds, 3) / 3) / LECTURES.length) * 100}%` }}
            />
          </div>

          {/* Card stack indicator */}
          <div className="mt-4 flex justify-center gap-1.5">
            {LECTURES.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-8 rounded-full transition-all ${i < lectureIdx ? "bg-primary" : i === lectureIdx ? "bg-primary/70" : "bg-border"}`}
              />
            ))}
          </div>

          <article
            key={lectureIdx}
            className={`mt-6 rounded-2xl border border-border bg-gradient-to-br ${LECTURES[lectureIdx].gradient} p-8 shadow-soft animate-scale-in`}
          >
            <div className="flex items-start justify-between">
              <div className="text-5xl">{LECTURES[lectureIdx].emoji}</div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/70">
                Lecture {lectureIdx + 1} / {LECTURES.length}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
              {locale === "zh" ? LECTURES[lectureIdx].zh.title : LECTURES[lectureIdx].en.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-foreground/80 md:text-lg">
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
                title={readSeconds < 3 ? (locale === "zh" ? "請閱讀完再繼續" : "Read for 3s to unlock") : ""}
              >
                {locale === "zh" ? "下一張" : "Next"} →
              </button>
            ) : (
              <button
                disabled={readSeconds < 3}
                onClick={() => setStep(3)}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
              >
                {locale === "zh" ? "進入理念快問快答 →" : "Start the quiz →"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* STEP 3 — randomized quiz */}
      {step === 3 && (
        <section className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft backdrop-blur md:p-8 animate-fade-in">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">
              {locale === "zh" ? `③ 隨機理念快問快答 Q${qIdx + 1} / ${questions.length}` : `③ Random quick quiz Q${qIdx + 1} / ${questions.length}`}
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground">
              {locale === "zh" ? `第 ${quizAttempt + 1} 輪` : `Attempt ${quizAttempt + 1}`}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "zh" ? "從 8 題題庫中隨機抽 3 題，需全部答對才能開通體驗帳號。" : "3 random from 8 — must be 100% correct to activate."}
          </p>

          <div className="mt-5 rounded-xl border border-border bg-white/70 p-5">
            <p className="text-base font-semibold md:text-lg">
              {locale === "zh" ? questions[qIdx].zh : questions[qIdx].en}
            </p>
            <div className="mt-4 space-y-2">
              {questions[qIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                    picked === i ? "border-primary bg-primary/5 font-semibold" : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full border border-current font-mono text-[10px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {locale === "zh" ? opt.zh : opt.en}
                </button>
              ))}
            </div>
            <button
              disabled={picked === null}
              onClick={submitAnswer}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-40"
            >
              {qIdx === questions.length - 1
                ? locale === "zh" ? "提交並解鎖體驗 🎉" : "Submit & unlock 🎉"
                : locale === "zh" ? "下一題 →" : "Next →"}
            </button>
          </div>

          {/* Fail modal */}
          {failModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="max-w-sm rounded-2xl border border-border bg-white p-6 text-center shadow-elevated animate-scale-in">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-3xl">😅</div>
                <h3 className="mt-3 text-xl font-bold">
                  {locale === "zh" ? "答錯囉！" : "Oops — wrong answer!"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {locale === "zh"
                    ? "沒關係，我們幫你重新抽 3 題新問題，再讀一次卡片會更容易通過。"
                    : "No worries — we'll pull 3 new random questions. Reviewing the lectures helps!"}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={restartQuiz}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow"
                  >
                    {locale === "zh" ? "重新挑戰 3 題" : "Retry with 3 new"}
                  </button>
                  <button
                    onClick={() => { setFailModal(false); setStep(2); setLectureIdx(0); }}
                    className="rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold"
                  >
                    {locale === "zh" ? "回去複習卡片" : "Review lectures"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 4 — success */}
      {step === 4 && (
        <section className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-white to-accent/10 p-8 text-center shadow-elevated backdrop-blur md:p-12 animate-fade-in">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-3xl text-primary-foreground shadow-glow animate-scale-in">
            🎉
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {locale === "zh" ? "恭喜通過入社教育訓練！" : "Congrats — you passed onboarding!"}
          </h2>
          <p className="mt-2 text-base text-foreground/70">
            {locale === "zh"
              ? "系統已為您開通 30 天體驗帳號！並贈送 NT$100 迎新券可折抵首次預購。"
              : "Your 30-day trial pass is now active — with a NT$100 welcome voucher for your first pre-order."}
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
                {locale === "zh" ? "請截圖保存；下次登入可於個人頁面更改密碼。" : "Screenshot this; change it later in your profile."}
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
              className="rounded-full bg-primary px-6 py-2.5 text-base font-bold text-primary-foreground shadow-glow hover:brightness-110"
            >
              {locale === "zh" ? "去逛預購商品 →" : "Browse pre-orders →"}
            </button>
            <button
              onClick={openLogin}
              className="rounded-full border border-border bg-white/70 px-6 py-2.5 text-base font-semibold"
            >
              {locale === "zh" ? "登入帳號" : "Sign in"}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {locale === "zh" ? "推薦選購：放牧土雞蛋 🥚 · 柴燒手工醬油 🍶" : "Featured picks: Free-range eggs 🥚 · Wood-fired soy sauce 🍶"}
          </p>
        </section>
      )}
    </SiteShell>
  );
}
