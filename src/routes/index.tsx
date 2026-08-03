import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteShell } from "@/components/site-shell";
import { ArrowRight, Sparkles, Zap, Leaf, ShieldCheck } from "lucide-react";
import eggsImg from "@/assets/product-eggs.jpg";
import soyImg from "@/assets/product-soysauce.jpg";
import vegImg from "@/assets/product-veggies.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "十圓方里 Ten Sq Miles — 共同購買 Shop" },
      {
        name: "description",
        content:
          "即時預購中的在地食材、透明供應與結餘回饋。Live pre-orders, transparent sourcing, member-first surplus sharing.",
      },
      { property: "og:title", content: "十圓方里 — 共同購買 Shop" },
      { property: "og:description", content: "Live pre-orders and member-first surplus sharing." },
    ],
  }),
  component: Home,
});

function Hero() {
  const { t, locale } = useI18n();
  return (
    <section className="animate-reveal relative mb-24 overflow-hidden rounded-3xl border border-border bg-white/60 shadow-soft backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-tech-grid opacity-60" />
      <div className="absolute inset-0 -z-10 bg-mesh" />
      <div className="grid gap-10 p-10 md:grid-cols-[1.3fr_1fr] md:p-16">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {locale === "zh" ? "AI 需求預測啟用中" : "AI Forecasting Active"}
          </div>
          <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-balance md:text-6xl">
            <span className="text-gradient">{t("hero.title.1")}</span>
            <br />
            <span className="text-gradient">{t("hero.title.2")}</span>
            <br />
            <span className="text-2xl font-medium text-muted-foreground md:text-3xl">
              {t("hero.subtitle")}
            </span>
          </h1>
          <p className="max-w-[55ch] text-base leading-relaxed text-muted-foreground">{t("hero.body")}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/coop"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:brightness-110"
            >
              <Sparkles className="size-4" />
              {t("hero.cta.browse")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-6 py-3 font-semibold text-foreground shadow-soft transition-all hover:shadow-elevated"
            >
              {t("hero.cta.join")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-center">
          {[
            { icon: Zap, label: locale === "zh" ? "零庫存預購" : "Zero Inventory", val: "142+" },
            { icon: Leaf, label: locale === "zh" ? "免稅一級農產" : "Tax-Exempt SKUs", val: "38" },
            { icon: ShieldCheck, label: locale === "zh" ? "實名社員" : "Verified Members", val: "1,240" },
            { icon: Sparkles, label: locale === "zh" ? "累積積點" : "Reward Points", val: "82K" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-white/80 p-4 shadow-soft backdrop-blur">
              <s.icon className="size-4 text-primary" />
              <p className="mt-3 font-mono text-2xl font-semibold tracking-tight">{s.val}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type Product = {
  img: string;
  nameKey: DictKey;
  descKey: DictKey;
  statusKey: DictKey;
  statusTone: "primary" | "accent" | "stone";
  taxKey: DictKey;
  variant: "preorder" | "survey" | "sourcing";
  progress?: number;
  current?: number;
  target?: number;
  deposit?: number;
  estPrice?: string;
  pickupDate?: string;
};

const products: Product[] = [
  { img: eggsImg, nameKey: "product.eggs.name", descKey: "product.eggs.desc", statusKey: "status.preordering", statusTone: "primary", taxKey: "tax.exempt", variant: "preorder", progress: 71, current: 142, target: 200, deposit: 180 },
  { img: soyImg, nameKey: "product.soy.name", descKey: "product.soy.desc", statusKey: "status.surveying", statusTone: "accent", taxKey: "tax.standard", variant: "survey", progress: 85, estPrice: "$350+" },
  { img: vegImg, nameKey: "product.veg.name", descKey: "product.veg.desc", statusKey: "status.sourcing", statusTone: "stone", taxKey: "tax.exempt", variant: "sourcing", pickupDate: "2026.07.31 (Fri)" },
];

function statusChip(tone: Product["statusTone"]) {
  if (tone === "primary") return "bg-primary/10 text-primary ring-1 ring-primary/20";
  if (tone === "accent") return "bg-accent/10 text-accent ring-1 ring-accent/20";
  return "bg-foreground/5 text-foreground ring-1 ring-foreground/10";
}

function ProductCard({ p }: { p: Product }) {
  const { t } = useI18n();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={p.img} alt={t(p.nameKey)} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase backdrop-blur ${statusChip(p.statusTone)}`}>
            <span className="size-1.5 rounded-full bg-current animate-pulse-glow" />
            {t(p.statusKey)}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 font-mono text-[10px] font-semibold text-foreground ring-1 ring-border backdrop-blur">
            {t(p.taxKey)}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{t(p.nameKey)}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{t(p.descKey)}</p>
        </div>

        {p.variant === "preorder" && (
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>{t("card.threshold")}</span>
              <span className="text-foreground">{p.current} / {p.target}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000" style={{ width: `${p.progress}%` }} />
            </div>
            <div className="flex items-end justify-between border-t border-border pt-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("card.deadline")}<br />
                  <span className="font-semibold text-foreground">{t("card.daysLeft")}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{t("card.deposit")}</span>
                    <span className="font-mono text-xl font-semibold tracking-tight">${p.deposit}</span>
                  </div>
                  
                    {/* ✅ 新增帶有商品 ID 的預購按鈕 */}
                    <Link
                      to="/coop"
                      hash={p.nameKey.includes("eggs") ? "product-eggs" : "product-item"}
                      className="rounded-full bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background shadow-soft transition-all hover:bg-foreground/80 hover:shadow-elevated whitespace-nowrap"
                    >
                      立即預購
                    </Link>
                </div>
              </div>
          </div>
        )}

        {p.variant === "survey" && (
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs text-muted-foreground">
              <span>{t("card.demand")}</span>
              <span className="text-foreground">{p.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-cyber transition-all duration-1000" style={{ width: `${p.progress}%` }} />
            </div>
            <div className="flex items-end justify-between border-t border-border pt-3">
              <Link to="/wishlist" className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                {t("card.wish")} <ArrowRight className="size-3" />
              </Link>
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{t("card.estPrice")}</span>
                <span className="font-mono text-lg font-semibold">{p.estPrice}</span>
              </div>
            </div>
          </div>
        )}

        {p.variant === "sourcing" && (
          <div className="rounded-xl border border-border bg-surface/60 p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-semibold">{t("card.pickup")}</span>
            </div>
            <p className="font-mono text-sm">{p.pickupDate}</p>
            <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">{t("card.cold")}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function ActivePreorders() {
  const { t } = useI18n();
  return (
    <section className="animate-reveal mb-24" style={{ animationDelay: "150ms" }}>
      <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("section.active")}</h2>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("section.active.sub")}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1.5 backdrop-blur md:flex">
          <span className="size-1.5 rounded-full bg-accent animate-pulse-glow" />
          <span className="font-mono text-[10px] uppercase tracking-wider">{t("section.active.alert")}</span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p.nameKey} p={p} />)}
      </div>
    </section>
  );
}

function GuestModulesGrid() {
  const { t, locale } = useI18n();
  const cards = [
    {
      to: "/onboarding" as const,
      title: locale === "zh" ? "會員教育啟蒙" : "Member Onboarding",
      sub: locale === "zh" ? "4 步驟解鎖 30 天通行證＋NT$100 迎新券" : "4-step activation → 30-day pass + NT$100 voucher",
      badge: "NEW",
      cta: locale === "zh" ? "立即體驗" : "Start trial",
    },
    { to: "/calculator" as const, title: t("nav.calculator"), sub: locale === "zh" ? "算算成為社員每年能拿回多少" : "See your annual surplus return" },
    { to: "/wishlist" as const, title: t("nav.wishlist"), sub: locale === "zh" ? "為想要的商品集氣 +1" : "+1 the products you want sourced" },
    { to: "/impact" as const, title: t("nav.impact"), sub: locale === "zh" ? "公積金與環境影響的公開帳目" : "Public ledger of reserve fund & impact" },
  ];
  return (
    <section className="animate-reveal mb-24" style={{ animationDelay: "225ms" }}>
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {locale === "zh" ? "非社員也能參與" : "You don't have to be a member yet"}
        </h2>
        <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          Guest onboarding
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-white/80 p-5 shadow-soft backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
          >
            {c.badge && (
              <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase text-primary ring-1 ring-primary/20">
                {c.badge}
              </span>
            )}
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.sub}</p>
            </div>
            {"cta" in c ? (
              <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow transition-transform group-hover:translate-x-1">
                {c.cta}
                <ArrowRight className="size-3" />
              </span>
            ) : (
              <span className="mt-6 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary transition-transform group-hover:translate-x-1">
                Explore <ArrowRight className="size-3" />
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Surplus() {
  const { t } = useI18n();
  return (
    <section className="animate-reveal mb-24" style={{ animationDelay: "300ms" }}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground text-background shadow-elevated">
        <div className="absolute inset-0 -z-0 opacity-30 bg-tech-grid" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 -z-0 size-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(158 64% 45% / 0.6), transparent 70%)" }}
        />
        <div className="relative grid items-center gap-12 p-10 md:grid-cols-2 md:p-14">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary-glow">
              <span className="size-1.5 rounded-full bg-primary-glow animate-pulse-glow" />
              Surplus Engine
            </span>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-gradient-cyber">{t("surplus.title")}</span>
              <br />
              <span className="text-xl font-normal text-white/60 md:text-2xl">{t("surplus.subtitle")}</span>
            </h2>
            <p className="text-sm leading-relaxed text-white/70">{t("surplus.body")}</p>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">{t("surplus.points")}</span>
                <span className="font-mono text-2xl font-semibold">1,240 pts</span>
              </div>
            </div>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2 rounded-full bg-primary-glow px-4 py-2 text-sm font-semibold text-foreground shadow-glow transition-all hover:brightness-110"
            >
              {t("calc.cta")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase text-white/60">
                <span>{t("surplus.reserve")}</span>
                <span>{t("surplus.returns")}</span>
              </div>
              <div className="flex h-14 w-full overflow-hidden rounded-full border border-white/10 p-1">
                <div className="h-full w-1/2 rounded-full bg-white/15" />
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary-glow to-cyber" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-white/60">{t("surplus.revenue")}</span>
                <span className="text-2xl font-semibold">$4.2M</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-white/60">{t("surplus.ready")}</span>
                <span className="text-2xl font-semibold">$840K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <SiteShell>
      <Hero />
      <ActivePreorders />
      <GuestModulesGrid />
      <Surplus />
    </SiteShell>
  );
}
