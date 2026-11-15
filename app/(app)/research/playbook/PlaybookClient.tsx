"use client";

import { useState, useTransition } from "react";
import { PLAYBOOK_GROUPS } from "@/lib/taxonomy";
import { savePlaybookCardAction, setPlaybookCardInPromptsAction, deletePlaybookCardAction } from "@/lib/research-actions";

export type Card = { id: number; key: string; title: string; body: string; grp: string; use_in_prompts: boolean };

type Draft = { id: number | null; title: string; body: string; grp: string; useInPrompts: boolean };

export default function PlaybookClient({ cards }: { cards: Card[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function save() {
    if (!draft) return;
    start(async () => {
      const res = await savePlaybookCardAction(draft);
      if (!res.ok) setError(res.error);
      else {
        setDraft(null);
        setError("");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setDraft({ id: null, title: "", body: "", grp: "writing", useInPrompts: true })}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep"
        >
          Add a card
        </button>
      </div>

      <div className="space-y-10">
        {PLAYBOOK_GROUPS.map((g) => {
          const list = cards.filter((c) => c.grp === g.value);
          if (list.length === 0) return null;
          return (
            <section key={g.value}>
              <h2 className="mb-3 font-heading text-2xl">{g.label}</h2>
              <div className="space-y-2">
                {list.map((c) => (
                  <div key={c.id} className="rounded-[22px] bg-card">
                    <div className="flex items-center gap-3 px-5 py-4">
                      <button onClick={() => setOpen(open === c.id ? null : c.id)} className="flex-1 text-left text-sm font-medium">
                        {c.title}
                      </button>
                      <label className="flex items-center gap-2 text-xs text-muted">
                        <input
                          type="checkbox"
                          checked={c.use_in_prompts}
                          disabled={pending}
                          onChange={(e) => start(() => setPlaybookCardInPromptsAction({ id: c.id, value: e.target.checked }))}
                        />
                        Use in prompts
                      </label>
                    </div>
                    {open === c.id && (
                      <div className="border-t border-border/10 px-5 pb-5 pt-4">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{c.body}</div>
                        <div className="mt-4 flex gap-2 text-sm">
                          <button
                            onClick={() => setDraft({ id: c.id, title: c.title, body: c.body, grp: c.grp, useInPrompts: c.use_in_prompts })}
                            className="rounded-full border px-4 py-1.5 hover:bg-foreground/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete the card “${c.title}”?`)) start(() => deletePlaybookCardAction({ id: c.id }));
                            }}
                            className="ml-auto rounded-full px-4 py-1.5 text-red-700 hover:bg-red-700/5"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Edit card">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[28px] bg-surface p-6">
            <h2 className="font-heading text-xl">{draft.id ? "Edit card" : "New card"}</h2>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Title"
              aria-label="Title"
              className="mt-4 border bg-surface px-3 py-2 text-sm"
            />
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="What the card says (Markdown is fine)"
              aria-label="Body"
              rows={14}
              className="mt-3 min-h-40 flex-1 border bg-surface px-3 py-2 font-mono text-xs"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <select value={draft.grp} onChange={(e) => setDraft({ ...draft, grp: e.target.value })} aria-label="Group" className="rounded-full border bg-surface px-3.5 py-2">
                {PLAYBOOK_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={draft.useInPrompts} onChange={(e) => setDraft({ ...draft, useInPrompts: e.target.checked })} />
                Use in prompts
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setDraft(null); setError(""); }} className="rounded-full px-4 py-2 text-sm hover:bg-foreground/5">Cancel</button>
              <button onClick={save} disabled={pending} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep disabled:opacity-40">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
