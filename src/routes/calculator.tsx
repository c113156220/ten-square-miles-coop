import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "分紅試算 Surplus Calculator — 十圓方里" },
      { name: "description", content: "Estimate your annual surplus return and tax savings as a verified co-op member." },
      { property: "og:title", content: "Surplus & Dividend Calculator — Ten Sq Miles Co-op" },
      { property: "og:description", content: "See your annual surplus return as a co-op member." },
    ],
  }),
  component: CalcPage,
});

const CATS: { key: "bento" | "produce" | "pantry"; label: DictKey; taxable: number; returnRate: number }[] = [
  { key: "bento", label: "calc.cat.bento", taxable: 1, returnRate: 0.06 },
  { key: "produce", label: "calc.cat.produce", taxable: 0, returnRate: 0.09 },
  { key: "pantry", label: "calc.cat.pantry", taxable: 0.5, returnRate: 0.07 },
];

function fmt(n: number) {
  return "NT$" + Math.round(n).toLocaleString();
}

function CalcPage() {
  const { t } = useI18n();
  const [monthly, setMonthly] = useState(3000);
  const [catKey, setCatKey] = useState<"bento" | "produce" | "pantry">("bento");
  const cat = CATS.find((c) => c.key === catKey)!;

  const { annual, ret, tax, points } = useMemo(() => {
    const annual = monthly * 12;
    const ret = annual * cat.returnRate;
    const tax = annual * cat.taxable * 0.05; // notional 5% saving on taxable share
    const points = Math.round(annual / 10);
    return { annual, ret, tax, points };
  }, [monthly, cat]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Member calculator"
        title={t("calc.title")}
        subtitle={t("calc.subtitle")}
        body={t("calc.body")}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-md border border-border bg-white p-6 space-y-6">
          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {t("calc.monthly")}
              </span>
              <span className="font-mono text-lg font-bold">{fmt(monthly)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={20000}
              step={500}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>NT$500</span>
              <span>NT$20,000</span>
            </div>
          </label>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("calc.category")}
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CATS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCatKey(c.key)}
                  className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                    catKey === c.key
                      ? "border-primary bg-primary/5 font-semibold"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  {t(c.label)}
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/trial"
            className="block rounded-sm bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            {t("calc.cta")} →
          </Link>
        </section>

        <section className="rounded-md bg-primary p-6 text-primary-foreground space-y-4">
          <Stat label={t("calc.annual")} value={fmt(annual)} />
          <Stat label={t("calc.return")} value={fmt(ret)} highlight />
          <Stat label={t("calc.tax")} value={fmt(tax)} />
          <Stat label={t("calc.points")} value={points.toLocaleString() + " pts"} />
        </section>
      </div>
    </SiteShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between border-b border-white/15 pb-3 last:border-none ${
        highlight ? "text-white" : ""
      }`}
    >
      <span className="font-mono text-[11px] uppercase tracking-widest opacity-80">{label}</span>
      <span className={`font-mono font-bold ${highlight ? "text-3xl" : "text-xl"}`}>{value}</span>
    </div>
  );
}
