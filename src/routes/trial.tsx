import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/trial")({
  head: () => ({
    meta: [
      { title: "體驗通行證 Trial Pass — 十圓方里" },
      { name: "description", content: "Try the co-op for 30 days and unlock a welcome voucher through the Co-op Basics quest." },
      { property: "og:title", content: "30-Day Trial Pass — Ten Sq Miles Co-op" },
      { property: "og:description", content: "Gamified onboarding with a welcome voucher on completion." },
    ],
  }),
  component: TrialPage,
});

const quiz = [
  {
    zh: "合作社的結餘主要如何分配？",
    en: "How is co-op surplus primarily distributed?",
    options: [
      { zh: "按股份多寡分配", en: "By share count", correct: false },
      { zh: "依社員消費貢獻度分配", en: "By member purchase contribution", correct: true },
      { zh: "全數保留為公積金", en: "Fully retained as reserve", correct: false },
    ],
  },
  {
    zh: "非社員銷售佔比的法定上限是多少？",
    en: "What is the legal cap on non-member sales?",
    options: [
      { zh: "10%", en: "10%", correct: false },
      { zh: "30%", en: "30%", correct: true },
      { zh: "50%", en: "50%", correct: false },
    ],
  },
  {
    zh: "民主治理的核心原則？",
    en: "The core principle of democratic governance?",
    options: [
      { zh: "股份越多、票數越多", en: "More shares = more votes", correct: false },
      { zh: "1 社員 1 票", en: "1 member, 1 vote", correct: true },
      { zh: "由理事會全權決定", en: "Board decides all", correct: false },
    ],
  },
];

function TrialPage() {
  const { t, locale } = useI18n();
  const [registered, setRegistered] = useState(false);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = quiz[step];
  const isLast = step === quiz.length - 1;
  const progress = Math.round((step / quiz.length) * 100);

  function next() {
    if (picked === null) return;
    const correct = q.options[picked].correct;
    const newScore = score + (correct ? 1 : 0);
    if (isLast) {
      setScore(newScore);
      setDone(true);
    } else {
      setScore(newScore);
      setStep(step + 1);
      setPicked(null);
    }
  }

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Guest onboarding"
        title={t("trial.title")}
        subtitle={t("trial.subtitle")}
        body={t("trial.body")}
      />

      <div className="grid gap-8 md:grid-cols-[1fr_1.3fr]">
        {/* Register */}
        <section className="rounded-md border border-border bg-white p-6">
          <h2 className="text-lg font-bold">{t("trial.register")}</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setRegistered(true);
            }}
          >
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {t("trial.name")}
              </span>
              <input
                required
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Alex"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {t("trial.email")}
              </span>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-sm bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              {registered ? "✓ " : ""}
              {t("trial.register")}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("trial.perks")}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(["trial.perk.1", "trial.perk.2", "trial.perk.3"] as const).map((k) => (
                <li key={k} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-primary" />
                  {t(k)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quest */}
        <section className="rounded-md border border-border bg-stone-cream p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">{t("trial.quiz.title")}</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {t("trial.quiz.progress")} {done ? 100 : progress}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${done ? 100 : progress}%` }}
            />
          </div>

          {!done ? (
            <div className="mt-6 space-y-4">
              <p className="text-base font-semibold">
                Q{step + 1}. {locale === "zh" ? q.zh : q.en}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setPicked(i)}
                    className={`w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                      picked === i
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white hover:border-primary/40"
                    }`}
                  >
                    {locale === "zh" ? opt.zh : opt.en}
                  </button>
                ))}
              </div>
              <button
                disabled={picked === null}
                onClick={next}
                className="rounded-sm bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {isLast ? t("trial.quiz.finish") : t("trial.quiz.next")}
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-sm border border-primary/20 bg-white p-5">
              <h3 className="text-xl font-bold">{t("trial.quiz.done.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("trial.quiz.done.body")}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="rounded-sm border border-border p-3">
                  <span className="block text-muted-foreground">Score</span>
                  <span className="text-lg font-bold">
                    {score} / {quiz.length}
                  </span>
                </div>
                <div className="rounded-sm border border-border p-3">
                  <span className="block text-muted-foreground">Voucher</span>
                  <span className="text-lg font-bold">NT$200</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}
