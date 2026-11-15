"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SNAPSHOT_FIELDS, metrics, latestSnapshot, dueSnapshots, type Snapshot, type PostNotes } from "@/lib/posts";
import { durationLabel, typeLabel, funnelLabel } from "@/lib/taxonomy";
import { saveSnapshotAction, savePostNotesAction, markPostedAction } from "@/lib/loop-actions";
import LessonDialog, { blankLesson } from "@/app/components/LessonDialog";
import type { LessonInput } from "@/lib/loop-actions";

export type PostRow = {
  id: number; title: string; date: string; url: string; videoLength: number | null; snapshots: Snapshot[]; whereLeft: string; notes: PostNotes;
  legacyViews: number; scriptId: number | null; layers: { duration: number | null; type: string | null; funnel: string | null; hookFormula: string | null };
};
export type Unlogged = { id: number; date: string; topic: string; status: string };

const fmt = (v: number | null, digits = 1, suffix = "") => (v === null ? "—" : `${v.toFixed(digits)}${suffix}`);
const field = "w-full border bg-surface px-2.5 py-1.5 text-sm";

export default function PostsClient({ posts, unlogged, today }: { posts: PostRow[]; unlogged: Unlogged[]; today: string }) {
  const [lesson, setLesson] = useState<LessonInput | null>(null);
  return (
    <div className="space-y-8">
      {unlogged.length > 0 && (
        <section>
          <h2 className="font-heading text-xl">Waiting for a link</h2>
          <p className="mb-3 text-sm text-muted">Pieces marked Edited or Posted with no log yet. Add the Reel link and the date it went live.</p>
          <div className="space-y-2">{unlogged.map((u) => <StartLog key={u.id} item={u} today={today} />)}</div>
        </section>
      )}
      <section>
        <h2 className="mb-3 font-heading text-xl">Logged posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="rounded-[28px] bg-card p-6 text-sm text-muted">Nothing logged yet. When a piece goes live, move it to Posted in the Week view or add its link above.</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} today={today} onLesson={() => setLesson(blankLesson({
                evidencePostIds: [p.id], evidence: `“${p.title}”, posted ${p.date}`,
                appliesTo: p.layers.duration || p.layers.type || p.layers.funnel ? { all: false, duration: p.layers.duration ? [p.layers.duration] : [], type: p.layers.type ? [p.layers.type] : [], funnel: p.layers.funnel ? [p.layers.funnel] : [] } : { all: true },
              }))} />
            ))}
          </div>
        )}
      </section>
      {lesson && <LessonDialog initial={lesson} onClose={() => setLesson(null)} />}
    </div>
  );
}

function StartLog({ item, today }: { item: Unlogged; today: string }) {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(item.date <= today ? item.date : today);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[22px] bg-card p-4">
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.topic || "Untitled"}</span>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Reel link" aria-label="Reel link" className="w-56 border bg-surface px-3 py-1.5 text-sm" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Posted on" className="border bg-surface px-3 py-1.5 text-sm" />
      <button disabled={pending} onClick={() => start(async () => { const r = await markPostedAction({ calendarItemId: item.id, url, date, videoLength: null }); if (!r.ok) setErr(r.error); })} className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep">Start log</button>
      {err && <span className="text-sm text-red-700">{err}</span>}
    </div>
  );
}

