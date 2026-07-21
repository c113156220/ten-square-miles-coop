import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useI18n, type Locale, type DictKey } from "@/lib/i18n";

const PUBLIC_NAV: { to: string; label: { zh: string; en: string } }[] = [
  { to: "/", label: { zh: "共同購買", en: "Shop" } },
  { to: "/coop", label: { zh: "共購流程", en: "Co-op Buying" } },
  { to: "/wishlist", label: { zh: "願望清單", en: "Wishlist" } },
  { to: "/calculator", label: { zh: "分紅試算", en: "Calculator" } },
  { to: "/impact", label: { zh: "社會影響力", en: "Impact" } },
  { to: "/register", label: { zh: "註冊入社", en: "Register" } },
];

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

export function SiteNav() {
  const { locale, setLocale, t } = useI18n();
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tighter">十圓方里</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Ten Sq Miles
            </span>
          </Link>
          <div className="hidden gap-5 text-sm font-medium lg:flex">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary" }}
                className="transition-colors hover:text-primary"
              >
                {item.label[locale]}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="hidden rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-border transition-colors hover:text-primary md:inline-block"
          >
            {t("nav.admin")}
          </Link>
          <LangSwitch locale={locale} setLocale={setLocale} />
          <div className="hidden h-4 w-px bg-border md:block" />
          <button className="rounded-full px-3 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all hover:bg-primary/5">
            {t("nav.login")}
          </button>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
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
              <li><Link to="/admin/voting" className="hover:text-primary">{t("footer.link.agm")}</Link></li>
              <li><Link to="/admin/surplus" className="hover:text-primary">{t("footer.link.reserve")}</Link></li>
              <li><Link to="/admin/members" className="hover:text-primary">{t("footer.link.verify")}</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase">{t("footer.ops")}</h4>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li><Link to="/admin/finance" className="hover:text-primary">{t("footer.link.nonmember")}</Link></li>
              <li><Link to="/admin/preorders" className="hover:text-primary">{t("footer.link.logistics")}</Link></li>
              <li><Link to="/admin/preorders" className="hover:text-primary">{t("footer.link.inventory")}</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  body,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
}) {
  return (
    <header className="animate-reveal mb-10 max-w-[65ch] space-y-3">
      {eyebrow && (
        <span className="font-mono text-[11px] tracking-widest uppercase text-accent">
          {eyebrow}
        </span>
      )}
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
        {title}
        {subtitle && (
          <span
            className="mt-1 block text-2xl font-normal italic text-muted-foreground md:text-3xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {subtitle}
          </span>
        )}
      </h1>
      {body && <p className="text-base leading-relaxed text-muted-foreground">{body}</p>}
    </header>
  );
}
