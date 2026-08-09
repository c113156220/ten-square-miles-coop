import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useI18n, type DictKey } from "@/lib/i18n";
import { SiteNav } from "@/components/site-shell";
import { useAuth } from "@/lib/auth";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";

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

interface NavItem {
  id: string;
  to: string;
  key: string;
  roles: Role[];
  badge?: number;
}

const INITIAL_NAV: NavItem[] = [
  { id: "dashboard", to: "/admin", key: "admin.nav.dashboard", roles: ["admin", "board", "auditor"] },
  { id: "members", to: "/admin/members", key: "admin.nav.members", roles: ["admin", "board"] },
  { id: "users", to: "/admin/users", key: "admin.nav.users", roles: ["admin", "board", "auditor"] },
  { id: "preorders", to: "/admin/preorders", key: "admin.nav.preorders", roles: ["admin", "board"] },
  { id: "logistics", to: "/admin/logistics", key: "📦 物流與訂單管理", roles: ["admin", "board"] },
  { id: "support", to: "/admin/support", key: "💬 社員客服與工單管理", roles: ["admin", "board"], badge: 3 },
  { id: "forecasting", to: "/admin/forecasting", key: "admin.nav.forecasting", roles: ["admin", "board"] },
  { id: "finance", to: "/admin/finance", key: "admin.nav.finance", roles: ["admin", "board", "auditor"] },
  { id: "voting", to: "/admin/voting", key: "admin.nav.voting", roles: ["admin", "board"] },
  { id: "surplus", to: "/admin/surplus", key: "admin.nav.surplus", roles: ["admin", "auditor"] },
  { id: "settings", to: "/admin/settings", key: "admin.nav.settings", roles: ["admin"] },
  { id: "roles", to: "/admin/roles", key: "admin.nav.roles", roles: ["admin"] },
];

function AccessDenied() {
  const { openLogin } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="mx-auto grid max-w-md gap-4 px-4 py-24 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-3xl">🛡️</div>
        <h1 className="text-2xl font-bold">Access Denied · 無權限訪問</h1>
        <p className="text-sm text-muted-foreground">
          Admins only. Please log in with an administrator account. / 僅限管理員登入。
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={openLogin}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            Sign in as admin
          </button>
          <Link
            to="/"
            className="rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold hover:bg-surface"
          >
            Go home
          </Link>
        </div>
        <p className="mt-4 rounded border border-accent/30 bg-accent/5 p-3 text-left font-mono text-[11px] text-muted-foreground">
          🛡️ Try: <b>admin@coop.tw</b> / <b>admin123</b>
        </p>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [role, setRole] = useState<Role>("admin");
  const [open, setOpen] = useState(true);
  const [navList, setNavList] = useState<NavItem[]>(INITIAL_NAV);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const savedOrder = localStorage.getItem("tsm_admin_nav_order");
    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const sorted = [...INITIAL_NAV].sort((a, b) => {
          const indexA = orderIds.indexOf(a.id);
          const indexB = orderIds.indexOf(b.id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setNavList(sorted);
      } catch (e) {
        console.warn("解析選單順序失敗", e);
      }
    }
  }, []);

  if (!isAdmin) return <AccessDenied />;

  const saveNavOrder = (newItems: NavItem[]) => {
    setNavList(newItems);
    localStorage.setItem("tsm_admin_nav_order", JSON.stringify(newItems.map((i) => i.id)));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...navList];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    saveNavOrder(newItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navList.length) return;

    const newItems = [...navList];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    saveNavOrder(newItems);
  };

  const visibleNav = navList.filter((n) => n.roles.includes(role));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="mx-auto flex max-w-[100rem] gap-6 px-4 py-6">
        <aside
          className={`sticky top-20 h-[calc(100vh-6rem)] shrink-0 rounded-md border border-border bg-white transition-all select-none flex flex-col justify-between ${
            open ? "w-64" : "w-14"
          }`}
        >
          <div>
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
                type="button"
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

            <nav className="p-2 space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto">
              {visibleNav.map((n, index) => {
                const active = pathname === n.to;
                const labelText = n.key.startsWith("admin.") ? t(n.key as DictKey) : n.key;
                const isDragging = draggedIndex === index;

                return (
                  <div
                    key={n.id}
                    draggable={open}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`group flex items-center justify-between rounded-sm px-2 py-1.5 text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "hover:bg-stone-100"
                    } ${isDragging ? "opacity-30 bg-stone-200" : ""}`}
                  >
                    <Link
                      to={n.to}
                      className="flex items-center gap-2 flex-1 min-w-0"
                      title={labelText}
                    >
                      {open && (
                        <GripVertical className="size-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />
                      )}
                      <span className={`size-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-primary/40"}`} />
                      {open && <span className="truncate">{labelText}</span>}
                    </Link>

                    {open && (
                      <div className="flex items-center gap-1 shrink-0">
                        {n.badge && (
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {n.badge}
                          </span>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveItem(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 hover:bg-stone-200 rounded disabled:opacity-20"
                          >
                            <ArrowUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, "down")}
                            disabled={index === visibleNav.length - 1}
                            className="p-0.5 hover:bg-stone-200 rounded disabled:opacity-20"
                          >
                            <ArrowDown className="size-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {open && (
            <div className="p-3 border-t border-border text-[10px] text-muted-foreground text-center">
              💡 可拖曳或按箭頭調整選單順序
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}