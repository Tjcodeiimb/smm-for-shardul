"use client";

import { useState, useTransition } from "react";
import { DURATIONS, durationLabel, typeLabel, funnelLabel } from "@/lib/taxonomy";
import { saveRuleAction, deleteRuleAction, deleteLessonAction, saveV2SettingsAction, saveLessonAction, type LessonInput } from "@/lib/loop-actions";
import type { V2Settings } from "@/lib/posts";
import LessonDialog, { blankLesson } from "@/app/components/LessonDialog";

export type RuleRow = { id: number; text: string; category: string; active: boolean };
export type LessonRow = { id: number; text: string; scope: string; applies_to: LessonInput["appliesTo"]; evidence: string; evidence_post_ids: number[]; status: string };

function appliesLabel(a: LessonInput["appliesTo"]) {
  if (!a || a.all) return "everything";
  return [...(a.duration ?? []).map((d) => durationLabel(d)), ...(a.type ?? []).map((t) => typeLabel(t)), ...(a.funnel ?? []).map((f) => funnelLabel(f, true))].join(", ") || "everything";
}

export function RulesSection({ rules }: { rules: RuleRow[] }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("writing");
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[28px] bg-card p-6">
      <p className="text-sm text-muted">Standing instructions about how your scripts and videos should be. Every active rule goes into every Studio prompt.</p>
      <ul className="mt-4 space-y-1.5">
        {rules.map((r) => (
          <li key={r.id} className={`flex items-start gap-3 rounded-[14px] bg-surface px-3 py-2 text-sm ${r.active ? "" : "opacity-50"}`}>
            <input type="checkbox" checked={r.active} aria-label="Active" disabled={pending} onChange={(e) => start(() => saveRuleAction({ ...r, active: e.target.checked }))} className="mt-1" />
            <span className="flex-1">{r.text}</span>
            <span className="text-xs text-muted">{r.category}</span>
            <button className="text-xs text-red-700" onClick={() => { if (confirm("Delete this rule?")) start(() => deleteRuleAction({ id: r.id })); }}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="A new rule" aria-label="New rule" className="min-w-0 flex-1 border bg-surface px-3 py-2 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="rounded-full border bg-surface px-3 text-sm">
          <option>writing</option><option>look</option><option>delivery</option><option>other</option>
        </select>
        <button disabled={pending || !text.trim()} onClick={() => start(async () => { await saveRuleAction({ id: null, text, category, active: true }); setText(""); })} className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-deep">Add rule</button>
      </div>
    </div>
  );
}

export function LessonsSection({ lessons }: { lessons: LessonRow[] }) {
  const [edit, setEdit] = useState<LessonInput | null>(null);
  const [pending, start] = useTransition();
  const toInput = (l: LessonRow): LessonInput => ({ id: l.id, text: l.text, scope: l.scope, appliesTo: l.applies_to ?? { all: true }, evidence: l.evidence, evidencePostIds: l.evidence_post_ids ?? [], status: l.status });
  return (
    <div className="rounded-[28px] bg-card p-6">
      <p className="text-sm text-muted">What you learned from posted pieces. Every lesson that is not retired, and whose “applies to” matches Studio&apos;s brief bar, goes into the prompt.</p>
      <ul className="mt-4 space-y-1.5" data-testid="lessons">
        {lessons.map((l) => (
          <li key={l.id} className={`rounded-[14px] bg-surface px-3 py-2 text-sm ${l.status === "retired" ? "opacity-50" : ""}`}>
            <div className="flex items-start gap-3">
              <span className="flex-1">{l.text}</span>
              <select aria-label="Lesson status" value={l.status} disabled={pending} onChange={(e) => start(async () => { await saveLessonAction({ ...toInput(l), status: e.target.value }); })} className="rounded-full border bg-surface px-2 text-xs">
                <option value="testing">testing</option><option value="confirmed">confirmed</option><option value="retired">retired</option>
              </select>
              <button className="text-xs underline underline-offset-2" onClick={() => setEdit(toInput(l))}>Edit</button>
              <button className="text-xs text-red-700" onClick={() => { if (confirm("Delete this lesson?")) start(() => deleteLessonAction({ id: l.id })); }}>Delete</button>
            </div>
            <div className="mt-0.5 text-xs text-muted">{l.scope} · applies to {appliesLabel(l.applies_to)}{l.evidence ? ` · ${l.evidence}` : ""}</div>
          </li>
        ))}
      </ul>
      <button onClick={() => setEdit(blankLesson())} className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-deep">Add a lesson</button>
      {edit && <LessonDialog initial={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

export function CadenceSection({ settings }: { settings: V2Settings }) {
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-xs ${on ? "border-transparent bg-accent text-accent-deep" : ""}`;
  return (
    <div className="rounded-[28px] bg-card p-6 text-sm">
      <div className="font-medium">Earned durations</div>
      <p className="text-muted">Choosing a duration that isn&apos;t earned shows a one-line reminder in Studio. Tick one once Review shows the shorter ones are holding viewers; no threshold is set for you.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DURATIONS.map((d) => (
          <button key={d.value} className={chip(s.earned.includes(d.value))} onClick={() => setS({ ...s, earned: s.earned.includes(d.value) ? s.earned.filter((x) => x !== d.value) : [...s.earned, d.value] })}>{d.label}</button>
        ))}
      </div>
      <div className="mt-5 font-medium">Weekly cadence</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input type="number" min={0} max={21} value={s.perWeek} onChange={(e) => setS({ ...s, perWeek: Number(e.target.value) })} aria-label="Posts per week" className="w-20 border bg-surface px-3 py-1.5" />
        <span>per week, on</span>
        {days.map((d) => <button key={d} className={chip(s.days.includes(d))} onClick={() => setS({ ...s, days: s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d] })}>{d}</button>)}
        <span>at</span>
        <input value={s.time} onChange={(e) => setS({ ...s, time: e.target.value })} aria-label="Posting time" className="w-32 border bg-surface px-3 py-1.5" />
      </div>
      <button disabled={pending} onClick={() => start(async () => { await saveV2SettingsAction(s); setSaved(true); })} className="mt-4 rounded-full bg-accent px-4 py-2 font-medium text-accent-deep">{saved ? "Saved" : "Save"}</button>
    </div>
  );
}
