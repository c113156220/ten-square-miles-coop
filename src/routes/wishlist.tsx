import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { SiteShell, PageHeader } from "@/components/site-shell";
import { ArrowRight, Plus, Sparkles, X, Bell, CheckCircle2 } from "lucide-react";

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

type Status = "gathering" | "sourcing" | "launched";

type Wish = {
  id: string;
  zh: string;
  en: string;
  category: { zh: string; en: string };
  by: string;
  vendor?: string;
  price?: string;
  votes: number;
  threshold: number;
  status: Status;
  img: string;
};

const seed: Wish[] = [
  { id: "a", zh: "有機糙米 (5kg)", en: "Organic Brown Rice (5kg)", category: { zh: "米糧", en: "Grains" }, by: "陳社員 #0142", vendor: "花蓮玉里合作農場", price: "$620", votes: 87, threshold: 100, status: "gathering", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=70" },
  { id: "b", zh: "冷壓苦茶油 (500ml)", en: "Cold-Pressed Camellia Oil (500ml)", category: { zh: "油品", en: "Oils" }, by: "林社員 #0088", vendor: "南投信義小農", price: "$780", votes: 132, threshold: 120, status: "sourcing", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=70" },
  { id: "c", zh: "無毒香蕉 (10kg 箱)", en: "Pesticide-Free Bananas (10kg box)", category: { zh: "水果", en: "Fruit" }, by: "王社員 #0231", vendor: "屏東里港產銷班", price: "$450", votes: 54, threshold: 80, status: "gathering", img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=70" },
  { id: "d", zh: "純手工客家鹹粄", en: "Handmade Hakka Rice Cake", category: { zh: "加工品", en: "Processed" }, by: "黃社員 #0175", vendor: "苗栗銅鑼阿婆", price: "$220", votes: 41, threshold: 60, status: "gathering", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&q=70" },
  { id: "e", zh: "阿里山高山茶", en: "Alishan High-Mountain Tea", category: { zh: "茶飲", en: "Tea" }, by: "劉社員 #0301", vendor: "石棹製茶所", price: "$1,280", votes: 201, threshold: 150, status: "launched", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=70" },
  { id: "f", zh: "友善栽培鳳梨", en: "Eco-Farmed Pineapples", category: { zh: "水果", en: "Fruit" }, by: "吳社員 #0412", vendor: "台南關廟果園", price: "$380", votes: 96, threshold: 100, status: "sourcing", img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=70" },
];

type FilterKey = "all" | "trending" | "sourcing" | "launched";

function statusBadge(status: Status, locale: "zh" | "en") {
  const map = {
    gathering: { zh: "集氣中", en: "Gathering Votes", cls: "bg-accent/10 text-accent ring-accent/20" },
    sourcing:  { zh: "廠商洽談中", en: "Vendor Sourcing", cls: "bg-primary/10 text-primary ring-primary/20" },
    launched:  { zh: "已轉為預購", en: "Live Pre-order", cls: "bg-cyber/10 text-cyber ring-cyber/30" },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase ring-1 ${s.cls}`}>
      <span className="size-1.5 rounded-full bg-current animate-pulse-glow" />
      {locale === "zh" ? s.zh : s.en}
    </span>
  );
}

function WishlistPage() {
  const { t, locale } = useI18n();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [pledged, setPledged] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterKey>("all");
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);

  const filters: { key: FilterKey; zh: string; en: string }[] = [
    { key: "all", zh: "全部", en: "All" },
    { key: "trending", zh: "熱門集氣", en: "Trending" },
    { key: "sourcing", zh: "採購洽談中", en: "In Review" },
    { key: "launched", zh: "已成團", en: "Launched" },
  ];

  const items = useMemo(() => {
    const list = seed.map((s) => ({ ...s, votes: s.votes + (votes[s.id] ?? 0) }));
    if (filter === "trending") return [...list].sort((a, b) => b.votes - a.votes).slice(0, 4);
    if (filter === "sourcing") return list.filter((s) => s.status === "sourcing");
    if (filter === "launched") return list.filter((s) => s.status === "launched");
    return list;
  }, [filter, votes]);

  const upvote = (id: string) => {
    if (pledged[id]) return;
    setPledged({ ...pledged, [id]: true });
    setVotes({ ...votes, [id]: (votes[id] ?? 0) + 1 });
    // guest nudge — demo triggers 1 in 2 clicks
    if (Math.random() > 0.4) setNudgeOpen(true);
  };

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Community wishlist"
        title={t("wish.title")}
        subtitle={t("wish.subtitle")}
        body={t("wish.body")}
      />

      {/* Controls */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1.5 rounded-full border border-border bg-white/70 p-1 backdrop-blur">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-foreground text-background shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {locale === "zh" ? f.zh : f.en}
            </button>
          ))}
        </div>
        <button
          onClick={() => setProposeOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
        >
          <Plus className="size-4" />
          {locale === "zh" ? "我要提案許願" : "Submit a wish"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const pct = Math.min(100, Math.round((item.votes / item.threshold) * 100));
          const reached = item.votes >= item.threshold;
          return (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white/80 shadow-soft backdrop-blur transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <img src={item.img} alt={locale === "zh" ? item.zh : item.en} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute left-3 top-3">{statusBadge(item.status, locale)}</div>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 font-mono text-[10px] font-semibold text-foreground ring-1 ring-border backdrop-blur">
                  {locale === "zh" ? item.category.zh : item.category.en}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">{locale === "zh" ? item.zh : item.en}</h3>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {t("wish.by")} · {item.by}
                    </p>
                    {item.vendor && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px] uppercase tracking-wider">Vendor:</span> {item.vendor}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => upvote(item.id)}
                    disabled={pledged[item.id]}
                    className="group/btn inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-glow disabled:cursor-default disabled:opacity-60"
                  >
                    <Plus className="size-3.5" />
                    <span className="font-mono">1</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground">{item.votes} pts</span>
                    <span>/ {item.threshold}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        reached ? "bg-gradient-to-r from-primary to-primary-glow" : "bg-gradient-to-r from-accent to-cyber"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {item.price && (
                  <div className="flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                    <span className="uppercase tracking-widest">Est. price</span>
                    <span className="text-lg font-semibold text-foreground">{item.price}</span>
                  </div>
                )}

                {item.status === "launched" && (
                  <Link
                    to="/coop"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
                  >
                    {locale === "zh" ? "前往預購" : "Go to pre-order"} <ArrowRight className="size-3.5" />
                  </Link>
                )}

                {reached && item.status !== "launched" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
                    <p className="flex items-center gap-1.5 font-semibold text-primary">
                      <CheckCircle2 className="size-3.5" />
                      {t("wish.ready")}
                    </p>
                    <p className="mt-1 text-muted-foreground">{t("wish.join")}</p>
                    <Link to="/onboarding" className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary hover:underline">
                      {t("hero.cta.join")} <ArrowRight className="size-3" />
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* My wishlist dashboard */}
      <MyWishlistDashboard />

      {/* Guest nudge modal */}
      {nudgeOpen && (
        <Modal onClose={() => setNudgeOpen(false)}>
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold tracking-tight">
            {locale === "zh" ? "感謝集氣！這個提案正在熱門排行 🔥" : "Thanks for voting! This item is trending 🔥"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "zh"
              ? "成為正式社員即可解鎖共同購買價、優先預購與年度結餘回饋。"
              : "Join as a full member today to unlock Co-op pricing, first-priority pre-ordering, and annual surplus rebates."}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/onboarding"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
              onClick={() => setNudgeOpen(false)}
            >
              {locale === "zh" ? "立即入社" : "Become a member"} <ArrowRight className="size-4" />
            </Link>
            <button
              onClick={() => setNudgeOpen(false)}
              className="rounded-full border border-border bg-white/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-surface"
            >
              {locale === "zh" ? "繼續逛逛" : "Maybe later"}
            </button>
          </div>
        </Modal>
      )}

      {/* Propose modal */}
      {proposeOpen && (
        <Modal onClose={() => setProposeOpen(false)}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight">
              {locale === "zh" ? "提交新願望" : "Submit a new wish"}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {locale === "zh"
              ? "當你的提案成功轉為預購，將自動獲得積點，提高年度結餘分配份額！"
              : "When your wish converts into a campaign, you'll earn Reward Points that boost your annual surplus dividend."}
          </p>
          <form
            className="mt-5 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setProposeOpen(false);
            }}
          >
            <Field label={locale === "zh" ? "商品名稱" : "Item name"} placeholder={locale === "zh" ? "例如：有機黑豆" : "e.g. Organic Black Beans"} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={locale === "zh" ? "分類" : "Category"} placeholder={locale === "zh" ? "米糧 / 蔬果 / 油品…" : "Grains / Produce…"} />
              <Field label={locale === "zh" ? "預估價格" : "Estimated price"} placeholder="$—" />
            </div>
            <Field label={locale === "zh" ? "建議廠商 / 連結" : "Suggested vendor / link"} placeholder="https://…" />
            <label className="grid gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {locale === "zh" ? "說明" : "Description"}
              </span>
              <textarea
                rows={3}
                placeholder={locale === "zh" ? "為什麼想要進這個商品？" : "Why do you want this sourced?"}
                className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm outline-none transition-shadow focus:shadow-glow"
              />
            </label>
            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              <Sparkles className="size-4" />
              {locale === "zh" ? "送出提案" : "Submit wish"}
            </button>
          </form>
        </Modal>
      )}
    </SiteShell>
  );
}

function Field({ label, placeholder, required }: { label: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}{required && <span className="text-accent"> *</span>}
      </span>
      <input
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm outline-none transition-shadow focus:shadow-glow"
      />
    </label>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4 animate-reveal">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-elevated">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function MyWishlistDashboard() {
  const { locale } = useI18n();
  const submissions = [
    { title: locale === "zh" ? "有機糙米 (5kg)" : "Organic Brown Rice (5kg)", status: locale === "zh" ? "廠商洽談中" : "Vendor Sourcing", pts: 12 },
    { title: locale === "zh" ? "阿里山高山茶" : "Alishan High-Mountain Tea", status: locale === "zh" ? "已成團 · +50 積點" : "Launched · +50 pts", pts: 50 },
  ];
  const upvoted = [
    { title: locale === "zh" ? "冷壓苦茶油" : "Cold-Pressed Camellia Oil", note: locale === "zh" ? "即將開放預購" : "Pre-order opening soon", alert: true },
    { title: locale === "zh" ? "友善栽培鳳梨" : "Eco-Farmed Pineapples", note: locale === "zh" ? "集氣中" : "Gathering votes" },
  ];
  return (
    <section className="mt-20 animate-reveal">
      <div className="mb-6 border-b border-border pb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Member dashboard</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          {locale === "zh" ? "我的願望追蹤" : "My Wishlist Dashboard"}
        </h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white/80 p-5 shadow-soft backdrop-blur">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" />
            {locale === "zh" ? "我提出的願望" : "My Submissions"}
          </h3>
          <ul className="divide-y divide-border">
            {submissions.map((s) => (
              <li key={s.title} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.status}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                  +{s.pts} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-white/80 p-5 shadow-soft backdrop-blur">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Bell className="size-4 text-accent" />
            {locale === "zh" ? "我集氣的商品" : "My Upvoted Items"}
          </h3>
          <ul className="divide-y divide-border">
            {upvoted.map((s) => (
              <li key={s.title} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.note}</p>
                </div>
                {s.alert && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase text-accent ring-1 ring-accent/20">
                    <span className="size-1.5 rounded-full bg-accent animate-pulse-glow" />
                    New
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
