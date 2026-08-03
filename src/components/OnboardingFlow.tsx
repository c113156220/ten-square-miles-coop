import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import confetti from "canvas-confetti";
import { ArrowRight, ChevronLeft, ChevronRight, Lock, RotateCcw, Sparkles } from "lucide-react";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";

type LectureCard = {
  icon: string;
  accent: string;
  title: string;
  body: string;
};

type QuizOption = {
  label: string;
  correct: boolean;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

const LECTURE_CARDS: LectureCard[] = [
  {
    icon: "🗳️",
    accent: "from-primary/20 via-white to-accent/15",
    title: "一人一票，營業不營利",
    body:
      "合作社是『認人不認錢』的民主組織。無論出資多寡，每位社員在『社員大會』都擁有一人一票的平權決定權。結餘回饋社員與社區。",
  },
  {
    icon: "👥",
    accent: "from-accent/20 via-white to-primary/10",
    title: "社員不是顧客，而是主人",
    body:
      "合作社社員兼具『使用者、擁有者、共創者與治理者』的多重身分，可以提出許願、參與提案與治理。",
  },
  {
    icon: "🎓",
    accent: "from-fuchsia-200/40 via-white to-accent/15",
    title: "認購社股，學生特別保護",
    body:
      "加入合作社需認購社股（每股 100 元）。為了平衡權力，在校學生的認購上限較低以確保參與平等。",
  },
  {
    icon: "💰",
    accent: "from-primary/15 via-white to-accent/20",
    title: "結餘分配與公積金",
    body:
      "合作社年度結餘會提撥公積金並以消費貢獻度分配回饋給社員，而非發放給大股東。",
  },
  {
    icon: "🌱",
    accent: "from-accent/15 via-white to-primary/10",
    title: "社員專屬免稅福利",
    body:
      "部分商品對正式社員有稅務或價格上的優惠，完成入社程序後可享相關權益。",
  },
  {
    icon: "🤝",
    accent: "from-emerald-200/30 via-white to-primary/10",
    title: "夥伴廠商與公平交易",
    body:
      "合作社優先與在地小農與公平交易廠商合作，建立透明的採購條件與永續供應鏈。",
  },
  {
    icon: "📦",
    accent: "from-stone-200/30 via-white to-accent/10",
    title: "零庫存預購降低浪費",
    body:
      "採用意象調查與預購鎖單的方式，減少庫存與浪費，並將議價空間回饋給社員。",
  },
  {
    icon: "📣",
    accent: "from-yellow-200/30 via-white to-primary/10",
    title: "參與提案與投票流程",
    body:
      "社員可在平台上提出議題、參與討論並在社員大會進行表決，實踐社務民主化。",
  },
  {
    icon: "🧾",
    accent: "from-indigo-200/30 via-white to-accent/10",
    title: "透明帳務與年度報告",
    body:
      "合作社定期公布財務報表與採購成本，讓社員了解資金與分配運作。",
  },
  {
    icon: "🌟",
    accent: "from-primary/20 via-white to-accent/15",
    title: "社群回饋與教育",
    body:
      "合作社鼓勵教育活動、工作坊與社區共學，強化成員間的互助網絡。",
  },
];

const QUIZ_POOL: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "十里方圓合作社的最高權力決策機關是誰？",
    options: [
      { label: "理事主席", correct: false },
      { label: "社員大會", correct: true },
    ],
  },
  {
    id: "q2",
    prompt: "在校學生加入合作社，股金認購上限是多少？",
    options: [
      { label: "學生上限 10 股共 1,000 元以確保平等", correct: true },
      { label: "無上限", correct: false },
    ],
  },
  {
    id: "q3",
    prompt: "合作社的決策投票機制，和一般股份有限公司最大的差異是什麼？",
    options: [
      { label: "誰出錢多決定一切", correct: false },
      { label: "認人不認錢，每位社員都是『一人一票』的平權參與", correct: true },
    ],
  },
  {
    id: "q4",
    prompt: "購買合作社的『加工食品（如便當、醬油）』，誰享有免徵 5% 營業稅福利？",
    options: [
      { label: "只有完成入社的正式社員", correct: true },
      { label: "所有人", correct: false },
    ],
  },
  {
    id: "q5",
    prompt: "在十里方圓合作社中，社員的身分和一般商店的『顧客』有何不同？",
    options: [
      { label: "只是有打折優惠的消費者", correct: false },
      { label: "同時是合作社的『使用者、擁有者、共創者與治理者』", correct: true },
    ],
  },
  {
    id: "q6",
    prompt: "合作社年底的結餘如何分配？",
    options: [
      { label: "依據社員的『消費貢獻度』按比例回饋", correct: true },
      { label: "按出資比例分給大股東", correct: false },
    ],
  },
  {
    id: "q7",
    prompt: "合作社被稱為『營業不營利』的組織，這代表什麼意思？",
    options: [
      { label: "合作社只能賠錢不能有收入", correct: false },
      { label: "產生結餘不是為大股東賺錢，而是回饋給社員與社區", correct: true },
    ],
  },
  {
    id: "q8",
    prompt: "根據章程，合作社提撥『公積金』的比例為多少？",
    options: [
      { label: "30%", correct: true },
      { label: "10%", correct: false },
    ],
  },
];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createQuizSet(excludedIds: string[]) {
  const remaining = QUIZ_POOL.filter((question) => !excludedIds.includes(question.id));
  const source = remaining.length >= 3 ? remaining : QUIZ_POOL;
  const picked = shuffle(source).slice(0, 3).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
  return picked;
}

