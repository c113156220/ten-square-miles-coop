import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "公開願望清單 Community Wishlist — 十圓方里" },
      { name: "description", content: "Vote on sourcing proposals from co-op members. +1 the items you want us to bring in." },
      { property: "og:title", content: "Community Wishlist — Ten Sq Miles Co-op" },
      { property: "og:description", content: "Vote on sourcing proposals from co-op members." },
    ],
  }),
  component: WishlistPage,
});

const seed = [
  { id: "a", zh: "有機糙米 (5kg)", en: "Organic Brown Rice (5kg)", by: "陳社員 #0142", votes: 87, threshold: 100 },
  { id: "b", zh: "冷壓苦茶油", en: "Cold-Pressed Camellia Oil", by: "林社員 #0088", votes: 132, threshold: 120 },
  { id: "c", zh: "無毒香蕉 (10kg 箱)", en: "Pesticide-Free Bananas (10kg box)", by: "王社員 #0231", votes: 54, threshold: 80 },
  { id: "d", zh: "純手工客家鹹粄", en: "Handmade Hakka Rice Cake", by: "黃社員 #0175", votes: 41, threshold: 60 },
];

function WishlistPage() {
  const { t, locale } = useI18n();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [pledged, setPledged] = useState<Record<string, boolean>>({});

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Community wishlist"
        title={t("wish.title")}
        subtitle={t("wish.subtitle")}
        body={t("wish.body")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {seed.map((item) => {
          const current = item.votes + (votes[item.id] ?? 0);
          const pct = Math.min(100, Math.round((current / item.threshold) * 100));
          const reached = current >= item.threshold;
          return (
            <article key={item.id} className="rounded-md border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{locale === "zh" ? item.zh : item.en}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("wish.by")} · {item.by}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (pledged[item.id]) return;
                    setPledged({ ...pledged, [item.id]: true });
                    setVotes({ ...votes, [item.id]: (votes[item.id] ?? 0) + 1 });
                  }}
                  disabled={pledged[item.id]}
                  className="shrink-0 rounded-sm border border-accent bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {t("wish.plus")}
                </button>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span>{current} pts</span>
                  <span>/ {item.threshold}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full transition-all duration-700 ${reached ? "bg-primary" : "bg-accent"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              {reached && (
                <div className="mt-4 rounded-sm border border-primary/20 bg-primary/5 p-3 text-sm">
                  <p className="font-semibold text-primary">🎯 {t("wish.ready")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("wish.join")}</p>
                  <Link
                    to="/trial"
                    className="mt-2 inline-block font-mono text-[11px] uppercase tracking-widest text-primary underline underline-offset-2"
                  >
                    {t("hero.cta.join")} →
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </SiteShell>
  );
}
