"use client";

import { useState, useTransition } from "react";
import type { Fact } from "@/lib/checks";
import { saveBriefAction, deleteBriefAction } from "@/lib/studio-actions";

export type BriefRow = { id: number; question: string; answer: string; facts: Fact[]; anchors: { text: string; source: string }[]; twist: string; doNotSay: string; checkedOn: string };

const STATUS = [
  { value: "verified", label: "Verified", hint: "You opened the original source" },
  { value: "known", label: "Known", hint: "Believed true, not yet re-checked: upgrade before filming" },
  { value: "unverified", label: "Unverified", hint: "Cut it, or verify it" },
] as const;

const field = "w-full border bg-surface px-3 py-2 text-sm";
const blankFact = (): Fact => ({ id: `f${Math.random().toString(36).slice(2, 9)}`, text: "", number: "", citation: "", sample: "", replication: "", caveat: "", link: "", checked: "", status: "unverified" });
const blank = (): BriefRow => ({ id: 0, question: "", answer: "", facts: [blankFact()], anchors: [{ text: "", source: "" }, { text: "", source: "" }], twist: "", doNotSay: "", checkedOn: "" });

// "Draft a brief" output (Studio prompt) -> facts, all Unverified.
function parseDraft(text: string): Partial<BriefRow> {
  const get = (k: string) => text.match(new RegExp(`^${k}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim() ?? "";
  const facts = text.split("\n").filter((l) => (l.match(/\|/g) ?? []).length >= 2 && !/^anchors?/i.test(l)).map((l) => {
    const p = l.replace(/^\s*(\d+[.)]|-)\s*/, "").split("|").map((x) => x.trim());
    return { ...blankFact(), text: p[0] ?? "", number: p[1] ?? "", citation: p[2] ?? "", sample: p[3] ?? "", replication: p[4] ?? "", caveat: p[5] ?? "", link: p[6] ?? "", status: "unverified" as const };
  }).filter((f) => f.text && (f.text.split(" ").length > 2));
  return { question: get("Question"), answer: get("Answer"), twist: get("Twist"), doNotSay: get("Do not say"), facts: facts.length ? facts : undefined };
}

export default function BriefsClient({ briefs }: { briefs: BriefRow[] }) {
  const [edit, setEdit] = useState<BriefRow | null>(null);
  const [draftText, setDraftText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const setFact = (i: number, patch: Partial<Fact>) => setEdit((e) => e && { ...e, facts: e.facts.map((f, j) => (j === i ? { ...f, ...patch } : f)) });

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button onClick={() => { setEdit(blank()); setError(""); }} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep">New brief</button>
      </div>
      {briefs.length === 0 && !edit && <p className="rounded-[28px] bg-card p-6 text-sm text-muted">No briefs yet. A brief turns one topic into checked facts Studio can use.</p>}
      <div className="space-y-3">
        {briefs.map((b) => {
          const v = b.facts.filter((f) => f.status === "verified").length;
          return (
            <div key={b.id} className="rounded-[22px] bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{b.question}</div>
                  {b.answer && <div className="text-sm text-muted">{b.answer}</div>}
                  <div className="mt-1 text-xs text-muted">{v} of {b.facts.length} facts Verified{b.checkedOn ? ` · saved ${b.checkedOn}` : ""}</div>
                </div>
                <button onClick={() => { setEdit(b); setError(""); }} className="rounded-full border px-4 py-1.5 text-sm">Edit</button>
                <button onClick={() => { if (confirm("Delete this brief?")) start(() => deleteBriefAction({ id: b.id })); }} className="rounded-full px-3 py-1.5 text-sm text-red-700">Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Edit brief">
          <div className="mx-auto max-w-3xl rounded-[28px] bg-surface p-6">
            <h2 className="font-heading text-xl">{edit.id ? "Edit brief" : "New brief"}</h2>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-muted">Paste a drafted brief (from Studio&apos;s “Draft a brief” prompt or a chat). Everything comes in Unverified.</summary>
              <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} rows={6} className={`${field} mt-2 font-mono text-xs`} aria-label="Drafted brief" />
              <button className="mt-2 rounded-full border px-4 py-1.5 text-sm" onClick={() => { const d = parseDraft(draftText); setEdit((e) => e && { ...e, ...Object.fromEntries(Object.entries(d).filter(([, x]) => x)) }); setDraftText(""); }}>Fill from draft</button>
            </details>
            <label className="mt-4 block text-sm">Question (one testable question)<input value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} className={`${field} mt-1`} /></label>
            <label className="mt-3 block text-sm">One-line answer (20 words or fewer)<input value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} className={`${field} mt-1`} /></label>

            <div className="mt-5 text-sm font-medium">Facts (5 to 8)</div>
            <div className="mt-2 space-y-3">
              {edit.facts.map((f, i) => (
                <div key={f.id} className="rounded-[18px] bg-card p-3">
                  <div className="grid gap-2 md:grid-cols-[1fr_120px_140px]">
                    <input value={f.text} onChange={(e) => setFact(i, { text: e.target.value })} placeholder="The fact in plain words" aria-label="Fact" className={field} />
                    <input value={f.number} onChange={(e) => setFact(i, { number: e.target.value })} placeholder="The number" aria-label="Number" className={field} />
                    <select value={f.status} onChange={(e) => setFact(i, { status: e.target.value as Fact["status"], checked: e.target.value === "verified" ? new Date().toISOString().slice(0, 10) : f.checked })} aria-label="Status" className="rounded-full border bg-surface px-3 text-sm">
                      {STATUS.map((s) => <option key={s.value} value={s.value} title={s.hint}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-3">
                    <input value={f.citation} onChange={(e) => setFact(i, { citation: e.target.value })} placeholder="Author, Year, Journal" aria-label="Citation" className={`${field} text-xs`} />
                    <input value={f.sample} onChange={(e) => setFact(i, { sample: e.target.value })} placeholder="Sample and design" aria-label="Sample" className={`${field} text-xs`} />
                    <input value={f.replication} onChange={(e) => setFact(i, { replication: e.target.value })} placeholder="Replication status" aria-label="Replication" className={`${field} text-xs`} />
                    <input value={f.caveat} onChange={(e) => setFact(i, { caveat: e.target.value })} placeholder="One-line caveat" aria-label="Caveat" className={`${field} text-xs`} />
                    <input value={f.link} onChange={(e) => setFact(i, { link: e.target.value })} placeholder="Link" aria-label="Link" className={`${field} text-xs`} />
                    <div className="flex items-center gap-2 text-xs text-muted">{f.checked ? `Checked ${f.checked}` : "Not checked"}<button className="ml-auto text-red-700" onClick={() => setEdit({ ...edit, facts: edit.facts.filter((_, j) => j !== i) })}>Remove</button></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 rounded-full border px-4 py-1.5 text-sm" onClick={() => setEdit({ ...edit, facts: [...edit.facts, blankFact()] })}>Add a fact</button>

            <div className="mt-5 text-sm font-medium">Story anchors (2): a dated scene with a person and a place</div>
            {edit.anchors.map((a, i) => (
              <div key={i} className="mt-2 grid gap-2 md:grid-cols-[1fr_200px]">
                <input value={a.text} onChange={(e) => setEdit({ ...edit, anchors: edit.anchors.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} placeholder="Scene" aria-label={`Anchor ${i + 1}`} className={field} />
                <input value={a.source} onChange={(e) => setEdit({ ...edit, anchors: edit.anchors.map((x, j) => (j === i ? { ...x, source: e.target.value } : x)) })} placeholder="Source" aria-label={`Anchor ${i + 1} source`} className={field} />
              </div>
            ))}
            <label className="mt-4 block text-sm">Twist (the finding that reverses the common belief)<input value={edit.twist} onChange={(e) => setEdit({ ...edit, twist: e.target.value })} className={`${field} mt-1`} /></label>
            <label className="mt-3 block text-sm">Do not say (myth versions and over-claims)<textarea value={edit.doNotSay} onChange={(e) => setEdit({ ...edit, doNotSay: e.target.value })} rows={2} className={`${field} mt-1`} /></label>
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEdit(null)} className="rounded-full px-4 py-2 text-sm">Cancel</button>
              <button
                disabled={pending}
                onClick={() => start(async () => {
                  const r = await saveBriefAction({ id: edit.id || null, question: edit.question, answer: edit.answer, facts: edit.facts, anchors: edit.anchors, twist: edit.twist, doNotSay: edit.doNotSay });
                  if (r.ok) setEdit(null); else setError(r.error);
                })}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep"
              >
                Save brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
