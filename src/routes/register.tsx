import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "註冊入社 Register — 十圓方里" },
      {
        name: "description",
        content:
          "Register for a 30-day trial pass or apply as a verified co-op member with real-name verification and share subscription.",
      },
      { property: "og:title", content: "Register — Ten Sq Miles Co-op" },
      { property: "og:description", content: "Trial pass or full member application." },
    ],
  }),
  component: RegisterPage,
});

type Track = "trial" | "member";

function RegisterPage() {
  const { locale } = useI18n();
  const [track, setTrack] = useState<Track>("trial");
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Register / 註冊"
        title={locale === "zh" ? "加入十圓方里" : "Join Ten Sq Miles"}
        subtitle={locale === "zh" ? "Trial Pass or Full Membership" : "Trial Pass or Full Membership"}
        body={
          locale === "zh"
            ? "選擇適合您的路徑：先以體驗帳號逛逛，或直接完成社員實名認證流程。"
            : "Pick your path: start with a 30-day trial pass, or complete full real-name verification."
        }
      />

      <div className="mb-6 inline-flex overflow-hidden rounded-full border border-border bg-white p-1 font-mono text-xs">
        <button
          onClick={() => setTrack("trial")}
          className={`rounded-full px-4 py-1.5 transition-all ${
            track === "trial" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {locale === "zh" ? "A · 30 天體驗" : "A · 30-Day Trial"}
        </button>
        <button
          onClick={() => setTrack("member")}
          className={`rounded-full px-4 py-1.5 transition-all ${
            track === "member" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {locale === "zh" ? "B · 正式社員入社" : "B · Full Member"}
        </button>
      </div>

      {track === "trial" ? <TrialForm /> : <MemberApplication />}
    </SiteShell>
  );
}

function TrialForm() {
  const { locale } = useI18n();
  const { registerTrial, showVerify, trialDays } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [upgradeHint, setUpgradeHint] = useState(false);
  const [done, setDone] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUpgradeHint(false);
    const r = registerTrial(form);
    if (!r.ok) {
      setError(r.error);
      if (r.upgradeEmail) setUpgradeHint(true);
      return;
    }
    setDone(true);
    showVerify({ email: r.user.email, link: r.verifyLink, userId: r.user.id });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-md border border-border bg-white p-6">
        <h2 className="text-xl font-bold">
          {locale === "zh" ? `${trialDays} 天體驗註冊` : `${trialDays}-Day Trial Pass`}
        </h2>
        {done ? (
          <div className="rounded border border-primary bg-primary/10 p-4 text-sm text-primary">
            ✓ {locale === "zh"
              ? "體驗帳號已建立！請至驗證信箱視窗完成啟用。"
              : "Trial pass created. Check the verification popup to activate."}
          </div>
        ) : (
          <>
            {(
              [
                { key: "name", zh: "姓名", en: "Full Name", type: "text" },
                { key: "phone", zh: "手機號碼", en: "Phone", type: "tel" },
                { key: "email", zh: "電子郵件", en: "Email", type: "email" },
                { key: "password", zh: "密碼", en: "Password", type: "password" },
              ] as const
            ).map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">
                  {locale === "zh" ? f.zh : f.en}
                </span>
                <input
                  required
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            ))}
            {error && (
              <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                {error}
                {upgradeHint && (
                  <button
                    type="button"
                    onClick={() => router.navigate({ to: "/register" })}
                    className="mt-2 block rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                  >
                    → Upgrade to Full Member / 升級為正式社員
                  </button>
                )}
              </div>
            )}
            <button className="w-full rounded-sm bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
              {locale === "zh" ? "建立體驗帳號" : "Create trial account"}
            </button>
          </>
        )}
      </form>
      <aside className="space-y-3 rounded-md border border-accent/30 bg-accent/5 p-6 text-sm">
        <h3 className="font-bold">{locale === "zh" ? "體驗帳號權益" : "Trial benefits"}</h3>
        <ul className="space-y-2 text-muted-foreground">
          <li>· {locale === "zh" ? "瀏覽全部預購檔期" : "Browse every pre-order campaign"}</li>
          <li>· {locale === "zh" ? "投票 +1 願望清單" : "+1 on the community wishlist"}</li>
          <li>· {locale === "zh" ? "享一般價購物 (不含社員價)" : "Regular pricing (no co-op discount)"}</li>
          <li>
            · {locale === "zh"
              ? `${trialDays} 天內可升級為正式社員`
              : `Upgrade to full member within ${trialDays} days`}
          </li>
        </ul>
      </aside>
    </div>
  );
}

