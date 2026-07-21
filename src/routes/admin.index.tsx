import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type DictKey } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const kpis: { key: DictKey; value: string; sub: string; tone: "ok" | "warn" | "info" }[] = [
  { key: "admin.dash.pendingMembers", value: "12", sub: "queue · 24h", tone: "warn" },
  { key: "admin.dash.activeCampaigns", value: "8", sub: "3 near threshold", tone: "info" },
  { key: "admin.dash.nonmemberRatio", value: "22%", sub: "cap 30%", tone: "ok" },
  { key: "admin.dash.reserve", value: "NT$3.4M", sub: "YTD +NT$420K", tone: "info" },
];

function toneCls(t: "ok" | "warn" | "info") {
  if (t === "ok") return "border-primary/30";
  if (t === "warn") return "border-accent/40 bg-accent/5";
  return "border-border";
}

function AdminDashboard() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.dashboard")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Overview · Live snapshot
        </p>
      </header>

      <div className="rounded-md border border-accent/40 bg-accent/5 p-4 text-sm">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-accent">
          Demo access · 展示登入
        </p>
        <p>
          Portal URL: <a href="/admin" className="font-mono font-bold underline">/admin</a>
          {" · "}
          Account: <span className="font-mono font-bold">demo@tensqmiles.coop</span>
          {" · "}
          Password: <span className="font-mono font-bold">coop2026</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Switch role in the sidebar (Super Admin · Board · Auditor) — the whole portal is in demo mode with mock data.
        </p>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.key} className={`rounded-md border bg-white p-5 ${toneCls(k.tone)}`}>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t(k.key)}
            </span>
            <p className="mt-2 font-mono text-3xl font-extrabold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <section className="rounded-md border border-border bg-white p-6">
        <h2 className="text-lg font-bold">{t("admin.dash.recent")}</h2>
        <ul className="mt-4 divide-y divide-border text-sm">
          {[
            "Member #0231 submitted verification · 12m ago",
            "Pre-order 'Highland Eggs' hit 71% threshold · 34m ago",
            "Poll 'Vendor selection — Rice' closes in 2 days",
            "Invoice batch #0421 issued (23 taxable) · 2h ago",
            "Board meeting scheduled for 2026-08-14",
          ].map((line) => (
            <li key={line} className="flex items-center gap-3 py-3">
              <span className="size-1.5 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(
          [
            ["admin.nav.members", "/admin/members"],
            ["admin.nav.preorders", "/admin/preorders"],
            ["admin.nav.finance", "/admin/finance"],
          ] as [DictKey, "/admin/members" | "/admin/preorders" | "/admin/finance"][]
        ).map(([k, to]) => (
          <Link
            key={to}
            to={to}
            className="rounded-md border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Jump to</p>
            <p className="mt-1 text-lg font-bold">{t(k)}</p>
            <p className="mt-2 font-mono text-xs text-primary">Open →</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
