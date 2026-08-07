import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth, trialRemainingDays, isTrialExpired, trialExpiryDate, type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/admin/members")({
  component: MembersPage,
});

function EditTrialDaysModal({
  user,
  onClose,
}: {
  user: AuthUser;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const { adjustTrialDays, setTrialExpiryDays, setTrialExpiryDate, forceExpireTrial } = useAuth();
  const remain = trialRemainingDays(user);
  const expiry = trialExpiryDate(user);
  const [delta, setDelta] = useState(0);
  const [dateStr, setDateStr] = useState(expiry ? expiry.toISOString().slice(0, 10) : "");
  const [note, setNote] = useState("");

  const quickBtn = (n: number) => (
    <button
      key={n}
      onClick={() => setDelta(n)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        delta === n
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white hover:bg-surface"
      }`}
    >
      {n > 0 ? `+${n}` : n}
    </button>
  );

  function save() {
    const reason = note.trim() || undefined;
    if (dateStr && dateStr !== (expiry?.toISOString().slice(0, 10) ?? "")) {
      setTrialExpiryDate(user.id, new Date(dateStr + "T23:59:59"), reason);
    } else if (delta !== 0) {
      adjustTrialDays(user.id, delta, reason);
    } else {
      setTrialExpiryDays(user.id, user.trialDays ?? 30, reason);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {user.name} · {user.email}
          </p>
          <h3 className="mt-1 text-xl font-extrabold">{t("edit.title")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("edit.current")}: <b className="font-mono">{remain} {t("common.days")}</b>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("edit.quick")}
            </label>
            <div className="flex flex-wrap gap-2">
              {[7, 14, 30].map(quickBtn)}
              {[-7, -14].map(quickBtn)}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("edit.custom")}
            </label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value) || 0)}
              className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("edit.setExpiry")}
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {locale === "zh"
                ? "指定日期後將覆蓋上方增減設定。"
                : "Setting a date overrides the quick/custom adjustment."}
            </p>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("edit.note")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("edit.notePh")}
              rows={2}
              className="w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              forceExpireTrial(user.id, note.trim() || undefined);
              onClose();
            }}
            className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            {t("edit.forceExpire")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-surface"
            >
              {t("edit.cancel")}
            </button>
            <button
              onClick={save}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
            >
              {t("edit.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Pending = { id: string; name: string; idOk: boolean; payOk: boolean; eduOk: boolean };

const initialPending: Pending[] = [
  { id: "P-0231", name: "王小明", idOk: true, payOk: true, eduOk: true },
  { id: "P-0232", name: "Alex Chen", idOk: true, payOk: true, eduOk: false },
  { id: "P-0233", name: "林雅慧", idOk: true, payOk: false, eduOk: true },
  { id: "P-0234", name: "Sara Wong", idOk: false, payOk: true, eduOk: true },
];

const directory = [
  { mid: "M-0001", name: "陳大同", shares: 10, points: 3420, status: "Active" },
  { mid: "M-0042", name: "李美玲", shares: 5, points: 2180, status: "Active" },
  { mid: "M-0088", name: "林建志", shares: 8, points: 1980, status: "Active" },
  { mid: "M-0142", name: "黃惠珊", shares: 3, points: 1240, status: "On leave" },
  { mid: "M-0175", name: "Michael Lin", shares: 12, points: 4560, status: "Active" },
];

function Check({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
        ok ? "bg-primary text-primary-foreground" : "bg-stone-200 text-muted-foreground"
      }`}
    >
      {ok ? "✓" : "…"}
    </span>
  );
}

