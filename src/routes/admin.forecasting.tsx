import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/forecasting")({
  head: () => ({
    meta: [
      { title: "智慧需求預測 — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForecastingPage,
});

type Campaign = {
  id: string;
  name: { zh: string; en: string };
  intent: number; // survey responses
  wishlist: number; // +1 votes
  loyaltyHigh: number; // % of responses from high-contribution members
  historicalBaseline: number;
  category: { zh: string; en: string };
  coldChain: boolean;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "soy-01",
    name: { zh: "柴燒手工醬油", en: "Wood-Fired Soy Sauce" },
    intent: 68,
    wishlist: 142,
    loyaltyHigh: 0.42,
    historicalBaseline: 180,
    category: { zh: "加工食品", en: "Processed" },
    coldChain: false,
  },
  {
    id: "eggs-02",
    name: { zh: "放牧土雞蛋 (12入)", en: "Pasture Eggs (12ct)" },
    intent: 210,
    wishlist: 88,
    loyaltyHigh: 0.61,
    historicalBaseline: 260,
    category: { zh: "生鮮 · 冷藏", en: "Fresh · Cold" },
    coldChain: true,
  },
  {
    id: "veg-03",
    name: { zh: "旬味蔬菜箱", en: "Seasonal Veggie Box" },
    intent: 95,
    wishlist: 34,
    loyaltyHigh: 0.55,
    historicalBaseline: 120,
    category: { zh: "生鮮 · 常溫", en: "Fresh · Ambient" },
    coldChain: false,
  },
];

// Conversion rates (co-op historical averages)
const SURVEY_CONV = 0.72;
const WISH_CONV = 0.18;
const LOYALTY_MULT = 1.2;

function forecast(c: Campaign) {
  const loyaltyWeightedIntent =
    c.intent * SURVEY_CONV * (1 - c.loyaltyHigh) +
    c.intent * SURVEY_CONV * c.loyaltyHigh * LOYALTY_MULT;
  const wishSignal = c.wishlist * WISH_CONV;
  const raw = loyaltyWeightedIntent + wishSignal;
  const blended = raw * 0.65 + c.historicalBaseline * 0.35;
  return {
    guaranteed: Math.round(blended * 0.75),
    target: Math.round(blended),
    optimistic: Math.round(blended * 1.35),
    sampleSize: c.intent + c.wishlist,
  };
}

function confidence(sample: number): "Low" | "Medium" | "High" {
  if (sample < 80) return "Low";
  if (sample < 200) return "Medium";
  return "High";
}

function confidencePct(sample: number) {
  return Math.min(95, Math.round(40 + sample / 4));
}

function ForecastingPage() {
  const { locale } = useI18n();
  const [selected, setSelected] = useState(CAMPAIGNS[1].id);
  const c = CAMPAIGNS.find((x) => x.id === selected)!;
  const f = useMemo(() => forecast(c), [c]);
  const conf = confidence(f.sampleSize);
  const confPct = confidencePct(f.sampleSize);

  return (
    <section className="space-y-6">
      <header className="border-b border-border pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Admin · Board only
        </p>
        <h1 className="text-2xl font-extrabold">
          {locale === "zh" ? "智慧需求預測模型" : "Smart Demand Forecasting"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "zh"
            ? "加權公式：(意象調查 × 轉換率) + (願望投票 × 轉換率) × 忠誠度乘數 + 歷史基線。"
            : "Weighted formula: (Intent × conv) + (Wishlist × conv) × loyalty multiplier + historical baseline."}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CAMPAIGNS.map((x) => (
          <button
            key={x.id}
            onClick={() => setSelected(x.id)}
            className={`rounded-sm border px-3 py-1.5 text-xs font-bold ${
              selected === x.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white hover:bg-stone-50"
            }`}
          >
            {x.name[locale]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InputCard
          title={locale === "zh" ? "意象調查回應" : "Intent responses"}
          value={c.intent}
          hint={`× ${SURVEY_CONV} ${locale === "zh" ? "歷史轉換率" : "survey→buy"}`}
        />
        <InputCard
          title={locale === "zh" ? "+1 願望投票" : "+1 wishlist votes"}
          value={c.wishlist}
          hint={`× ${WISH_CONV} ${locale === "zh" ? "願望轉換率" : "wish→buy"}`}
        />
        <InputCard
          title={locale === "zh" ? "歷史類別基線" : "Historical baseline"}
          value={c.historicalBaseline}
          hint={c.category[locale]}
        />
      </div>

      <div className="rounded-md border border-primary/30 bg-primary/5 p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">
              {locale === "zh" ? "廠商流貨預測面板" : "Vendor Stock Reservation Panel"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {locale === "zh" ? "樣本數" : "Sample size"}: {f.sampleSize}
              {" · "}
              {locale === "zh" ? "高貢獻社員比例" : "high-loyalty share"}: {Math.round(c.loyaltyHigh * 100)}%
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              conf === "High"
                ? "bg-primary text-primary-foreground"
                : conf === "Medium"
                  ? "bg-accent text-accent-foreground"
                  : "bg-stone-300 text-foreground"
            }`}
          >
            {locale === "zh" ? "信心指數" : "Confidence"}: {conf} · {confPct}%
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <TierCard
            tone="stone"
            label={locale === "zh" ? "保底量" : "Guaranteed Minimum"}
            sub={locale === "zh" ? "廠商合約硬承諾" : "Hard vendor commitment"}
            value={f.guaranteed}
          />
          <TierCard
            tone="primary"
            label={locale === "zh" ? "最佳預估流貨量" : "Target Forecast"}
            sub={locale === "zh" ? "主要預留數量" : "Primary reservation"}
            value={f.target}
          />
          <TierCard
            tone="accent"
            label={locale === "zh" ? "樂觀追加上限" : "Optimistic Cap"}
            sub={locale === "zh" ? "原料緩衝上限" : "Raw-material buffer"}
            value={f.optimistic}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => downloadCSV(c, f)}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            ↓ {locale === "zh" ? "下載廠商預留訂單 (CSV)" : "Download Vendor Reservation (CSV)"}
          </button>
          <span className="text-xs text-muted-foreground">
            {c.coldChain && (locale === "zh" ? "🧊 冷鏈處理 · 生鮮" : "🧊 Cold chain · fresh")}
          </span>
        </div>
      </div>
    </section>
  );
}

function InputCard({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-1 font-mono text-3xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function TierCard({
  tone,
  label,
  sub,
  value,
}: {
  tone: "stone" | "primary" | "accent";
  label: string;
  sub: string;
  value: number;
}) {
  const cls =
    tone === "primary"
      ? "border-primary bg-white"
      : tone === "accent"
        ? "border-accent bg-white"
        : "border-stone-300 bg-white";
  return (
    <div className={`rounded-md border-2 p-4 ${cls}`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-3xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function downloadCSV(c: Campaign, f: ReturnType<typeof forecast>) {
  const rows = [
    ["Vendor Reservation Request"],
    ["Product", c.name.en],
    ["Category", c.category.en],
    ["Cold chain", c.coldChain ? "YES" : "NO"],
    [],
    ["Tier", "Quantity"],
    ["Guaranteed Minimum", String(f.guaranteed)],
    ["Target Forecast", String(f.target)],
    ["Optimistic Cap", String(f.optimistic)],
    [],
    ["Confidence sample size", String(f.sampleSize)],
    ["Generated", new Date().toISOString()],
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `vendor-reservation-${c.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
