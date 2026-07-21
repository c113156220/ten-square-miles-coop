import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/surplus")({
  component: SurplusPage,
});

const members = [
  { mid: "M-0001", name: "陳大同", pts: 3420 },
  { mid: "M-0042", name: "李美玲", pts: 2180 },
  { mid: "M-0088", name: "林建志", pts: 1980 },
  { mid: "M-0142", name: "黃惠珊", pts: 1240 },
  { mid: "M-0175", name: "Michael Lin", pts: 4560 },
];

function fmt(n: number) {
  return "NT$" + Math.round(n).toLocaleString();
}

function SurplusPage() {
  const { t } = useI18n();
  const [income, setIncome] = useState(4200000);
  const [cost, setCost] = useState(3360000);

  const { surplus, reserve, dividend, rows } = useMemo(() => {
    const surplus = Math.max(0, income - cost);
    const reserve = surplus * 0.5;
    const dividend = surplus * 0.5;
    const totalPts = members.reduce((s, m) => s + m.pts, 0);
    const rows = members.map((m) => {
      const share = totalPts ? m.pts / totalPts : 0;
      return { ...m, share, payout: dividend * share };
    });
    return { surplus, reserve, dividend, rows };
  }, [income, cost]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.surplus")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Contribution-weighted allocator
        </p>
      </header>

      <section className="rounded-md border border-border bg-white p-6">
        <h2 className="text-lg font-bold">{t("sur.ledger")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("sur.income")}
            </span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("sur.cost")}
            </span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-border bg-stone-cream p-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("sur.total")}
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold">{fmt(surplus)}</p>
          </div>
          <div className="rounded-sm border border-primary/30 bg-primary p-4 text-primary-foreground">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">
              {t("sur.reserve50")}
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold">{fmt(reserve)}</p>
          </div>
          <div className="rounded-sm border border-accent/40 bg-accent/10 p-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("sur.dividend50")}
            </span>
            <p className="mt-1 font-mono text-2xl font-extrabold text-accent">{fmt(dividend)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("sur.allocator")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">{t("mem.col.mid")}</th>
                <th className="px-4 py-2">{t("sur.member")}</th>
                <th className="px-4 py-2">{t("sur.contribution")}</th>
                <th className="px-4 py-2">{t("sur.share")}</th>
                <th className="px-4 py-2 text-right">{t("sur.payout")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.mid}>
                  <td className="px-4 py-3 font-mono">{r.mid}</td>
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3 font-mono">{r.pts.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{(r.share * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{fmt(r.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
