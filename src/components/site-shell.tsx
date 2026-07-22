import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TrialBadge } from "@/components/auth-modals";

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
    <div className="flex overflow-hidden rounded-full border border-border bg-white/60 p-0.5 font-mono text-[11px] backdrop-blur">
      <button
        onClick={() => setLocale("zh")}
        className={`rounded-full px-2.5 py-1 transition-all ${
          locale === "zh" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        繁中
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`rounded-full px-2.5 py-1 transition-all ${
          locale === "en" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export function SiteNav() {
  const { locale, setLocale, t } = useI18n();
  const { user, isAdmin, openLogin, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background shadow-soft">
              <Sparkles className="size-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">十圓方里</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Ten Sq Miles
              </span>
            </span>
          </Link>
          <div className="hidden gap-1 text-sm font-medium lg:flex">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-surface text-foreground" }}
                className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label[locale]}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrialBadge />
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden rounded-full border border-border bg-white/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-all hover:text-foreground md:inline-block"
            >
              {t("nav.admin")}
            </Link>
          )}
          <LangSwitch locale={locale} setLocale={setLocale} />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold md:inline">
                {user.name}
                <span className="ml-1 rounded-full bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {user.role}
                </span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-border bg-white/60 px-3 py-1.5 text-xs font-semibold hover:bg-surface"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={openLogin}
              className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background shadow-soft transition-all hover:shadow-elevated"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-surface/60 py-14 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 px-4 text-sm md:flex-row">
        <div className="max-w-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight">十圓方里</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Ten Sq Miles Co-op
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("footer.about")}</p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{t("footer.admin")}</h4>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li><Link to="/admin/voting" className="hover:text-primary">{t("footer.link.agm")}</Link></li>
              <li><Link to="/admin/surplus" className="hover:text-primary">{t("footer.link.reserve")}</Link></li>
              <li><Link to="/admin/members" className="hover:text-primary">{t("footer.link.verify")}</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">{t("footer.ops")}</h4>
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
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/15">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh" />
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
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent backdrop-blur">
          <span className="size-1.5 rounded-full bg-accent animate-pulse-glow" />
          {eyebrow}
        </span>
      )}
      <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
        <span className="text-gradient">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-2xl font-normal text-muted-foreground md:text-3xl">
            {subtitle}
          </span>
        )}
      </h1>
      {body && <p className="text-base leading-relaxed text-muted-foreground">{body}</p>}
    </header>
  );
}
