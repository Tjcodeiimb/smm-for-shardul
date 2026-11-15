"use client";

import { useState, useTransition } from "react";
import { updateIdeaAction, deleteIdeaAction } from "@/lib/research-actions";

export type Idea = {
  id: number;
  text: string;
  board: string;
  link: string;
  note: string;
  suggested_type: string;
  score: { checks: boolean[]; total: number } | null;
  status: string;
};

// The 10-point shareability test (v2 brief, Appendix A12).
const TEST = [
  "The takeaway fits in under 15 words.",
  "It contradicts a common belief or reveals a hidden “why”.",
  "It evokes awe, indignation or mild anxiety. “Interesting” scores zero.",
  "You can name who it gets sent to.",
  "There is an action for today, or a reference worth saving.",
  "A strong source can be shown on screen.",
  "It has an Indian example or stake, or is deliberately universal.",
  "The hook is paid off before the final 10 seconds.",
  "Only you could make it: your drawing, your angle or your story.",
  "It is not one of the overdone effects, unless the angle is new.",
];

const STATUSES = [
  { value: "new", label: "New" },
  { value: "researching", label: "Researching" },
  { value: "ready", label: "Ready" },
  { value: "used", label: "Used" },
  { value: "dropped", label: "Dropped" },
];

function verdict(total: number) {
  if (total >= 7) return { label: "Film it", cls: "bg-accent text-accent-deep" };
  if (total >= 5) return { label: "Rework", cls: "bg-foreground/10" };
  return { label: "Drop", cls: "bg-deep-charcoal text-off-white" };
}

export default function IdeasClient({ ideas }: { ideas: Idea[] }) {
  const boards = [
    { value: "proven", title: "Proven elsewhere", hint: "Backed by a post that performed well for someone else." },
    { value: "favourite", title: "My favourites", hint: "Ideas you simply love. The strongest pieces combine both through your own point of view." },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {boards.map((b) => {
        const list = ideas.filter((i) => i.board === b.value);
        return (
          <section key={b.value}>
            <h2 className="font-heading text-2xl">{b.title} <span className="text-muted">({list.length})</span></h2>
            <p className="mb-4 mt-1 text-sm text-muted">{b.hint}</p>
            <div className="space-y-3">
              {list.length === 0 ? (
                <p className="rounded-[28px] bg-card p-6 text-sm text-muted">Nothing here yet.</p>
              ) : (
                list.map((i) => <IdeaCard key={i.id} idea={i} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const [scoring, setScoring] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(idea.score?.checks ?? Array(10).fill(false));
  const [pending, start] = useTransition();
  const total = idea.score?.total;
  const v = total !== undefined ? verdict(total) : null;
  const faded = idea.status === "used" || idea.status === "dropped";

  return (
    <div className={`rounded-[28px] bg-card p-5 ${faded ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <p className="flex-1 text-sm font-medium">{idea.text}</p>
        {v && <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${v.cls}`}>{total}/10 · {v.label}</span>}
      </div>
      {(idea.suggested_type || idea.note || idea.link) && (
        <p className="mt-2 text-xs text-muted">
          {idea.suggested_type && <>Suggested type: {idea.suggested_type}. </>}
          {idea.note && <>{idea.note} </>}
          {idea.link && <a href={idea.link} target="_blank" rel="noreferrer" className="underline underline-offset-2">link</a>}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <select
          aria-label="Status"
          value={idea.status}
          disabled={pending}
          onChange={(e) => start(() => updateIdeaAction({ id: idea.id, status: e.target.value }))}
          className="rounded-full border bg-surface px-3 py-1.5"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <a href={`/studio?idea=${idea.id}`} className="rounded-full bg-accent px-3 py-1.5 font-medium text-accent-deep">Send to Studio</a>
        <button onClick={() => setScoring((s) => !s)} className="rounded-full border px-3 py-1.5 hover:bg-foreground/5">
          {scoring ? "Close test" : total !== undefined ? "Re-score" : "Score it"}
        </button>
        <button
          disabled={pending}
          onClick={() => start(() => updateIdeaAction({ id: idea.id, board: idea.board === "proven" ? "favourite" : "proven" }))}
          className="rounded-full px-3 py-1.5 text-muted hover:bg-foreground/5"
        >
          Move to {idea.board === "proven" ? "favourites" : "proven elsewhere"}
        </button>
        <form action={deleteIdeaAction} className="ml-auto">
          <input type="hidden" name="id" value={idea.id} />
          <button className="rounded-full px-3 py-1.5 text-red-700 hover:bg-red-700/5">Delete</button>
        </form>
      </div>
      {scoring && (
        <div className="mt-4 rounded-[18px] bg-surface p-4">
          <ol className="space-y-2 text-sm">
            {TEST.map((t, n) => (
              <li key={n}>
                <label className="flex gap-2.5">
                  <input type="checkbox" checked={checks[n]} onChange={(e) => setChecks((c) => c.map((x, j) => (j === n ? e.target.checked : x)))} />
                  <span>{t}</span>
                </label>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm">{checks.filter(Boolean).length}/10 · {verdict(checks.filter(Boolean).length).label}</span>
            <button
              disabled={pending}
              onClick={() => start(async () => { await updateIdeaAction({ id: idea.id, score: checks }); setScoring(false); })}
              className="ml-auto rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep"
            >
              Save score
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