function PostCard({ post, today, onLesson }: { post: PostRow; today: string; onLesson: () => void }) {
  const due = dueSnapshots(post.date, post.snapshots, new Date(`${today}T12:00:00Z`));
  const [open, setOpen] = useState<null | "48h" | "7d" | "notes">(null);
  const latest = latestSnapshot(post.snapshots);
  const m = metrics(latest, post.videoLength);
  const L = post.layers;
  return (
    <div className="rounded-[28px] bg-card p-5" data-testid="post">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium">{post.title || "Untitled"}</div>
          <div className="text-xs text-muted">
            Posted {post.date}{post.url && <> · <a href={post.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">Reel</a></>}
            {L.duration ? ` · ${durationLabel(L.duration)} · ${typeLabel(L.type)} · ${funnelLabel(L.funnel, true)}` : ""}
            {post.videoLength ? ` · ${post.videoLength} s long` : ""}
          </div>
        </div>
        {due.map((d) => <span key={d} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-deep">{d === "48h" ? "48-hour numbers due" : "7-day numbers due"}</span>)}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
        <Stat label="Watch-through" value={m.watchThrough === null ? "—" : `${Math.round(m.watchThrough * 100)}%`} />
        <Stat label="Skip rate (3 s)" value={fmt(m.skipRate, 0, "%")} />
        <Stat label="Sends / 1k reached" value={fmt(m.sendsPer1k)} />
        <Stat label="Saves / 1k reached" value={fmt(m.savesPer1k)} />
        <Stat label="Follows / 1k reached" value={fmt(m.followsPer1k)} />
      </div>
      {!latest && post.legacyViews > 0 && <p className="mt-2 text-xs text-muted">Logged before v2: {post.legacyViews.toLocaleString()} views.</p>}
      {post.whereLeft && <p className="mt-2 text-sm"><span className="text-muted">Where people left:</span> {post.whereLeft}</p>}
      {(post.notes.worked || post.notes.didNot || post.notes.questions) && (
        <div className="mt-2 space-y-0.5 text-sm">
          {post.notes.worked && <p><span className="text-muted">Worked:</span> {post.notes.worked}</p>}
          {post.notes.didNot && <p><span className="text-muted">Didn&apos;t:</span> {post.notes.didNot}</p>}
          {post.notes.questions && <p><span className="text-muted">Comment questions:</span> {post.notes.questions}</p>}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button onClick={() => setOpen(open === "48h" ? null : "48h")} className="rounded-full border px-3.5 py-1.5">48-hour numbers</button>
        <button onClick={() => setOpen(open === "7d" ? null : "7d")} className="rounded-full border px-3.5 py-1.5">7-day numbers</button>
        <button onClick={() => setOpen(open === "notes" ? null : "notes")} className="rounded-full border px-3.5 py-1.5">Notes</button>
        <button onClick={onLesson} className="rounded-full border px-3.5 py-1.5">Save a lesson</button>
        {post.scriptId && <Link href={`/studio?like=${post.scriptId}`} className="rounded-full border px-3.5 py-1.5">Make another like this</Link>}
      </div>
      {(open === "48h" || open === "7d") && <SnapshotForm key={open} post={post} at={open} onDone={() => setOpen(null)} />}
      {open === "notes" && <NotesForm post={post} onDone={() => setOpen(null)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[14px] bg-surface p-2.5"><div className="text-xs text-muted">{label}</div><div className="font-medium tabular-nums">{value}</div></div>;
}

function SnapshotForm({ post, at, onDone }: { post: PostRow; at: "48h" | "7d"; onDone: () => void }) {
  const existing = post.snapshots.find((s) => s.at === at) ?? { at };
  const [v, setV] = useState<Record<string, string>>(Object.fromEntries(SNAPSHOT_FIELDS.map((f) => [f.key, existing[f.key] == null ? "" : String(existing[f.key])])));
  const [len, setLen] = useState(post.videoLength ? String(post.videoLength) : "");
  const [left, setLeft] = useState(post.whereLeft);
  const [pending, start] = useTransition();
  return (
    <div className="mt-4 rounded-[18px] bg-surface p-4">
      <div className="mb-2 text-sm font-medium">{at === "48h" ? "Numbers at about 48 hours" : "Numbers at 7 days"} <span className="font-normal text-muted">(all optional, typed in by hand)</span></div>
      {(["Reach", "Retention", "Response"] as const).map((g) => (
        <div key={g} className="mb-2">
          <div className="text-xs text-muted">{g}</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {SNAPSHOT_FIELDS.filter((f) => f.group === g).map((f) => (
              <label key={f.key} className="text-xs">{f.label}{f.unit ? ` (${f.unit})` : ""}
                <input inputMode="decimal" value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} aria-label={f.label} className={field} />
              </label>
            ))}
            {g === "Retention" && <label className="text-xs">Video length (s)<input inputMode="decimal" value={len} onChange={(e) => setLen(e.target.value)} aria-label="Video length" className={field} /></label>}
          </div>
        </div>
      ))}
      <label className="text-xs">Where most people left (e.g. “at 0:07, when the study starts”)<input value={left} onChange={(e) => setLeft(e.target.value)} aria-label="Where people left" className={field} /></label>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          const snap: Snapshot = { at };
          for (const f of SNAPSHOT_FIELDS) (snap as Record<string, unknown>)[f.key] = v[f.key].trim() === "" ? null : Number(v[f.key]);
          await saveSnapshotAction({ postId: post.id, snapshot: snap, videoLength: len.trim() ? Number(len) : null, whereLeft: left });
          onDone();
        })}
        className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep"
      >
        Save numbers
      </button>
    </div>
  );
}

function NotesForm({ post, onDone }: { post: PostRow; onDone: () => void }) {
  const [n, setN] = useState<PostNotes>(post.notes);
  const [pending, start] = useTransition();
  const box = (k: keyof PostNotes, label: string) => (
    <label className="block text-xs">{label}<textarea value={n[k] ?? ""} onChange={(e) => setN({ ...n, [k]: e.target.value })} rows={2} aria-label={label} className={field} /></label>
  );
  return (
    <div className="mt-4 space-y-2 rounded-[18px] bg-surface p-4">
      {box("worked", "What worked")}
      {box("didNot", "What did not")}
      {box("questions", "Questions people asked in comments (seeds for a lead magnet)")}
      {box("other", "Anything else")}
      <button disabled={pending} onClick={() => start(async () => { await savePostNotesAction({ postId: post.id, notes: n }); onDone(); })} className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep">Save notes</button>
    </div>
  );
}
