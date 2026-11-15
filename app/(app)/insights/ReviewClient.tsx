"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { REVIEW_GROUPS, latestSnapshot, metrics, median, type Snapshot, type PostNotes } from "@/lib/posts";
import { durationLabel, typeLabel, funnelLabel } from "@/lib/taxonomy";
import LessonDialog, { blankLesson } from "@/app/components/LessonDialog";
import PromptBar from "@/app/components/PromptBar";
import type { LessonInput } from "@/lib/loop-actions";

type Layers = { duration: number | null; type: string | null; funnel: string | null; hookFormula: string | null; audience: string | null; pillar: string | null };
export type ReviewPost = { id: number; title: string; date: string; videoLength: number | null; snapshots: Snapshot[]; notes: PostNotes; whereLeft: string; scriptId: number | null; layers: Layers };
type GroupKey = (typeof REVIEW_GROUPS)[number]["value"];

function groupLabel(key: GroupKey, v: string | number | null) {
  if (v === null || v === "") return "Not set";
  if (key === "duration") return durationLabel(Number(v));
  if (key === "type") return typeLabel(String(v));
  if (key === "funnel") return funnelLabel(String(v));
  return String(v);
}
const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
const num = (x: number | null, suffix = "") => (x === null ? "—" : `${x.toFixed(1)}${suffix}`);

export function buildSuggestLessonsPrompt(posts: ReviewPost[]) {
  const lines = posts.slice(0, 12).map((p) => {
    const m = metrics(latestSnapshot(p.snapshots), p.videoLength);
    return `- "${p.title}" (${p.date}; ${durationLabel(p.layers.duration)}, ${typeLabel(p.layers.type)}, ${funnelLabel(p.layers.funnel, true)}${p.layers.hookFormula ? `, hook: ${p.layers.hookFormula}` : ""}): watch-through ${pct(m.watchThrough)}, skip ${num(m.skipRate, "%")}, sends/1k ${num(m.sendsPer1k)}, follows/1k ${num(m.followsPer1k)}.${p.whereLeft ? ` Left: ${p.whereLeft}.` : ""}${p.notes.worked ? ` Worked: ${p.notes.worked}.` : ""}${p.notes.didNot ? ` Didn't: ${p.notes.didNot}.` : ""}`;
  });
  return `Suggest up to five candidate lessons for Shardul's short videos from his own recent posts below. A lesson is something learned from posted pieces that should change future scripts (scope: hook, structure, length, topic, delivery, edit or audience).

Rules: base every lesson only on the numbers and notes below; do not invent benchmarks or outside facts; say how strong the evidence is (with fewer than three posts behind it, say so); keep each lesson to one or two sentences.

Recent posts:
${lines.join("\n") || "(none logged yet)"}

Output: one lesson per line, starting with "- ", then " [scope]" at the end.`;
}

