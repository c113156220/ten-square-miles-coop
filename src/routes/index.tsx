import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteShell } from "@/components/site-shell";
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
  const { t } = useI18n();
  return (
    <section className="animate-reveal mb-20">
      <div className="max-w-[65ch] space-y-6">
        <h1 className="text-5xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-6xl">
          {t("hero.title.1")}
          <br />
          {t("hero.title.2")}
          <br />
          <span
            className="text-3xl leading-relaxed font-normal text-muted-foreground italic md:text-4xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("hero.subtitle")}
          </span>
        </h1>
        <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{t("hero.body")}</p>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-sm bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
            {t("hero.cta.browse")}
          </button>
          <Link
            to="/trial"
            className="rounded-sm border border-border bg-transparent px-6 py-3 font-semibold transition-all hover:bg-white"
          >
            {t("hero.cta.join")}
          </Link>
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
  {
    img: eggsImg,
    nameKey: "product.eggs.name",
    descKey: "product.eggs.desc",
    statusKey: "status.preordering",
    statusTone: "primary",
    taxKey: "tax.exempt",
    variant: "preorder",
    progress: 71,
    current: 142,
    target: 200,
    deposit: 180,
  },
  {
    img: soyImg,
    nameKey: "product.soy.name",
    descKey: "product.soy.desc",
    statusKey: "status.surveying",
    statusTone: "accent",
    taxKey: "tax.standard",
    variant: "survey",
    progress: 85,
    estPrice: "$350+",
  },
  {
    img: vegImg,
    nameKey: "product.veg.name",
    descKey: "product.veg.desc",
    statusKey: "status.sourcing",
    statusTone: "stone",
    taxKey: "tax.exempt",
    variant: "sourcing",
    pickupDate: "2026.07.31 (Fri)",
  },
];

function statusBg(tone: Product["statusTone"]) {
  if (tone === "primary") return "bg-primary text-primary-foreground";
  if (tone === "accent") return "bg-accent text-accent-foreground";
  return "bg-stone-600 text-white";
}

function ProductCard({ p }: { p: Product }) {
  const { t } = useI18n();
  return (
    <div className="group space-y-4">
      <div className="relative overflow-hidden rounded-md">
        <img
          src={p.img}
          alt={t(p.nameKey)}
          className="aspect-[4/5] w-full object-cover outline-1 -outline-offset-1 outline-black/5 transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${statusBg(p.statusTone)}`}>
            {t(p.statusKey)}
          </span>
          <span className="rounded-sm border border-black/5 bg-white/90 px-2 py-0.5 text-[10px] font-bold text-foreground">
            {t(p.taxKey)}
          </span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold">{t(p.nameKey)}</h3>
        <p className="text-sm text-muted-foreground">{t(p.descKey)}</p>
      </div>

      {p.variant === "preorder" && (
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-xs">
            <span>{t("card.threshold")}</span>
            <span>{p.current} / {p.target}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${p.progress}%` }} />
          </div>
          <div className="flex items-end justify-between pt-1">
            <div className="font-mono text-xs leading-tight text-muted-foreground uppercase">
              {t("card.deadline")}
              <br />
              <span className="font-bold text-foreground">{t("card.daysLeft")}</span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-muted-foreground">{t("card.deposit")}</span>
              <span className="font-mono text-xl font-bold">${p.deposit}</span>
            </div>
          </div>
        </div>
      )}

      {p.variant === "survey" && (
        <div className="space-y-2">
          <div className="flex justify-between font-mono text-xs">
            <span>{t("card.demand")}</span>
            <span>{p.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${p.progress}%` }} />
          </div>
          <div className="flex items-end justify-between pt-2">
            <Link to="/wishlist" className="border-b-2 border-accent pb-0.5 text-xs font-bold">
              {t("card.wish")}
            </Link>
            <div className="text-right">
              <span className="block text-xs text-muted-foreground italic">{t("card.estPrice")}</span>
              <span className="font-mono text-lg font-bold">{p.estPrice}</span>
            </div>
          </div>
        </div>
      )}

      {p.variant === "sourcing" && (
        <div className="rounded border border-black/5 bg-stone-100 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-bold">{t("card.pickup")}</span>
          </div>
          <p className="font-mono text-sm">{p.pickupDate}</p>
          <p className="mt-1 text-[10px] tracking-tight text-muted-foreground uppercase">{t("card.cold")}</p>
        </div>
      )}
    </div>
  );
}

