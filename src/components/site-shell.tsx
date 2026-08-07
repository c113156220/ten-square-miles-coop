import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useI18n, type Locale } from "@/lib/i18n";
import { Sparkles, ShoppingBag, Landmark } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { TrialBadge } from "@/components/auth-modals";
import { AiSupportWidget } from "@/components/ai-support";

type NavItem = { to: string; label: { zh: string; en: string } };

const STORE_NAV: NavItem[] = [
  { to: "/", label: { zh: "共同購買", en: "Shop" } },
  { to: "/coop", label: { zh: "共購流程", en: "Co-op Buying" } },
  { to: "/member-center", label: { zh: "會員中心", en: "Member Center" } },
  { to: "/orders", label: { zh: "訂單紀錄", en: "Orders" } },
  { to: "/wishlist", label: { zh: "願望清單", en: "Wishlist" } },
  { to: "/calculator", label: { zh: "分紅試算", en: "Calculator" } },
];

const GOVERNANCE_NAV: NavItem[] = [
  { to: "/governance", label: { zh: "社務大廳", en: "Governance" } },
  { to: "/impact", label: { zh: "社會影響力", en: "Impact" } },
  { to: "/onboarding", label: { zh: "註冊入社", en: "Register" } },
];

function LangSwitch({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <div className="flex overflow-hidden rounded-full border border-border bg-white/60 p-0.5 font-mono text-[11px] backdrop-blur">
      <button
        onClick={() => setLocale("zh")}
        className={`whitespace-nowrap rounded-full px-2.5 py-1 transition-all ${
          locale === "zh" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        繁中
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`whitespace-nowrap rounded-full px-2.5 py-1 transition-all ${
          locale === "en" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}

function SystemSwitcher({ mode, locale }: { mode: "store" | "governance"; locale: Locale }) {
  return (
    <div className="hidden overflow-hidden rounded-full border border-border bg-white/60 p-0.5 shadow-soft backdrop-blur md:flex">
      <Link
        to="/"
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
          mode === "store" ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ShoppingBag className="size-3.5" />
        {locale === "zh" ? "共同購買" : "Store"}
      </Link>
      <Link
        to="/governance"
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
          mode === "governance" ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Landmark className="size-3.5" />
        {locale === "zh" ? "社務大廳" : "Governance"}
      </Link>
    </div>
  );
}

export function SiteNav() {
  const { locale, setLocale, t } = useI18n();
  const { user, isAdmin, openLogin, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode: "store" | "governance" =
    pathname.startsWith("/governance") || pathname.startsWith("/impact") || pathname.startsWith("/onboarding")
      ? "governance"
      : "store";
  const items = mode === "governance" ? GOVERNANCE_NAV : STORE_NAV;
  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background shadow-soft shrink-0">
              <Sparkles className="size-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">十圓方里</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
                Ten Sq Miles
              </span>
            </span>
          </Link>
          <SystemSwitcher mode={mode} locale={locale} />
          <div className="hidden gap-1 text-sm font-medium xl:flex">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{ className: "bg-surface text-foreground" }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
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
                className="hidden whitespace-nowrap rounded-full border border-border bg-white/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-all hover:text-foreground md:inline-block"
              >
                {t("nav.admin")}
              </Link>
            )}
            <LangSwitch locale={locale} setLocale={setLocale} />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold md:inline-flex">
                  <span className="whitespace-nowrap">{user.name}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {user.memberId ?? user.role}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="whitespace-nowrap rounded-full border border-border bg-white/60 px-3 py-1.5 text-xs font-semibold hover:bg-surface"
                >
                  登出
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
      <AiSupportWidget />
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