function create6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function OnboardingFlow() {
  const router = useRouter();
  const locale: "zh" | "en" = typeof document !== "undefined" && document.documentElement.lang.startsWith("en") ? "en" : "zh";
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const [lectureIndex, setLectureIndex] = useState(0);
  const [readSeconds, setReadSeconds] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });

  const seenQuizIdsRef = useRef<string[]>([]);
  const [quizSet, setQuizSet] = useState(() => createQuizSet(seenQuizIdsRef.current));
  const [quizRound, setQuizRound] = useState(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [failOpen, setFailOpen] = useState(false);
  const celebrationFiredRef = useRef(false);

  useEffect(() => {
    if (!emblaApi) return;
    const syncIndex = () => {
      setLectureIndex(emblaApi.selectedScrollSnap());
    };
    syncIndex();
    emblaApi.on("select", syncIndex);
    emblaApi.on("reInit", syncIndex);
    return () => {
      emblaApi.off("select", syncIndex);
      emblaApi.off("reInit", syncIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (step !== 2) return;
    setReadSeconds(0);
    const timer = window.setInterval(() => {
      setReadSeconds((current) => Math.min(3, current + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, lectureIndex]);

  useEffect(() => {
    if (step !== 4 || celebrationFiredRef.current) return;
    celebrationFiredRef.current = true;
    confetti({ particleCount: 170, spread: 95, origin: { y: 0.6 } });
    window.setTimeout(() => confetti({ particleCount: 120, spread: 130, angle: 60, origin: { x: 0, y: 0.7 } }), 180);
    window.setTimeout(() => confetti({ particleCount: 120, spread: 130, angle: 120, origin: { x: 1, y: 0.7 } }), 320);
  }, [step]);

  function sendCode() {
    const code = create6DigitCode();
    setSentCode(code);
    setVerificationCode("");
    setOtpVisible(true);
    setOtpHint(locale === "zh" ? `系統已寄出模擬驗證碼：${code}` : `Mock code sent: ${code}`);
  }

  async function verifyCode() {
    const compact = verificationCode.trim();
    if (!/^\d{6}$/.test(compact)) {
      setOtpHint(locale === "zh" ? "請輸入 6 位數驗證碼。" : "Please enter a 6-digit code.");
      return;
    }
    if (sentCode && compact !== sentCode && compact !== "123456") {
      setOtpHint(locale === "zh" ? "驗證碼錯誤，請再試一次。" : "Wrong code, please try again.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // 將姓名存入 metadata
          student_id: idNumber, // 將學號存入 metadata
        }
      }
    });

    if (error) {
      setOtpHint(`註冊失敗：${error.message}`);
      return;
    }

    // 註冊成功，清空提示並進入下一步
    setOtpHint(null);
    setStep(2);
  }

  function goToLecture(nextIndex: number) {
    emblaApi?.scrollTo(nextIndex);
  }

  function issueQuizSet() {
    if (seenQuizIdsRef.current.length > 5) {
      seenQuizIdsRef.current = [];
    }
    const nextSet = createQuizSet(seenQuizIdsRef.current);
    seenQuizIdsRef.current = [...seenQuizIdsRef.current, ...nextSet.map((question) => question.id)];
    setQuizSet(nextSet);
    setQuizIndex(0);
    setPickedIndex(null);
    return nextSet;
  }

  function answerQuestion() {
    if (pickedIndex === null) return;
    const isCorrect = quizSet[quizIndex].options[pickedIndex].correct;
    if (!isCorrect) {
      setFailOpen(true);
      return;
    }
    if (quizIndex === quizSet.length - 1) {
      setStep(4);
      return;
    }
    setQuizIndex((current) => current + 1);
    setPickedIndex(null);
  }

  function restartQuiz() {
    setFailOpen(false);
    setQuizRound((current) => current + 1);
    issueQuizSet();
  }

  const progressLabel = `${lectureIndex + 1}/10`;
  const canMoveLecture = readSeconds >= 3;
  const currentQuestion = quizSet[quizIndex];

  return (
    <SiteShell>
      <PageHeader
        eyebrow={locale === "zh" ? "入社教育訓練 · 4 步驟闖關" : "Member Onboarding · 4 steps"}
        title={locale === "zh" ? "3 分鐘認識合作社，解鎖 30 天體驗帳號" : "Learn the co-op in 3 minutes, unlock a 30-day trial pass"}
        subtitle={locale === "zh" ? "實名驗證 → 合作社十講 → 隨機小考 → 30 天通行證＋NT$100 迎新券" : "Identity + OTP → Lectures → Random quiz → 30-day trial + NT$100 voucher"}
      />

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-4 gap-2 rounded-3xl border border-border bg-white/75 p-2 shadow-soft backdrop-blur">
          {[
            { zh: "身分驗證", en: "Identity" },
            { zh: "合作社十講", en: "Lectures" },
            { zh: "理念快問快答", en: "Quiz" },
            { zh: "解鎖體驗", en: "Activate" },
          ].map((label, index) => {
            const active = step === index + 1;
            const complete = step > index + 1;
            return (
              <div
                key={label.zh}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center transition-all ${
                  active ? "bg-primary/10 ring-1 ring-primary/25" : complete ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                    complete ? "bg-primary text-primary-foreground" : active ? "bg-primary/80 text-primary-foreground" : "bg-surface text-muted-foreground"
                  }`}
                >
                  {complete ? "✓" : index + 1}
                </span>
                <span className={`text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {locale === "zh" ? label.zh : label.en}
                </span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <section className="overflow-hidden rounded-[2rem] border border-border bg-white/85 shadow-elevated backdrop-blur">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-white to-accent/10 px-6 py-5 md:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <ShieldCheckIcon />
                  {locale === "zh" ? "防弊身分驗證" : "Identity verification"}
                </span>
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-foreground/70">
                  Step 1
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {locale === "zh"
                  ? "請填寫姓名、身分證字號／學號與電子信箱，系統會模擬寄出 6 位數驗證碼，完成後即可進入合作社十講。"
                  : "Fill in your name, ID/student number and email. We'll simulate sending a 6-digit code, then continue to the lectures."}
              </p>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {locale === "zh" ? "姓名" : "Name"}
                  </span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder={locale === "zh" ? "王小明" : "Alex Chen"}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {locale === "zh" ? "身分證字號 / 學號" : "ID Number / Student ID"}
                  </span>
                  <input
                    value={idNumber}
                    onChange={(event) => setIdNumber(event.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm uppercase outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="A123456789"
                    maxLength={20}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {locale === "zh" ? "電子信箱" : "Email"}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {locale === "zh" ? "設定密碼" : "Password"}
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder={locale === "zh" ? "至少 6 碼" : "At least 6 characters"}
                  />
                </label>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={!fullName.trim() || !idNumber.trim() || !email.trim() || !password.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {locale === "zh" ? "發送驗證碼" : "Send verification code"}
                    <ArrowRight className="size-4" />
                  </button>
                  <span className="inline-flex items-center rounded-full border border-border bg-white/70 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                    {locale === "zh" ? "以模擬 Email 驗證取代 SMS，零成本防冒用。" : "Mock email verification keeps the flow zero-cost and anti-fraud."}
                  </span>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/80">
                      {locale === "zh" ? "模擬驗證流程" : "Mock verification"}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">Enter 6-digit verification code</h3>
                  </div>
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                    <Lock className="size-5" />
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {locale === "zh"
                    ? "這裡會模擬寄出一組 6 位數驗證碼。你可以直接輸入 123456，或輸入畫面上顯示的模擬碼完成驗證。"
                    : "We simulate a 6-digit code here. You can use 123456 or the displayed mock code to continue."}
                </p>

                {otpVisible ? (
                  <div className="mt-5 space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {locale === "zh" ? "驗證碼" : "Verification code"}
                      </span>
                      <input
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.35em] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={verifyCode}
                      className="w-full rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition-all hover:brightness-110"
                    >
                      {locale === "zh" ? "驗證並前往合作社十講" : "Verify & continue"}
                    </button>
                    {sentCode && (
                      <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm">
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {locale === "zh" ? "模擬寄送結果" : "Mock delivery"}
                        </span>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-lg font-bold tracking-[0.35em] text-primary">
                            {sentCode}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {locale === "zh" ? "（或直接輸入 123456）" : "(or use 123456)"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted-foreground">
                    {locale === "zh" ? "先完成左側資料填寫，再點擊發送驗證碼。" : "Complete the fields on the left before sending the code."}
                  </div>
                )}

                {otpHint && <p className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-foreground">{otpHint}</p>}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="overflow-hidden rounded-[2rem] border border-border bg-white/85 shadow-elevated backdrop-blur">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-white to-accent/10 px-6 py-5 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    <Sparkles className="size-3.5" />
                    {locale === "zh" ? "合作社十講卡片閱讀器" : "Co-op lecture carousel"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                    {locale === "zh" ? "先讀完再滑動，理解合作社的 10 個關鍵概念" : "Read first, then swipe through 10 co-op essentials"}
                  </h2>
                </div>
                <div className="rounded-full border border-border bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground shadow-sm">
                  Progress: {progressLabel}
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-cyan-400 transition-all duration-500"
                  style={{ width: `${((lectureIndex + 1) / LECTURE_CARDS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="relative p-4 md:p-6">
              <div className="absolute inset-x-0 top-0 z-10 flex justify-center px-4 pt-4">
                {!canMoveLecture && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-xs font-semibold text-primary shadow-lg backdrop-blur">
                    <RotateCcw className="size-3.5 animate-spin [animation-duration:2.2s]" />
                    {locale === "zh" ? `閱讀鎖定中，${readSeconds}/3 秒後可滑動` : `Reading lock: swipe unlocks in ${readSeconds}/3s`}
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-slate-50/80 shadow-soft" ref={emblaRef}>
                <div className="flex touch-pan-y">
                  {LECTURE_CARDS.map((card, index) => (
                    <article key={card.title} className="min-w-0 flex-[0_0_100%] p-4 md:p-5">
                      <div className={`relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br ${card.accent} p-6 shadow-elevated md:p-8`}>
                        <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground/70 shadow-sm backdrop-blur">
                          {index + 1} / 10
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="grid size-16 shrink-0 place-items-center rounded-3xl bg-white/75 text-4xl shadow-lg">
                            {card.icon}
                          </div>
                          <div className="space-y-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                              {locale === "zh" ? `Lecture ${index + 1}` : `Lecture ${index + 1}`}
                            </p>
                            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">{card.title}</h3>
                          </div>
                        </div>

                        <p className="mt-5 max-w-3xl text-[15px] leading-8 text-foreground/80 md:text-lg md:leading-9">
                          {card.body}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                            <span className="size-2 rounded-full bg-primary" />
                            {locale === "zh" ? "閱讀完成後才能前進" : "You can only move forward after the 3-second read lock"}
                          </div>
                          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            {canMoveLecture ? (locale === "zh" ? "可滑動" : "Swipe enabled") : locale === "zh" ? "鎖定中" : "Locked"}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
                <button
                  type="button"
                  onClick={() => goToLecture(Math.max(0, lectureIndex - 1))}
                  disabled={lectureIndex === 0}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  {locale === "zh" ? "上一張" : "Prev"}
                </button>

                {lectureIndex < LECTURE_CARDS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToLecture(lectureIndex + 1)}
                    disabled={!canMoveLecture}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {locale === "zh" ? "Swipe Right / 下一張" : "Swipe Right / Next"}
                    <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canMoveLecture}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background shadow-elevated transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {locale === "zh" ? "開始快問快答" : "Start the quiz"}
                    <ArrowRight className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="overflow-hidden rounded-[2rem] border border-border bg-white/85 shadow-elevated backdrop-blur">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-white to-accent/10 px-6 py-5 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                    <Sparkles className="size-3.5" />
                    {locale === "zh" ? "隨機理念快問快答" : "Random quick quiz"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                    {locale === "zh" ? `第 ${quizIndex + 1} 題，共 3 題` : `Question ${quizIndex + 1} of 3`}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {locale === "zh"
                      ? "每次進入此步驟都會從 8 題題庫隨機抽 3 題，必須全對才能通關；若答錯會跳出友善提示並重新抽題。"
                      : "Each attempt draws 3 random questions from the 8-question pool. You must get all 3 correct to pass."}
                  </p>
                </div>
                <div className="rounded-full border border-border bg-white px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground shadow-sm">
                  {locale === "zh" ? `第 ${quizRound} 輪` : `Round ${quizRound}`}
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/5">
                <div className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-cyan-400 transition-all duration-500" style={{ width: `${((quizIndex + 1) / 3) * 100}%` }} />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="rounded-[1.75rem] border border-border bg-slate-50/80 p-5 md:p-6">
                <p className="text-lg font-bold leading-relaxed md:text-xl">{currentQuestion.prompt}</p>

                <div className="mt-5 space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isPicked = pickedIndex === index;
                    return (
                      <button
                        key={`${currentQuestion.id}-${option.label}`}
                        type="button"
                        onClick={() => setPickedIndex(index)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left text-sm transition-all md:text-base ${
                          isPicked ? "border-primary bg-primary/5 font-semibold shadow-sm" : "border-border bg-white hover:border-primary/35"
                        }`}
                      >
                        <span className="mr-3 inline-flex size-6 items-center justify-center rounded-full border border-current font-mono text-[10px] font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {locale === "zh" ? "A/B 選項已隨機打亂，全對才算通過。" : "A/B options are shuffled. All 3 must be correct."}
                  </div>
                  <button
                    type="button"
                    onClick={answerQuestion}
                    disabled={pickedIndex === null}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {quizIndex === 2 ? (locale === "zh" ? "提交並解鎖" : "Submit & unlock") : locale === "zh" ? "下一題" : "Next"}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {failOpen && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-white p-6 text-center shadow-elevated animate-scale-in">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-100 text-3xl">😅</div>
                  <h3 className="mt-4 text-2xl font-bold">{locale === "zh" ? "答錯囉！" : "Oops — wrong answer!"}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {locale === "zh"
                      ? "沒關係，這次會重新抽 3 題新題目。建議回去再看一次合作社十講，會更容易通過。"
                      : "No worries — we'll draw 3 new questions. Review the lecture cards and try again."}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={restartQuiz}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:brightness-110"
                    >
                      {locale === "zh" ? "重新挑戰 3 題" : "Retry with 3 new"}
                      <RotateCcw className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFailOpen(false);
                        setStep(2);
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-primary/35"
                    >
                      {locale === "zh" ? "回去複習卡片" : "Review lectures"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-primary/10 via-white to-accent/15 p-6 shadow-elevated md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(74,222,128,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),_transparent_35%)]" />
            <div className="relative text-center">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-4xl text-primary-foreground shadow-glow">
                🎉
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                {locale === "zh" ? "恭喜通過入社教育訓練！系統已為您開通 30 天體驗帳號！" : "Congrats — your 30-day trial pass is now active!"}
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-foreground/75 md:text-lg">
                {locale === "zh"
                  ? "你已完成防弊驗證、合作社十講與隨機理念快問快答。現在可以直接去逛預購商品，看看放牧土雞蛋、柴燒手工醬油和更多在地好物。"
                  : "You completed identity verification, the lecture cards and the random quiz. Head back to the homepage to browse pre-orders."}
              </p>

              <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
                {[
                  { label: locale === "zh" ? "體驗天數" : "Trial length", value: "30d" },
                  { label: locale === "zh" ? "闖關結果" : "Quest score", value: "100%" },
                  { label: locale === "zh" ? "迎新狀態" : "Welcome status", value: "UNLOCKED" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-border bg-white/80 p-5 text-left shadow-soft backdrop-blur">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.navigate({ to: "/" })}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-base font-bold text-background shadow-elevated transition-all hover:brightness-110"
                >
                  {locale === "zh" ? "去逛預購商品" : "Browse pre-orders"}
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFullName("");
                    setIdNumber("");
                    setEmail("");
                    setVerificationCode("");
                    setSentCode(null);
                    setOtpVisible(false);
                    setOtpHint(null);
                    setLectureIndex(0);
                    setReadSeconds(0);
                    setQuizRound(1);
                    setQuizIndex(0);
                    setPickedIndex(null);
                    setFailOpen(false);
                    celebrationFiredRef.current = false;
                    seenQuizIdsRef.current = [];
                    setQuizSet(createQuizSet([]));
                    emblaApi?.scrollTo(0);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/85 px-6 py-3 text-base font-semibold shadow-sm transition-all hover:border-primary/35"
                >
                  {locale === "zh" ? "重新闖關" : "Restart"}
                  <RotateCcw className="size-4" />
                </button>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                {locale === "zh" ? "推薦商品：放牧土雞蛋、柴燒手工醬油。" : "Featured picks: free-range eggs and wood-fired soy sauce."}
              </p>
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}

function ShieldCheckIcon() {
  return <span className="text-sm">🛡️</span>;
}