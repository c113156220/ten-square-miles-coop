import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "社會影響力 Impact — 十圓方里" },
      { name: "description", content: "Public dashboard: student grants, local farmer support, plastic and carbon reduction." },
      { property: "og:title", content: "Impact & Sustainability — Ten Sq Miles Co-op" },
      { property: "og:description", content: "How our reserve fund and operations return value to society." },
    ],
  }),
  component: ImpactPage,
});

const stats: { key: DictKey; value: string; sub: string; tone: "primary" | "accent" | "stone" }[] = [
  { key: "impact.grants", value: "NT$1.2M", sub: "42 students · 3 semesters", tone: "primary" },
  { key: "impact.farmers", value: "68", sub: "partner farms across 9 counties", tone: "primary" },
  { key: "impact.plastic", value: "2,140 kg", sub: "avoided via reusable crates", tone: "accent" },
  { key: "impact.co2", value: "18.7 t", sub: "vs. supermarket baseline", tone: "accent" },
  { key: "impact.donated", value: "NT$480K", sub: "public good grants YTD", tone: "stone" },
  { key: "impact.meals", value: "9,320", sub: "community meals delivered", tone: "stone" },
];

function toneClass(tone: "primary" | "accent" | "stone") {
  if (tone === "primary") return "border-primary/30 bg-primary text-primary-foreground";
  if (tone === "accent") return "border-accent/30 bg-accent text-accent-foreground";
  return "border-border bg-white text-foreground";
}

function ImpactPage() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Public dashboard"
        title={t("impact.title")}
        subtitle={t("impact.subtitle")}
        body={t("impact.body")}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.key} className={`rounded-md border p-6 ${toneClass(s.tone)}`}>
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">{t(s.key)}</span>
            <p className="mt-2 font-mono text-3xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-xs opacity-80">{s.sub}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-md border border-border bg-white p-6">
        <h2 className="text-lg font-bold">Reserve fund allocation · 公積金流向</h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "Student grants 助學金", pct: 42 },
            { label: "Farmer resilience 農民互助", pct: 28 },
            { label: "Community meals 共餐計畫", pct: 18 },
            { label: "Operations reserve 運營備轉", pct: 12 },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex justify-between font-mono text-xs">
                <span>{r.label}</span>
                <span>{r.pct}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