export default function ReviewClient({ posts }: { posts: ReviewPost[] }) {
  const [by, setBy] = useState<GroupKey>("duration");
  const [lesson, setLesson] = useState<LessonInput | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const withNumbers = posts.filter((p) => latestSnapshot(p.snapshots));

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; raw: string | number | null; posts: ReviewPost[] }>();
    for (const p of withNumbers) {
      const raw = p.layers[by];
      const key = String(raw ?? "");
      if (!map.has(key)) map.set(key, { label: groupLabel(by, raw), raw, posts: [] });
      map.get(key)!.posts.push(p);
    }
    return [...map.values()].map((g) => {
      const ms = g.posts.map((p) => metrics(latestSnapshot(p.snapshots), p.videoLength));
      return {
        ...g,
        n: g.posts.length,
        watchThrough: median(ms.map((m) => m.watchThrough)),
        skip: median(ms.map((m) => m.skipRate)),
        sends: median(ms.map((m) => m.sendsPer1k)),
        follows: median(ms.map((m) => m.followsPer1k)),
      };
    }).sort((a, b) => b.n - a.n);
  }, [withNumbers, by]);

  function lessonFor(raw: string | number | null, ids: number[], label: string) {
    const appliesTo = raw !== null && raw !== "" && (by === "duration" || by === "type" || by === "funnel")
      ? { all: false, [by]: [by === "duration" ? Number(raw) : String(raw)] }
      : { all: true };
    setLesson(blankLesson({ appliesTo, evidencePostIds: ids, evidence: `${ids.length} ${ids.length === 1 ? "post" : "posts"} in group “${label}” (${REVIEW_GROUPS.find((x) => x.value === by)?.label})` }));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">Group by</span>
        <select aria-label="Group by" value={by} onChange={(e) => setBy(e.target.value as GroupKey)} className="rounded-full border bg-surface px-3.5 py-2 text-sm">
          {REVIEW_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <span className="text-sm text-muted">{withNumbers.length} of {posts.length} logged posts have numbers.</span>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-[28px] bg-card p-6 text-sm text-muted">No numbers logged yet. Log a post&apos;s 48-hour or 7-day numbers in Posts and it shows up here.</p>
      ) : (
        <div className="overflow-x-auto rounded-[28px] bg-card">
          <table className="w-full text-sm" data-testid="review-table">
            <thead><tr className="text-left text-xs text-muted">
              <th className="px-5 py-3 font-normal">{REVIEW_GROUPS.find((g) => g.value === by)?.label}</th>
              <th className="px-3 py-3 font-normal">Posts</th>
              <th className="px-3 py-3 font-normal">Median watch-through</th>
              <th className="px-3 py-3 font-normal">Median skip rate</th>
              <th className="px-3 py-3 font-normal">Median sends / 1k</th>
              <th className="px-3 py-3 font-normal">Median follows / 1k</th>
              <th className="px-3 py-3" />
            </tr></thead>
            <tbody>
              {groups.map((g) => {
                const few = g.n < 3;
                return (
                  <tr key={g.label} className={`border-t border-border/10 ${few ? "text-muted" : ""}`} data-few={few ? "true" : "false"}>
                    <td className="px-5 py-3 font-medium">{g.label}{few && <div className="text-xs font-normal">too few posts to compare</div>}</td>
                    <td className="px-3 py-3 tabular-nums">{g.n}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(g.watchThrough)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(g.skip, "%")}</td>
                    <td className="px-3 py-3 tabular-nums">{num(g.sends)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(g.follows)}</td>
                    <td className="px-3 py-3 text-right"><button onClick={() => lessonFor(g.raw, g.posts.map((p) => p.id), g.label)} className="rounded-full border px-3 py-1 text-xs">Save a lesson</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {withNumbers.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-xl">Posts</h2>
          <div className="space-y-2">
            {withNumbers.map((p) => {
              const m = metrics(latestSnapshot(p.snapshots), p.videoLength);
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-[18px] bg-card px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                  <span className="text-xs text-muted">{pct(m.watchThrough)} watched · {num(m.sendsPer1k)} sends/1k</span>
                  <button onClick={() => setLesson(blankLesson({ evidencePostIds: [p.id], evidence: `“${p.title}”` }))} className="rounded-full border px-3 py-1 text-xs">Save a lesson</button>
                  {p.scriptId && <Link href={`/studio?like=${p.scriptId}`} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-deep">Make another like this</Link>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-[28px] bg-card p-6">
        <h2 className="font-heading text-xl">Suggest lessons</h2>
        <p className="text-sm text-muted">Drafts candidate lessons from your recent numbers and notes. Nothing is saved until you approve it.</p>
        <PromptBar prompt={buildSuggestLessonsPrompt(withNumbers)} onResult={(t) => setCandidates(t.split("\n").filter((l) => l.trim().startsWith("- ")).map((l) => l.trim().slice(2)))} label="Suggest lessons" applyLabel="Use these" />
        {candidates.length > 0 && (
          <ul className="mt-4 space-y-2">
            {candidates.map((c, i) => {
              const scope = c.match(/\[(hook|structure|length|topic|delivery|edit|audience)\]\s*$/i)?.[1]?.toLowerCase() ?? "structure";
              const text = c.replace(/\s*\[[a-z]+\]\s*$/i, "");
              return (
                <li key={i} className="flex items-start gap-3 rounded-[14px] bg-surface p-3 text-sm">
                  <span className="flex-1">{text} <span className="text-xs text-muted">[{scope}]</span></span>
                  <button onClick={() => { setLesson(blankLesson({ text, scope })); setCandidates((cs) => cs.filter((_, j) => j !== i)); }} className="rounded-full border px-3 py-1 text-xs">Approve…</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {lesson && <LessonDialog initial={lesson} onClose={() => setLesson(null)} />}
    </div>
  );
}
