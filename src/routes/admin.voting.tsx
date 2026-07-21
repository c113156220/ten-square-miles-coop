import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/voting")({
  component: VotingPage,
});

type Meeting = { id: string; type: "agm" | "board"; date: string; agenda: string };
type Poll = { id: string; question: string; closes: string; options: { label: string; votes: number }[] };

const initialMeetings: Meeting[] = [
  { id: "M1", type: "agm", date: "2026-08-14 10:00", agenda: "FY26 report · Board election" },
  { id: "M2", type: "board", date: "2026-07-30 19:00", agenda: "Vendor selection · Q3 pre-orders" },
];

const initialPolls: Poll[] = [
  {
    id: "P1",
    question: "Adopt revised charter §4 (member rebate formula)?",
    closes: "2026-07-28",
    options: [
      { label: "Approve 同意", votes: 84 },
      { label: "Reject 反對", votes: 12 },
      { label: "Abstain 棄權", votes: 7 },
    ],
  },
  {
    id: "P2",
    question: "Preferred rice vendor for Q3 sourcing?",
    closes: "2026-07-25",
    options: [
      { label: "Sunhill Farm", votes: 42 },
      { label: "Yushan Co-op", votes: 61 },
      { label: "Highland Growers", votes: 18 },
    ],
  },
];

function VotingPage() {
  const { t } = useI18n();
  const [meetings] = useState(initialMeetings);
  const [polls, setPolls] = useState(initialPolls);

  function castDemo(pollId: string, idx: number) {
    setPolls(polls.map((p) =>
      p.id === pollId
        ? {
            ...p,
            options: p.options.map((o, i) => (i === idx ? { ...o, votes: o.votes + 1 } : o)),
          }
        : p,
    ));
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold">{t("admin.nav.voting")}</h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Democratic governance
        </p>
      </header>

      <section className="rounded-md border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold">{t("vote.meetings")}</h2>
          <button className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            + {t("vote.new")}
          </button>
        </div>
        <ul className="divide-y divide-border">
          {meetings.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-semibold">
                  {m.type === "agm" ? t("vote.type.agm") : t("vote.type.board")}
                </p>
                <p className="text-xs text-muted-foreground">{m.agenda}</p>
              </div>
              <span className="font-mono text-sm">{m.date}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold">{t("vote.polls")}</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {t("vote.anon")}
            </p>
          </div>
          <button className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            + {t("vote.new.poll")}
          </button>
        </div>
        <div className="divide-y divide-border">
          {polls.map((p) => {
            const total = p.options.reduce((s, o) => s + o.votes, 0);
            return (
              <div key={p.id} className="p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{p.question}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("vote.close")}: {p.closes}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {p.options.map((o, i) => {
                    const pct = total ? Math.round((o.votes / total) * 100) : 0;
                    return (
                      <button
                        key={i}
                        onClick={() => castDemo(p.id, i)}
                        className="block w-full text-left"
                      >
                        <div className="flex justify-between font-mono text-xs">
                          <span className="font-semibold text-foreground">{o.label}</span>
                          <span>
                            {o.votes} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total ballots: {total}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
