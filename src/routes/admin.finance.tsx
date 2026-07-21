import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/finance")({
  component: FinancePage,
});

const ratio = 22; // percent
const cap = 30;

const exempt = [
  { id: "T-0421", name: "Highland Brown Eggs · Member #M-0042", amount: 2160 },
  { id: "T-0422", name: "Veggie Box · Member #M-0088", amount: 950 },
  { id: "T-0425", name: "Camellia Oil · Member #M-0175", amount: 4200 },
];

const taxable = [
  { id: "T-0423", name: "Bento box · Guest #G-9011", amount: 320, invoice: "issued" },
  { id: "T-0424", name: "Bento box · Guest #G-9012", amount: 640, invoice: "pending" },
  { id: "T-0426", name: "Processed soy jar · Guest #G-9018", amount: 480, invoice: "issued" },
];

function FinancePage() {
  const { t } = useI18n();
  const warn = ratio >= cap * 0.8;
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.finance")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Tax & sales cap monitor
        </p>
      </header>

      <section
        className={`rounded-md border p-6 ${warn ? "border-accent/40 bg-accent/5" : "border-border bg-white"}`}
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">{t("fin.cap")}</h2>
          <span className="font-mono text-2xl font-extrabold">{ratio}%</span>
        </div>
        <div className="mt-4 relative h-6 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className={`h-full ${warn ? "bg-accent" : "bg-primary"}`}
            style={{ width: `${(ratio / 40) * 100}%` }}
          />
          <div
            className="absolute top-0 h-full w-px bg-destructive"
            style={{ left: `${(cap / 40) * 100}%` }}
            title="30% cap"
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase text-muted-foreground">
          <span>0%</span>
          <span className="text-destructive">Cap {cap}%</span>
          <span>40%</span>
        </div>
        <p className={`mt-3 text-sm ${warn ? "text-accent" : "text-primary"}`}>
          {warn ? "⚠ " + t("fin.cap.warn") : "✓ " + t("fin.cap.ok")}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-white">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{t("fin.exempt")}</h2>
          </div>
          <ul className="divide-y divide-border">
            {exempt.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.id}</p>
                </div>
                <span className="font-mono font-bold">NT${r.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-border bg-white">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold">{t("fin.taxable")}</h2>
          </div>
          <ul className="divide-y divide-border">
            {taxable.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {r.id} · {t("fin.invoice")}:{" "}
                    <span
                      className={r.invoice === "issued" ? "text-primary" : "text-accent"}
                    >
                      {r.invoice === "issued" ? t("fin.issued") : t("fin.pending")}
                    </span>
                  </p>
                </div>
                <span className="font-mono font-bold">NT${r.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
