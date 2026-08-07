import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  useAuth,
  isTrialExpired,
  trialRemainingDays,
  trialExpiryDate,
  type AuthUser,
} from "@/lib/auth";
import { listSupportThreads, type SupportThread } from "@/lib/support-chat";

export const Route = createFileRoute("/admin/users")({
  component: UsersDirectoryPage,
});

type Filter = "all" | "trial" | "member" | "admin" | "expired";

function fmtDate(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts).toISOString().slice(0, 10);
}

function roleLabel(u: AuthUser, t: ReturnType<typeof useI18n>["t"]) {
  if (u.role === "admin") return t("user.role.admin");
  if (u.role === "member") return t("user.role.member");
  return t("user.role.trial");
}

function statusOf(u: AuthUser) {
  if (u.role === "admin") return { key: "admin", tone: "primary" as const };
  if (u.role === "member") {
    return u.verified
      ? { key: "verified", tone: "primary" as const }
      : { key: "pending", tone: "accent" as const };
  }
  if (isTrialExpired(u)) return { key: "expired", tone: "red" as const };
  return { key: "active", tone: "accent" as const };
}

function UsersDirectoryPage() {
  const { t, locale } = useI18n();
  const { users } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>([]);

  useEffect(() => {
    setSupportThreads(listSupportThreads());
    const onStorage = () => setSupportThreads(listSupportThreads());
    const onUpdate = () => setSupportThreads(listSupportThreads());
    window.addEventListener("storage", onStorage);
    window.addEventListener("tsm-support-chat-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tsm-support-chat-updated", onUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (query) {
        const q = query.toLowerCase();
        const name = String(u.name ?? "").toLowerCase();
        const email = String(u.email ?? "").toLowerCase();
        const phone = String(u.phone ?? "");
        if (!name.includes(q) && !email.includes(q) && !phone.includes(query)) {
          return false;
        }
      }
      if (filter === "all") return true;
      if (filter === "admin") return u.role === "admin";
      if (filter === "member") return u.role === "member";
      if (filter === "trial") return u.role === "trial" && !isTrialExpired(u);
      if (filter === "expired") return u.role === "trial" && isTrialExpired(u);
      return true;
    });
  }, [users, filter, query]);

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: t("users.filter.all") },
    { key: "trial", label: t("users.filter.trial") },
    { key: "member", label: t("users.filter.member") },
    { key: "admin", label: t("users.filter.admin") },
    { key: "expired", label: t("users.filter.expired") },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold">{t("users.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("users.sub")}</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-white p-1">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === c.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === "zh" ? "搜尋姓名／Email／手機…" : "Search name / email / phone…"}
          className="flex-1 min-w-[240px] rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <span className="rounded-full bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {t("users.count").replace("{n}", String(filtered.length))}
        </span>
      </div>

      <section className="rounded-2xl border border-border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/70 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">{t("common.name")}</th>
                <th className="px-4 py-3">{t("common.email")}</th>
                <th className="px-4 py-3">{t("common.phone")}</th>
                <th className="px-4 py-3">{t("common.role")}</th>
                <th className="px-4 py-3">{t("trial.col.registered")}</th>
                <th className="px-4 py-3">{t("trial.col.expiry")}</th>
                <th className="px-4 py-3">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const st = statusOf(u);
                const expiry = trialExpiryDate(u);
                const remain = u.role === "trial" ? trialRemainingDays(u) : null;
                const statusText =
                  st.key === "admin"
                    ? t("user.role.admin")
                    : st.key === "verified"
                    ? t("common.verified")
                    : st.key === "pending"
                    ? t("common.pending")
                    : st.key === "expired"
                    ? t("trial.status.expired")
                    : t("trial.status.active");
                const toneCls =
                  st.tone === "primary"
                    ? "bg-primary/10 text-primary"
                    : st.tone === "red"
                    ? "bg-red-100 text-red-700"
                    : "bg-accent/15 text-accent";
                return (
                  <tr key={u.id} className="hover:bg-surface/40">
                    <td className="px-4 py-3 font-semibold">
                      {u.name}
                      {u.convertedToMember && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] uppercase text-primary">
                          {t("trial.status.upgraded")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] uppercase">
                        {roleLabel(u, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {expiry ? fmtDate(expiry.getTime()) : "—"}
                      {remain !== null && (
                        <span className="ml-1 text-muted-foreground">({remain}d)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${toneCls}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {locale === "zh" ? "沒有符合條件的使用者。" : "No users match this filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">{locale === "zh" ? "AI客服與聊天紀錄" : "AI support conversation logs"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "zh" ? "後台可查看使用者與 AI客服 / 聊天機器人的完整詢問過程。" : "Admins can review the full AI support and chatbot conversation history."}
          </p>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {supportThreads.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground lg:col-span-2">
              {locale === "zh" ? "目前還沒有客服對話紀錄。" : "No support conversations have been logged yet."}
            </p>
          ) : (
            supportThreads.map((thread) => (
              <article key={thread.id} className="rounded-2xl border border-border bg-surface/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{thread.userName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{thread.userEmail}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-primary">
                    {thread.mode === "ai" ? "AI客服" : "Bot"}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {thread.messages.slice(-4).map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "bg-white" : "bg-primary/5 text-primary"}`}
                    >
                      <span className="mr-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {message.role === "user" ? "User" : "AI"}
                      </span>
                      {message.text}
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
