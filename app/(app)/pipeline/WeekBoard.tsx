"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setCalendarStatusAction, markPostedAction } from "@/lib/loop-actions";
import { durationLabel, typeLabel } from "@/lib/taxonomy";

export type WeekItem = { id: number; date: string; topic: string; status: string; script_id: number | null; carousel_id: number | null; duration_s: number | null; type: string | null };

const COLUMNS = [
  { status: "idea", label: "Idea" },
  { status: "researched", label: "Researched" },
  { status: "scripted", label: "Scripted" },
  { status: "filmed", label: "Shot" },
  { status: "edited", label: "Edited" },
  { status: "posted", label: "Posted" },
  { status: "reviewed", label: "Reviewed" },
];

export default function WeekBoard({ items, today }: { items: WeekItem[]; today: string }) {
  const [drag, setDrag] = useState<number | null>(null);
  const [posting, setPosting] = useState<WeekItem | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();

  function move(item: WeekItem, status: string) {
    if (status === item.status) return;
    if (status === "posted") { setPosting(item); return; }
    start(() => setCalendarStatusAction({ id: item.id, status }));
  }

  const shootIds = [...picked].filter((id) => items.find((i) => i.id === id)?.script_id);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">{picked.size ? `${picked.size} selected` : "Tick scripted cards for a shoot sheet."}</span>
        {shootIds.length > 0 && (
          <a href={`/api/export/shoot-sheet?ids=${shootIds.join(",")}`} className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-deep">Export shoot sheet ({shootIds.length})</a>
        )}
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {COLUMNS.map((col) => {
          const list = items.filter((i) => (i.status || "idea") === col.status);
          return (
            <div
              key={col.status}
              data-column={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { const it = items.find((i) => i.id === drag); if (it) move(it, col.status); setDrag(null); }}
              className="w-64 shrink-0 rounded-[22px] bg-card p-3"
            >
              <div className="mb-2 flex items-center justify-between px-1 text-sm font-medium">{col.label}<span className="text-xs text-muted">{list.length}</span></div>
              <div className="space-y-2">
                {list.map((it) => (
                  <div key={it.id} draggable onDragStart={() => setDrag(it.id)} data-testid="week-card" className={`cursor-grab rounded-[14px] bg-surface p-3 text-sm ${pending ? "opacity-70" : ""}`}>
                    <div className="flex items-start gap-2">
                      {col.status === "scripted" && it.script_id && (
                        <input type="checkbox" aria-label="Add to shoot sheet" checked={picked.has(it.id)} onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(it.id)) n.delete(it.id); else n.add(it.id); return n; })} className="mt-1" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{it.topic || "Untitled"}</div>
                        <div className="text-xs text-muted">{it.date}{it.duration_s ? ` · ${durationLabel(it.duration_s)}` : it.carousel_id ? " · Carousel" : ""}{it.type ? ` · ${typeLabel(it.type)}` : ""}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select aria-label="Status" value={it.status || "idea"} onChange={(e) => move(it, e.target.value)} className="rounded-full border bg-surface px-2 py-0.5 text-xs">
                        {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
                      </select>
                      {it.script_id && <Link href={`/studio?id=${it.script_id}`} className="text-xs underline underline-offset-2">Open</Link>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {posting && <PostedDialog item={posting} today={today} onClose={() => setPosting(null)} />}
    </div>
  );
}

function PostedDialog({ item, today, onClose }: { item: WeekItem; today: string; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(item.date <= today ? item.date : today);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Mark as posted">
      <div className="w-full max-w-md rounded-[28px] bg-surface p-6">
        <h2 className="font-heading text-xl">Posted: “{item.topic}”</h2>
        <p className="mt-1 text-sm text-muted">Add the Reel link and the date it went live. Posts will ask for its numbers at 48 hours and at 7 days.</p>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/…" aria-label="Reel link" className="mt-4 w-full border bg-surface px-3 py-2 text-sm" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Posted on" className="mt-2 w-full border bg-surface px-3 py-2 text-sm" />
        {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm">Cancel</button>
          <button disabled={pending} onClick={() => start(async () => { const r = await markPostedAction({ calendarItemId: item.id, url, date, videoLength: null }); if (r.ok) onClose(); else setErr(r.error); })} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep">Mark as posted</button>
        </div>
      </div>
    </div>
  );
}