const QUIZ = [
  {
    q: { zh: "合作社的投票原則？", en: "How do co-ops vote?" },
    opts: [
      { zh: "1 股 1 票", en: "1 share = 1 vote" },
      { zh: "1 人 1 票", en: "1 member = 1 vote" },
      { zh: "理事會決議", en: "Board decides" },
    ],
    correct: 1,
  },
  {
    q: { zh: "結餘 (Surplus) 與利潤 (Profit) 的差異？", en: "Surplus vs. Profit?" },
    opts: [
      { zh: "無差異", en: "They are the same" },
      { zh: "結餘依消費貢獻分配，利潤依持股", en: "Surplus is distributed by contribution; profit by shareholding" },
      { zh: "結餘不能分配", en: "Surplus cannot be distributed" },
    ],
    correct: 1,
  },
  {
    q: { zh: "非社員銷售比例上限？", en: "Non-member sales cap?" },
    opts: [
      { zh: "10%", en: "10%" },
      { zh: "30%", en: "30%" },
      { zh: "50%", en: "50%" },
    ],
    correct: 1,
  },
];

function MemberApplication() {
  const { locale } = useI18n();
  const { registerMember, showVerify } = useAuth();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [info, setInfo] = useState({ name: "", nid: "", phone: "", email: "", password: "coop2026" });
  const [error, setError] = useState<string | null>(null);
  const passed = answers.every((a, i) => a === QUIZ[i].correct);

  const STEPS = [
    { zh: "基本資料", en: "Basic Info" },
    { zh: "實名認證與認股", en: "Verify & Shares" },
    { zh: "社務教育測驗", en: "Co-op Education" },
    { zh: "審核狀態", en: "Tracker" },
  ];

  function nextFromBasic() {
    setError(null);
    if (!info.name || !info.email || !info.phone) {
      setError(locale === "zh" ? "請填寫所有欄位" : "Please fill in all fields");
      return;
    }
    setStep(2);
  }

  function submitApplication() {
    if (!passed) return;
    const r = registerMember({
      name: info.name,
      email: info.email,
      phone: info.phone,
      password: info.password,
    });
    if (!r.ok) {
      setError(r.error);
      setStep(1);
      return;
    }
    showVerify({ email: r.user.email, link: r.verifyLink, userId: r.user.id });
    setStep(4);
  }

  const basicFields = [
    { key: "name", zh: "真實姓名", en: "Full legal name", type: "text" },
    { key: "nid", zh: "身分證 / 學生證字號", en: "National / Student ID", type: "text" },
    { key: "phone", zh: "聯絡電話", en: "Contact phone", type: "tel" },
    { key: "email", zh: "電子郵件", en: "Email", type: "email" },
  ] as const;

  return (
    <div className="rounded-md border border-border bg-white p-6">
      <ol className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <li key={i} className="flex items-center gap-1">
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-accent text-accent-foreground"
                      : "bg-stone-200 text-muted-foreground"
                }`}
              >
                {n}
              </span>
              <span className={active ? "text-foreground" : "text-muted-foreground"}>
                {s[locale]}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold">{locale === "zh" ? "步驟 1 · 基本資料" : "Step 1 · Basic info"}</h3>
          {basicFields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-bold text-muted-foreground">
                {locale === "zh" ? f.zh : f.en}
              </span>
              <input
                type={f.type}
                value={info[f.key]}
                onChange={(e) => setInfo({ ...info, [f.key]: e.target.value })}
                className="w-full rounded-sm border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
          ))}
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}
          <StepBtn onClick={nextFromBasic} label={locale === "zh" ? "下一步" : "Next"} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-bold">
            {locale === "zh" ? "步驟 2 · 實名認證與認股" : "Step 2 · Verification & Shares"}
          </h3>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              {locale === "zh" ? "上傳身分證 / 學生證影本" : "Upload ID / Student card"}
            </span>
            <input type="file" className="text-xs" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              {locale === "zh" ? "認購股數 (1 股 = $1,000)" : "Shares (1 share = $1,000)"}
            </span>
            <select className="w-full rounded-sm border border-border px-3 py-2 text-sm">
              {[1, 3, 5, 10].map((n) => (
                <option key={n}>{n} shares · ${n * 1000}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              {locale === "zh" ? "上傳匯款證明" : "Upload bank transfer proof"}
            </span>
            <input type="file" className="text-xs" />
          </label>
          <div className="flex gap-2">
            <StepBtn onClick={() => setStep(1)} label="←" variant="ghost" />
            <StepBtn onClick={() => setStep(3)} label={locale === "zh" ? "下一步" : "Next"} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-bold">
            {locale === "zh" ? "步驟 3 · 社務教育測驗 (3 題)" : "Step 3 · Co-op Education Quiz (3)"}
          </h3>
          {QUIZ.map((q, qi) => (
            <div key={qi} className="rounded border border-border p-3">
              <p className="mb-2 text-sm font-bold">
                {qi + 1}. {q.q[locale]}
              </p>
              <div className="space-y-1">
                {q.opts.map((o, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
                      answers[qi] === oi ? "bg-primary/10 text-primary" : "hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => {
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                      }}
                    />
                    {o[locale]}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {answers.every((a) => a >= 0) && !passed && (
            <p className="text-xs text-accent">
              {locale === "zh" ? "有答錯的題目，請重新作答。" : "Some answers are wrong — try again."}
            </p>
          )}
          <div className="flex gap-2">
            <StepBtn onClick={() => setStep(2)} label="←" variant="ghost" />
            <StepBtn
              onClick={() => passed && setStep(4)}
              label={locale === "zh" ? "提交申請" : "Submit application"}
              disabled={!passed}
            />
          </div>
        </div>
      )}

      {step === 4 && <ApplicationTracker />}
    </div>
  );
}

function StepBtn({
  onClick,
  label,
  variant = "primary",
  disabled,
}: {
  onClick: () => void;
  label: string;
  variant?: "primary" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-sm px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:brightness-110"
          : "border border-border hover:bg-stone-50"
      }`}
    >
      {label}
    </button>
  );
}