function ActivePreorders() {
  const { t } = useI18n();
  return (
    <section className="animate-reveal mb-20" style={{ animationDelay: "150ms" }}>
      <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold">{t("section.active")}</h2>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {t("section.active.sub")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          <span className="font-mono text-xs uppercase">{t("section.active.alert")}</span>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.nameKey} p={p} />
        ))}
      </div>
    </section>
  );
}

function GuestModulesGrid() {
  const { t, locale } = useI18n();
  const cards = [
    {
      to: "/trial" as const,
      title: t("nav.trial"),
      sub: locale === "zh" ? "30 天體驗＋闖關解鎖迎新券" : "30-day pass, quest for a welcome voucher",
      badge: locale === "zh" ? "新" : "NEW",
    },
    {
      to: "/calculator" as const,
      title: t("nav.calculator"),
      sub: locale === "zh" ? "算算成為社員每年能拿回多少" : "See your annual surplus return",
    },
    {
      to: "/wishlist" as const,
      title: t("nav.wishlist"),
      sub: locale === "zh" ? "為想要的商品集氣 +1" : "+1 the products you want sourced",
    },
    {
      to: "/impact" as const,
      title: t("nav.impact"),
      sub: locale === "zh" ? "公積金與環境影響的公開帳目" : "Public ledger of reserve fund & impact",
    },
  ];
  return (
    <section className="animate-reveal mb-20" style={{ animationDelay: "225ms" }}>
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-extrabold">
          {locale === "zh" ? "非社員也能參與" : "You don't have to be a member yet"}
        </h2>
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
          Guest onboarding
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative flex flex-col justify-between rounded-md border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            {c.badge && (
              <span className="absolute right-3 top-3 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-accent-foreground">
                {c.badge}
              </span>
            )}
            <div>
              <h3 className="text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.sub}</p>
            </div>
            <span className="mt-6 font-mono text-[11px] uppercase tracking-widest text-primary transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Surplus() {
  const { t } = useI18n();
  return (
    <section className="animate-reveal mb-20" style={{ animationDelay: "300ms" }}>
      <div className="grid items-center gap-12 rounded-sm bg-primary p-8 text-primary-foreground md:grid-cols-2 md:p-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("surplus.title")}
            <br />
            <span
              className="text-2xl font-normal opacity-80 italic"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("surplus.subtitle")}
            </span>
          </h2>
          <p className="text-sm leading-relaxed opacity-90">{t("surplus.body")}</p>
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase">{t("surplus.points")}</span>
              <span className="font-mono text-2xl font-bold">1,240 pts</span>
            </div>
          </div>
          <Link
            to="/calculator"
            className="inline-block rounded-sm bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/30 transition-colors hover:bg-white/20"
          >
            {t("calc.cta")} →
          </Link>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase">
              <span>{t("surplus.reserve")}</span>
              <span>{t("surplus.returns")}</span>
            </div>
            <div className="flex h-12 w-full border border-white/20 p-1">
              <div className="h-full w-1/2 bg-white/20" />
              <div className="h-full w-1/2 bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="border border-white/20 p-3">
              <span className="mb-1 block opacity-60">{t("surplus.revenue")}</span>
              <span className="text-lg font-bold">$4.2M</span>
            </div>
            <div className="border border-white/20 p-3">
              <span className="mb-1 block opacity-60">{t("surplus.ready")}</span>
              <span className="text-lg font-bold">$840K</span>
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
