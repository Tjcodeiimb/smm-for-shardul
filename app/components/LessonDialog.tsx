"use client";

import { useState, useTransition } from "react";
import { DURATIONS, TYPES, FUNNELS } from "@/lib/taxonomy";
import { saveLessonAction, type LessonInput } from "@/lib/loop-actions";

export const LESSON_SCOPES = ["hook", "structure", "length", "topic", "delivery", "edit", "audience"];

export function blankLesson(partial: Partial<LessonInput> = {}): LessonInput {
  return { id: null, text: "", scope: "structure", appliesTo: { all: true }, evidence: "", evidencePostIds: [], status: "testing", ...partial };
}

// Add or edit a lesson (v2 brief, section 10.1). Lessons that are not
// retired, and whose "applies to" matches the brief bar, go into every
// Studio prompt.
export default function LessonDialog({ initial, onClose }: { initial: LessonInput; onClose: () => void }) {
  const [l, setL] = useState<LessonInput>(initial);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const a = l.appliesTo;
  const toggle = <K extends "duration" | "type" | "funnel">(k: K, v: NonNullable<LessonInput["appliesTo"][K]>[number]) => {
    const list = (a[k] ?? []) as (typeof v)[];
    const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
    setL({ ...l, appliesTo: { ...a, all: false, [k]: next } });
  };
  const chip = (on: boolean) => `rounded-full border px-2.5 py-1 text-xs ${on ? "bg-accent text-accent-deep border-transparent" : ""}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Lesson">
      <div className="w-full max-w-lg rounded-[28px] bg-surface p-6">
        <h2 className="font-heading text-xl">{l.id ? "Edit lesson" : "Save a lesson"}</h2>
        <textarea value={l.text} onChange={(e) => setL({ ...l, text: e.target.value })} rows={3} aria-label="Lesson text" placeholder="What you learned, in one or two sentences" className="mt-4 w-full border bg-surface px-3 py-2 text-sm" />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span>Scope</span>
          <select aria-label="Scope" value={l.scope} onChange={(e) => setL({ ...l, scope: e.target.value })} className="rounded-full border bg-surface px-3 py-1.5">
            {LESSON_SCOPES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-2">Status</span>
          <select aria-label="Status" value={l.status} onChange={(e) => setL({ ...l, status: e.target.value })} className="rounded-full border bg-surface px-3 py-1.5">
            <option value="testing">testing</option><option value="confirmed">confirmed</option><option value="retired">retired</option>
          </select>
        </div>
        <div className="mt-4 text-sm">
          <div className="mb-1.5">Applies to</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={chip(Boolean(a.all))} onClick={() => setL({ ...l, appliesTo: { all: true } })}>Everything</button>
            {DURATIONS.map((d) => <button key={d.value} className={chip(!a.all && Boolean(a.duration?.includes(d.value)))} onClick={() => toggle("duration", d.value)}>{d.label}</button>)}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TYPES.map((t) => <button key={t.value} className={chip(!a.all && Boolean(a.type?.includes(t.value)))} onClick={() => toggle("type", t.value)}>{t.label}</button>)}
            {FUNNELS.map((f) => <button key={f.value} className={chip(!a.all && Boolean(a.funnel?.includes(f.value)))} onClick={() => toggle("funnel", f.value)}>{f.short}</button>)}
          </div>
        </div>
        <input value={l.evidence} onChange={(e) => setL({ ...l, evidence: e.target.value })} aria-label="Evidence" placeholder="Evidence (which posts, what numbers)" className="mt-4 w-full border bg-surface px-3 py-2 text-sm" />
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm">Cancel</button>
          <button disabled={pending} onClick={() => start(async () => { const r = await saveLessonAction(l); if (r.ok) onClose(); else setErr(r.error); })} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep">Save lesson</button>
        </div>
      </div>
    </div>
  );
}