function ApplicationTracker() {
  const { locale } = useI18n();
  const steps = [
    { zh: "申請已送出", en: "Application Submitted" },
    { zh: "社務教育通過", en: "Co-op Education Passed" },
    { zh: "匯款驗證中", en: "Bank Deposit Verified" },
    { zh: "理監事審核中", en: "Board Reviewing" },
    { zh: "核發社員編號", en: "Verified & Member ID Issued" },
  ];
  const current = 2;
  return (
    <div className="space-y-4">
      <h3 className="font-bold">
        {locale === "zh" ? "審核進度追蹤" : "Application Status Tracker"}
      </h3>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded border p-3 text-sm ${
                active
                  ? "border-primary bg-primary/5"
                  : done
                    ? "border-accent/40 bg-white"
                    : "border-border bg-stone-50"
              }`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-accent text-accent-foreground"
                      : "bg-stone-200 text-muted-foreground"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={active ? "font-bold" : done ? "" : "text-muted-foreground"}>
                {s[locale]}
              </span>
              {active && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-primary">
                  {locale === "zh" ? "處理中" : "In progress"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-muted-foreground">
        {locale === "zh"
          ? "審核狀態約 3-5 個工作天更新。核發社員編號後即可享共同購買價與年度分紅。"
          : "Status updates in 3-5 business days. Once your Member ID is issued you unlock co-op pricing and annual surplus dividends."}
      </p>
    </div>
  );
}
