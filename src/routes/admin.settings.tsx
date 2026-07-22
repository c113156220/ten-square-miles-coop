import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "系統設定 System Settings — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { trialDays, setTrialDays } = useAuth();
  const [draft, setDraft] = useState(trialDays);
  const [saved, setSaved] = useState(false);

  function save() {
    setTrialDays(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">System Settings · 系統設定</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Co-op Configuration
        </p>
      </header>

      <section className="max-w-xl rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold">Default Guest Trial Duration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          非社員體驗天數設定 — new trial accounts adopt this duration automatically.
        </p>
        <div className="mt-5 flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">Days</span>
            <input
              type="number"
              min={1}
              max={365}
              value={draft}
              onChange={(e) => setDraft(Number(e.target.value))}
              className="w-32 rounded-sm border border-border px-3 py-2 text-lg font-mono font-bold outline-none focus:border-primary"
            />
          </label>
          <button
            onClick={save}
            className="rounded-sm bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            Save
          </button>
          {saved && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              ✓ Saved
            </span>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Current effective value: <b className="font-mono">{trialDays} days</b>. Existing trial
          accounts keep their snapshot until you extend/convert them from the Members page.
        </p>
      </section>
    </div>
  );
}
