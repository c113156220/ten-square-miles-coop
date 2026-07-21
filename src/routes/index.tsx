import { createFileRoute } from "@tanstack/react-router";
import { useI18n, type Locale, type DictKey } from "@/lib/i18n";
import eggsImg from "@/assets/product-eggs.jpg";
import soyImg from "@/assets/product-soysauce.jpg";
import vegImg from "@/assets/product-veggies.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Nav() {
  const { locale, setLocale, t } = useI18n();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="/" className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tighter">十圓方里</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Ten Sq Miles
            </span>
          </a>
          <div className="hidden gap-6 text-sm font-medium md:flex">
            {(["nav.shop", "nav.surveys", "nav.governance"] as DictKey[]).map((k) => (
              <a key={k} href="#" className="transition-colors hover:text-primary">
                {locale === "zh" ? (
                  <>
                    {t(k)}
                    <span className="-mt-1 block font-mono text-[10px] text-muted-foreground">
                      {k === "nav.shop" ? "Shop" : k === "nav.surveys" ? "Surveys" : "Governance"}
                    </span>
                  </>
                ) : (
                  <>{t(k)}</>
                )}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LangSwitch locale={locale} setLocale={setLocale} />
          <div className="h-4 w-px bg-border" />
          <button className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all hover:bg-primary/5">
            {t("nav.login")}
          </button>
        </div>
      </div>
    </nav>
  );
}

function LangSwitch({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <div className="flex overflow-hidden rounded border border-border font-mono text-[11px]">
      <button
        onClick={() => setLocale("zh")}
        className={`px-2 py-1 transition-colors ${
          locale === "zh" ? "bg-primary text-primary-foreground" : "hover:bg-black/5"
        }`}
      >
        繁中
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 transition-colors ${
          locale === "en" ? "bg-primary text-primary-foreground" : "hover:bg-black/5"
        }`}
      >
        EN
      </button>
    </div>
  );
}

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
        <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
          {t("hero.body")}
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-sm bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110">
            {t("hero.cta.browse")}
          </button>
          <button className="rounded-sm border border-border bg-transparent px-6 py-3 font-semibold transition-all hover:bg-white">
            {t("hero.cta.join")}
          </button>
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
          <span
            className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${statusBg(p.statusTone)}`}
          >
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
            <span>
              {p.current} / {p.target}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${p.progress}%` }}
            />
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
            <div
              className="h-full bg-accent transition-all duration-1000"
              style={{ width: `${p.progress}%` }}
            />
          </div>
          <div className="flex items-end justify-between pt-2">
            <button className="border-b-2 border-accent pb-0.5 text-xs font-bold">
              {t("card.wish")}
            </button>
            <div className="text-right">
              <span className="block text-xs text-muted-foreground italic">
                {t("card.estPrice")}
              </span>
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
          <p className="mt-1 text-[10px] tracking-tight text-muted-foreground uppercase">
            {t("card.cold")}
          </p>
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

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-stone-100 py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 text-sm md:flex-row">
        <div className="max-w-xs space-y-4">
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tighter">十圓方里</span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Ten Sq Miles Co-op
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("footer.about")}</p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase">{t("footer.admin")}</h4>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary">{t("footer.link.agm")}</a></li>
              <li><a href="#" className="hover:text-primary">{t("footer.link.reserve")}</a></li>
              <li><a href="#" className="hover:text-primary">{t("footer.link.verify")}</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase">{t("footer.ops")}</h4>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary">{t("footer.link.nonmember")}</a></li>
              <li><a href="#" className="hover:text-primary">{t("footer.link.logistics")}</a></li>
              <li><a href="#" className="hover:text-primary">{t("footer.link.inventory")}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <Hero />
        <ActivePreorders />
        <Surplus />
      </main>
      <Footer />
    </div>
  );
}