function MembersPage() {
  const { t, locale } = useI18n();
  const { users, extendTrial, forceConvert, topupWallet } = useAuth();
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [topupAmount, setTopupAmount] = useState(500);
  const [activeTopupUserId, setActiveTopupUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AuthUser | null>(null);

  const trialUsers = users.filter((u) => u.role === "trial");
  const registeredMembers = users.filter((u) => u.role === "member");

  function trialStatus(u: AuthUser): { label: string; cls: string } {
    if (u.convertedToMember) return { label: t("trial.status.upgraded"), cls: "bg-primary/10 text-primary" };
    if (isTrialExpired(u)) return { label: t("trial.status.expired"), cls: "bg-red-100 text-red-700" };
    return { label: t("trial.status.active"), cls: "bg-accent/15 text-accent" };
  }

  function daysCls(remain: number, expired: boolean) {
    if (expired || remain <= 0) return "bg-red-100 text-red-700 border-red-300";
    if (remain <= 3) return "bg-red-50 text-red-700 border-red-200";
    if (remain <= 7) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }


  function approve(p: Pending) {
    if (!(p.idOk && p.payOk && p.eduOk)) return;
    const mid = "M-" + String(200 + Object.keys(approved).length + 1).padStart(4, "0");
    setApproved({ ...approved, [p.id]: mid });
    setTimeout(() => setPending((prev) => prev.filter((x) => x.id !== p.id)), 900);
  }

  const filtered = directory.filter(
    (d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.mid.includes(query),
  );

  const memberSearchResults = users.filter((u) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.memberId ?? "").toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const topup = (userId: string) => {
    const amount = Number(topupAmount) || 0;
    if (amount <= 0) return;
    topupWallet(userId, amount, `後台儲值金補款：NT$${amount}`);
    setActiveTopupUserId(null);
    setTopupAmount(500);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.members")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Verification & directory
        </p>
      </header>

      <section className="rounded-md border border-border bg-white p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">會員文件審核</h2>
            <p className="mt-1 text-sm text-muted-foreground">逐筆檢視學生證與身分證影本，並同步判斷付款與入社資格。</p>
          </div>
          <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase text-accent">
            {pending.length} pending
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.map((p) => (
            <div key={p.id} className="rounded border border-border bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{p.id}</p>
                </div>
                <button
                  onClick={() => approve(p)}
                  disabled={!((p.idOk && p.payOk && p.eduOk))}
                  className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {approved[p.id] ? "已核准" : "核准入社"}
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-dashed border-border bg-white p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Student ID</p>
                  <div className="mt-2 h-20 rounded bg-stone-100" />
                </div>
                <div className="rounded border border-dashed border-border bg-white p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">ID Card</p>
                  <div className="mt-2 h-20 rounded bg-stone-100" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>付款 {p.payOk ? "✓" : "待補"}</span>
                <span>學生證 {p.eduOk ? "✓" : "待補"}</span>
                <span>身分證 {p.idOk ? "✓" : "待補"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("mem.queue")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">{t("mem.col.name")}</th>
                <th className="px-4 py-2">{t("mem.col.id")}</th>
                <th className="px-4 py-2">{t("mem.col.payment")}</th>
                <th className="px-4 py-2">{t("mem.col.edu")}</th>
                <th className="px-4 py-2 text-right">{t("mem.col.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pending.map((p) => {
                const ready = p.idOk && p.payOk && p.eduOk;
                const done = !!approved[p.id];
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-semibold">
                      {p.name}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{p.id}</span>
                    </td>
                    <td className="px-4 py-3"><Check ok={p.idOk} /></td>
                    <td className="px-4 py-3"><Check ok={p.payOk} /></td>
                    <td className="px-4 py-3"><Check ok={p.eduOk} /></td>
                    <td className="px-4 py-3 text-right">
                      {done ? (
                        <span className="font-mono text-xs font-bold text-primary">
                          {t("mem.approved")} · {approved[p.id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => approve(p)}
                          disabled={!ready}
                          className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                        >
                          {t("mem.approve")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Queue clear ✨
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold">{t("trial.roster.title")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("trial.roster.sub")}</p>
          </div>
          <span className="rounded-full bg-accent/15 px-3 py-1 font-mono text-[10px] font-bold uppercase text-accent">
            {trialUsers.length} · {t("trial.status.active")}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">{t("common.name")}</th>
                <th className="px-4 py-2">{t("common.email")}</th>
                <th className="px-4 py-2">{t("trial.col.status")}</th>
                <th className="px-4 py-2">{t("trial.col.remaining")}</th>
                <th className="px-4 py-2">{t("trial.col.expiry")}</th>
                <th className="px-4 py-2">{t("common.verified")}</th>
                <th className="px-4 py-2 text-right">{t("trial.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trialUsers.map((u) => {
                const st = trialStatus(u);
                const remain = trialRemainingDays(u);
                const expired = isTrialExpired(u);
                const expiry = trialExpiryDate(u);
                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-semibold">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold ${daysCls(
                          remain,
                          expired,
                        )}`}
                      >
                        {remain} {t("common.days.short")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {expiry ? expiry.toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold ${
                          u.verified ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {u.verified ? t("common.verified") : t("common.pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-surface"
                        >
                          {t("trial.action.editDays")}
                        </button>
                        <button
                          onClick={() => extendTrial(u.id, 7)}
                          className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold hover:bg-surface"
                        >
                          +7 {t("common.days.short")}
                        </button>
                        <button
                          onClick={() => forceConvert(u.id)}
                          className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
                        >
                          {t("trial.action.convert")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {trialUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("trial.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editUser && <EditTrialDaysModal user={editUser} onClose={() => setEditUser(null)} />}

      <section className="rounded-md border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("mem.directory")}</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("mem.filter")}
            className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-2">{t("mem.col.mid")}</th>
                <th className="px-4 py-2">{t("mem.col.name")}</th>
                <th className="px-4 py-2">{t("mem.col.shares")}</th>
                <th className="px-4 py-2">{t("mem.col.points")}</th>
                <th className="px-4 py-2">{t("mem.col.status")}</th>
                <th className="px-4 py-2 text-right">補值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.mid}>
                  <td className="px-4 py-3 font-mono">{d.mid}</td>
                  <td className="px-4 py-3 font-semibold">{d.name}</td>
                  <td className="px-4 py-3 font-mono">{d.shares}</td>
                  <td className="px-4 py-3 font-mono">{d.points.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${
                        d.status === "Active"
                          ? "bg-primary/10 text-primary"
                          : "bg-stone-200 text-muted-foreground"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-sm border border-border bg-white px-3 py-1 text-xs font-semibold hover:bg-surface">
                      +500
                    </button>
                  </td>
                </tr>
              ))}
              {memberSearchResults.map((u, i) => (
                <tr key={u.id} className="bg-primary/5">
                  <td className="px-4 py-3 font-mono">{u.memberId ?? `F-${String(500 + i).padStart(4, "0")}`}</td>
                  <td className="px-4 py-3 font-semibold">
                    {u.name}
                    <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-primary">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">—</td>
                  <td className="px-4 py-3 font-mono">{(u.walletBalance ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.verified
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/20 text-accent-foreground"
                      }`}
                    >
                      {u.verified ? "Active" : "Pending verify"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {activeTopupUserId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={0}
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(Number(e.target.value) || 0)}
                          className="w-20 rounded-sm border border-border bg-white px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => topup(u.id)}
                          className="rounded-sm bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground"
                        >
                          確定
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveTopupUserId(u.id)}
                        className="rounded-sm border border-border bg-white px-3 py-1 text-xs font-semibold hover:bg-surface"
                      >
                        +500
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
