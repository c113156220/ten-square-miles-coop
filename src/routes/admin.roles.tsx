import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "管理員與權限 — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolesPage,
});

type RoleKey = "super" | "board" | "finance" | "supply";

const ROLES: {
  key: RoleKey;
  name: { zh: string; en: string };
  color: string;
  perms: Record<PermKey, boolean>;
}[] = [
  {
    key: "super",
    name: { zh: "超級管理員", en: "Super Admin" },
    color: "bg-primary text-primary-foreground",
    perms: {
      manageAdmins: true,
      systemLogs: true,
      approveMembers: true,
      voting: true,
      surplus: true,
      taxLedger: true,
      salesCap: true,
      refunds: true,
      forecasting: true,
      vendorOrders: true,
      fulfillment: true,
    },
  },
  {
    key: "board",
    name: { zh: "理監事", en: "Board Member" },
    color: "bg-accent text-accent-foreground",
    perms: {
      manageAdmins: false,
      systemLogs: false,
      approveMembers: true,
      voting: true,
      surplus: true,
      taxLedger: false,
      salesCap: true,
      refunds: false,
      forecasting: true,
      vendorOrders: false,
      fulfillment: false,
    },
  },
  {
    key: "finance",
    name: { zh: "主計 / 出納", en: "Finance & Auditor" },
    color: "bg-stone-700 text-white",
    perms: {
      manageAdmins: false,
      systemLogs: true,
      approveMembers: false,
      voting: false,
      surplus: false,
      taxLedger: true,
      salesCap: true,
      refunds: true,
      forecasting: false,
      vendorOrders: false,
      fulfillment: false,
    },
  },
  {
    key: "supply",
    name: { zh: "採購 / 庫存專員", en: "Supply Chain Specialist" },
    color: "bg-primary/80 text-primary-foreground",
    perms: {
      manageAdmins: false,
      systemLogs: false,
      approveMembers: false,
      voting: false,
      surplus: false,
      taxLedger: false,
      salesCap: false,
      refunds: false,
      forecasting: true,
      vendorOrders: true,
      fulfillment: true,
    },
  },
];

type PermKey =
  | "manageAdmins"
  | "systemLogs"
  | "approveMembers"
  | "voting"
  | "surplus"
  | "taxLedger"
  | "salesCap"
  | "refunds"
  | "forecasting"
  | "vendorOrders"
  | "fulfillment";

const PERMS: { key: PermKey; label: { zh: string; en: string } }[] = [
  { key: "manageAdmins", label: { zh: "建立/停用管理員", en: "Manage admins" } },
  { key: "systemLogs", label: { zh: "系統操作日誌", en: "System logs" } },
  { key: "approveMembers", label: { zh: "核准入社申請", en: "Approve applications" } },
  { key: "voting", label: { zh: "建立投票決議", en: "Create voting polls" } },
  { key: "surplus", label: { zh: "授權年度分紅", en: "Authorize surplus distribution" } },
  { key: "taxLedger", label: { zh: "稅務分類帳", en: "Tax ledger" } },
  { key: "salesCap", label: { zh: "非社員 30% 監控", en: "30% cap monitor" } },
  { key: "refunds", label: { zh: "退款 / 分紅撥付", en: "Refund / payout" } },
  { key: "forecasting", label: { zh: "需求預測模型", en: "Forecasting models" } },
  { key: "vendorOrders", label: { zh: "產生廠商訂單", en: "Vendor order sheets" } },
  { key: "fulfillment", label: { zh: "配送/取貨狀態", en: "Shipment / pickup" } },
];

type Admin = {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  lastLogin: string;
  active: boolean;
};

const ADMINS: Admin[] = [
  { id: "A-001", name: "林方里", email: "founder@tensqmiles.coop", role: "super", lastLogin: "2026-07-21 09:14", active: true },
  { id: "A-002", name: "陳美惠", email: "board.chen@tensqmiles.coop", role: "board", lastLogin: "2026-07-20 18:03", active: true },
  { id: "A-003", name: "王主計", email: "finance.wang@tensqmiles.coop", role: "finance", lastLogin: "2026-07-21 08:47", active: true },
  { id: "A-004", name: "黃採購", email: "supply.huang@tensqmiles.coop", role: "supply", lastLogin: "2026-07-19 14:22", active: true },
  { id: "A-005", name: "張稽核", email: "audit.chang@tensqmiles.coop", role: "finance", lastLogin: "2026-06-30 10:01", active: false },
];

