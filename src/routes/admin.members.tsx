import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/members")({
  component: MembersPage,
});

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
  const { t } = useI18n();
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");

  function approve(p: Pending) {
    if (!(p.idOk && p.payOk && p.eduOk)) return;
    const mid = "M-" + String(200 + Object.keys(approved).length + 1).padStart(4, "0");
    setApproved({ ...approved, [p.id]: mid });
    setTimeout(() => setPending((prev) => prev.filter((x) => x.id !== p.id)), 900);
  }

  const filtered = directory.filter(
    (d) => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.mid.includes(query),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.members")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Verification & directory
        </p>
      </header>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
