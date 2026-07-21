import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteNav } from "@/components/site-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "後台管理 Admin Portal — 十圓方里" },
      { name: "description", content: "Co-op admin portal for member verification, pre-orders, finance, voting and surplus." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Portal — Ten Sq Miles Co-op" },
      { property: "og:description", content: "Co-op admin & operations control panel." },
    ],
  }),
  component: AdminLayout,
});

type Role = "admin" | "board" | "auditor";

const NAV: { to: string; key: DictKey; roles: Role[] }[] = [
  { to: "/admin", key: "admin.nav.dashboard", roles: ["admin", "board", "auditor"] },
  { to: "/admin/members", key: "admin.nav.members", roles: ["admin", "board"] },
  { to: "/admin/preorders", key: "admin.nav.preorders", roles: ["admin", "board"] },
  { to: "/admin/forecasting", key: "admin.nav.forecasting", roles: ["admin", "board"] },
  { to: "/admin/finance", key: "admin.nav.finance", roles: ["admin", "board", "auditor"] },
  { to: "/admin/voting", key: "admin.nav.voting", roles: ["admin", "board"] },
  { to: "/admin/surplus", key: "admin.nav.surplus", roles: ["admin", "auditor"] },
  { to: "/admin/roles", key: "admin.nav.roles", roles: ["admin"] },
];

function AdminLayout() {
  const { t } = useI18n();
  const [role, setRole] = useState<Role>("admin");
  const [open, setOpen] = useState(true);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const visible = NAV.filter((n) => n.roles.includes(role));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="mx-auto flex max-w-[100rem] gap-6 px-4 py-6">
        <aside
          className={`sticky top-20 h-[calc(100vh-6rem)] shrink-0 rounded-md border border-border bg-white transition-all ${
            open ? "w-64" : "w-14"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            {open && (
              <div>
                <p className="text-sm font-extrabold">{t("admin.title")}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Control Panel
                </p>
              </div>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="rounded-sm border border-border p-1 font-mono text-xs hover:bg-stone-100"
              aria-label="Toggle sidebar"
            >
              {open ? "«" : "»"}
            </button>
          </div>

          {open && (
            <div className="border-b border-border p-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("admin.role")}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value="admin">{t("admin.role.admin")}</option>
                <option value="board">{t("admin.role.board")}</option>
                <option value="auditor">{t("admin.role.auditor")}</option>
              </select>
            </div>
          )}

          <nav className="p-2">
            {visible.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-stone-100"
                  }`}
                  title={t(n.key)}
                >
                  <span className={`size-1.5 rounded-full ${active ? "bg-white" : "bg-primary/40"}`} />
                  {open && <span className="truncate">{t(n.key)}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