const LOGS = [
  { ts: "2026-07-21 09:15", who: "林方里 (super)", action: { zh: "核准社員 M-2148 入社申請", en: "Approved member M-2148 application" } },
  { ts: "2026-07-21 08:52", who: "王主計 (finance)", action: { zh: "匯出 Q2 稅務分類帳", en: "Exported Q2 tax ledger CSV" } },
  { ts: "2026-07-20 17:44", who: "陳美惠 (board)", action: { zh: "建立投票：2026 章程修訂", en: "Created poll: 2026 charter amendment" } },
  { ts: "2026-07-20 11:12", who: "黃採購 (supply)", action: { zh: "產生廠商訂單：土雞蛋 200 打", en: "Generated vendor sheet: eggs × 200 dz" } },
  { ts: "2026-07-19 16:30", who: "林方里 (super)", action: { zh: "停用管理員 A-005", en: "Suspended admin A-005" } },
];

function RolesPage() {
  const { locale } = useI18n();
  const [invite, setInvite] = useState(false);
  return (
    <section className="space-y-8">
      <header className="border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold">
          {locale === "zh" ? "管理員帳號與權限" : "Admins & Role Permissions"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "zh"
            ? "四級 RBAC · 每項後台操作都記錄於下方稽核日誌。"
            : "Four-tier RBAC. Every admin action is captured in the audit log below."}
        </p>
      </header>

      {/* RBAC matrix */}
      <div>
        <h2 className="mb-3 text-lg font-bold">
          {locale === "zh" ? "權限矩陣" : "Permission matrix"}
        </h2>
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest">
                <th className="p-3">{locale === "zh" ? "權限" : "Permission"}</th>
                {ROLES.map((r) => (
                  <th key={r.key} className="p-3 text-center">
                    <span className={`rounded-sm px-2 py-0.5 text-[10px] ${r.color}`}>
                      {r.name[locale]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map((p) => (
                <tr key={p.key} className="border-t border-border">
                  <td className="p-3 font-medium">{p.label[locale]}</td>
                  {ROLES.map((r) => (
                    <td key={r.key} className="p-3 text-center">
                      {r.perms[p.key] ? (
                        <span className="font-bold text-primary">●</span>
                      ) : (
                        <span className="text-stone-300">○</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin directory */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {locale === "zh" ? "管理員名冊" : "Admin directory"}
          </h2>
          <button
            onClick={() => setInvite(true)}
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110"
          >
            + {locale === "zh" ? "新增管理員" : "Invite admin"}
          </button>
        </div>
        <div className="overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest">
                <th className="p-3">ID</th>
                <th className="p-3">{locale === "zh" ? "姓名" : "Name"}</th>
                <th className="p-3">{locale === "zh" ? "角色" : "Role"}</th>
                <th className="p-3">Email</th>
                <th className="p-3">{locale === "zh" ? "最後登入" : "Last login"}</th>
                <th className="p-3">{locale === "zh" ? "狀態" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {ADMINS.map((a) => {
                const role = ROLES.find((r) => r.key === a.role)!;
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{a.id}</td>
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">
                      <span className={`rounded-sm px-2 py-0.5 text-[10px] font-bold ${role.color}`}>
                        {role.name[locale]}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{a.email}</td>
                    <td className="p-3 font-mono text-xs">{a.lastLogin}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          a.active ? "bg-primary/10 text-primary" : "bg-stone-200 text-muted-foreground"
                        }`}
                      >
                        {a.active
                          ? locale === "zh" ? "啟用" : "Active"
                          : locale === "zh" ? "停用" : "Suspended"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit log */}
      <div>
        <h2 className="mb-3 text-lg font-bold">
          {locale === "zh" ? "安全稽核日誌" : "Security audit log"}
        </h2>
        <ol className="space-y-2">
          {LOGS.map((l, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-3 rounded border border-border bg-white p-3 text-sm"
            >
              <span className="font-mono text-[11px] text-muted-foreground">{l.ts}</span>
              <span className="font-bold">{l.who}</span>
              <span className="text-muted-foreground">— {l.action[locale]}</span>
            </li>
          ))}
        </ol>
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} />}
    </section>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const [role, setRole] = useState<RoleKey>("board");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-md border border-border bg-white p-6 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-extrabold">
          {locale === "zh" ? "新增管理員" : "Invite admin"}
        </h3>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              {locale === "zh" ? "姓名" : "Name"}
            </span>
            <input className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Email</span>
            <input type="email" className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              {locale === "zh" ? "指派角色" : "Assigned role"}
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RoleKey)}
              className="w-full rounded-sm border border-border px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name[locale]}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded border border-border bg-stone-50 p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {locale === "zh" ? "自訂權限覆寫" : "Custom permission overrides"}
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {PERMS.map((p) => {
                const preset = ROLES.find((r) => r.key === role)!.perms[p.key];
                return (
                  <label key={p.key} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={preset} />
                    {p.label[locale]}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-stone-50"
          >
            {locale === "zh" ? "取消" : "Cancel"}
          </button>
          <button
            onClick={onClose}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            {locale === "zh" ? "寄出邀請" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
