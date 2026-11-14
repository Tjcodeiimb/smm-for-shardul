"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DURATIONS, TYPES, FUNNELS, CONTENT_STATUSES, durationLabel, typeLabel, funnelLabel } from "@/lib/taxonomy";
import {
  deleteContentAction,
  deleteStarterContentAction,
  dismissStarterBannerAction,
  setReferenceAction,
  scheduleContentAction,
} from "@/lib/content-actions";
import DeleteDialog from "@/app/components/DeleteDialog";

export type ContentRow = {
  key: string;
  kind: "script" | "carousel";
  id: number;
  title: string;
  duration: number | null;
  type: string | null;
  funnel: string;
  words: number | null;
  slides?: number;
  reference: boolean;
  starter: boolean;
  toFix?: number;
  status: string;
  date: string;
};

type Filters = { format: string; duration: string; type: string; funnel: string; status: string; reference: string; origin: string };
const EMPTY: Filters = { format: "", duration: "", type: "", funnel: "", status: "", reference: "", origin: "" };
const PAGE = 40;

const selectCls = "rounded-full border bg-surface px-3.5 py-2 text-sm";

export default function ContentClient({
  rows,
  initialFormat,
  starter,
}: {
  rows: ContentRow[];
  initialFormat: string;
  starter: { scripts: number; carousels: number } | null;
}) {
  const router = useRouter();
  const [f, setF] = useState<Filters>({ ...EMPTY, format: initialFormat });
  const [q, setQ] = useState("");
  const [more, setMore] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { mode: "rows"; keys: string[] } | { mode: "starter" }>(null);

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setF((prev) => ({ ...prev, [k]: e.target.value }));
    setLimit(PAGE);
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (f.format === "reel" && r.kind !== "script") return false;
      if (f.format === "carousel" && r.kind !== "carousel") return false;
      if (f.duration && String(r.duration) !== f.duration) return false;
      if (f.type === "none" ? r.type : f.type && r.type !== f.type) return false;
      if (f.funnel && r.funnel !== f.funnel) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.reference === "yes" && !r.reference) return false;
      if (f.origin === "starter" && !r.starter) return false;
      if (f.origin === "mine" && r.starter) return false;
      if (needle && !r.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, f, q]);

  const filtered = q.trim() !== "" || Object.values(f).some(Boolean);
  const byKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows]);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function backupUrlFor(keys: string[]) {
    const s = keys.filter((k) => k.startsWith("s")).map((k) => k.slice(1));
    const c = keys.filter((k) => k.startsWith("c")).map((k) => k.slice(1));
    const params = new URLSearchParams();
    if (s.length) params.set("scripts", s.join(","));
    if (c.length) params.set("carousels", c.join(","));
    return `/api/export/backup?${params}`;
  }

  async function deleteKeys(keys: string[], typed: number) {
    const scriptIds = keys.filter((k) => k.startsWith("s")).map((k) => Number(k.slice(1)));
    const carouselIds = keys.filter((k) => k.startsWith("c")).map((k) => Number(k.slice(1)));
    const res = await deleteContentAction({ scriptIds, carouselIds, confirmCount: typed });
    if (res.ok) {
      setSelected(new Set());
      setOpen(null);
      router.refresh();
    }
    return res;
  }

  const starterTotal = starter ? starter.scripts + starter.carousels : 0;

  return (
    <div>
      {starter && (
        <div className="mb-8 rounded-[28px] bg-card p-6">
          <p className="text-sm">
            <span className="font-medium">
              {starter.scripts.toLocaleString()} starter scripts and {starter.carousels.toLocaleString()} starter carousels
            </span>{" "}
            from the old library are still here. Their full text is also kept in{" "}
            <code className="text-xs">docs/handoff/UPCREATE_COMPLETE.md</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/api/export/backup?what=starter" className="rounded-full border px-4 py-2 text-sm hover:bg-foreground/5">
              Download backup
            </a>
            <button onClick={() => setDialog({ mode: "starter" })} className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white">
              Delete all
            </button>
            <form action={dismissStarterBannerAction}>
              <button className="rounded-full px-4 py-2 text-sm text-muted hover:bg-foreground/5">Keep for now</button>
            </form>
          </div>
        </div>
      )}

      {/* Filters, in the brief's order: Format · Duration · Type · Funnel · Status */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select aria-label="Format" value={f.format} onChange={set("format")} className={selectCls}>
          <option value="">All formats</option>
          <option value="reel">Reels</option>
          <option value="carousel">Carousels</option>
        </select>
        <select aria-label="Duration" value={f.duration} onChange={set("duration")} className={selectCls} disabled={f.format === "carousel"}>
          <option value="">Any duration</option>
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <select aria-label="Type" value={f.type} onChange={set("type")} className={selectCls}>
          <option value="">Any type</option>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
          <option value="none">Unclassified</option>
        </select>
        <select aria-label="Funnel" value={f.funnel} onChange={set("funnel")} className={selectCls}>
          <option value="">Any funnel stage</option>
          {FUNNELS.map((x) => (
            <option key={x.value} value={x.value}>{x.label}</option>
          ))}
        </select>
        <select aria-label="Status" value={f.status} onChange={set("status")} className={selectCls}>
          <option value="">Any status</option>
          {CONTENT_STATUSES.map((x) => (
            <option key={x.value} value={x.value}>{x.label}</option>
          ))}
        </select>
        <button onClick={() => setMore((m) => !m)} className="rounded-full px-3.5 py-2 text-sm text-muted hover:bg-foreground/5">
          {more ? "Less" : "More"}
        </button>
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }}
          placeholder="Search titles"
          aria-label="Search titles"
          className="ml-auto w-full sm:w-64 border bg-surface px-3.5 py-2 text-sm"
        />
      </div>
      {more && (
        <div className="mb-4 flex flex-wrap gap-2">
          <select aria-label="Reference" value={f.reference} onChange={set("reference")} className={selectCls}>
            <option value="">Reference or not</option>
            <option value="yes">Reference only</option>
          </select>
          <select aria-label="Origin" value={f.origin} onChange={set("origin")} className={selectCls}>
            <option value="">Starter and mine</option>
            <option value="starter">Starter library only</option>
            <option value="mine">Mine only</option>
          </select>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">
          {shown.length.toLocaleString()} {shown.length === 1 ? "item" : "items"}
          {filtered && ` of ${rows.length.toLocaleString()}`}
        </span>
        {filtered && (
          <button onClick={() => { setF(EMPTY); setQ(""); }} className="text-muted underline-offset-2 hover:underline">
            Clear filters
          </button>
        )}
        <span className="ml-auto flex gap-2">
          {selected.size > 0 && (
            <button onClick={() => setDialog({ mode: "rows", keys: [...selected] })} className="rounded-full border border-red-700/40 px-4 py-1.5 text-red-700 hover:bg-red-700/5">
              Delete selected ({selected.size})
            </button>
          )}
          {filtered && shown.length > 0 && (
            <button onClick={() => setDialog({ mode: "rows", keys: shown.map((r) => r.key) })} className="rounded-full border border-red-700/40 px-4 py-1.5 text-red-700 hover:bg-red-700/5">
              Delete all {shown.length.toLocaleString()} shown
            </button>
          )}
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-[28px] bg-card p-10 text-center text-sm text-muted">
          {rows.length === 0 ? "Nothing here yet. Write something in Studio." : "Nothing matches these filters."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] bg-card">
          <div className="hidden md:grid grid-cols-[28px_1fr_90px_160px_80px_100px] gap-3 px-5 py-3 text-xs text-muted border-b border-border/10">
            <span />
            <span>Title</span>
            <span>Duration</span>
            <span>Type</span>
            <span>Funnel</span>
            <span>Status</span>
          </div>
          {shown.slice(0, limit).map((r) => (
            <Row
              key={r.key}
              row={r}
              selected={selected.has(r.key)}
              onToggle={() => toggle(r.key)}
              open={open === r.key}
              onOpen={() => setOpen(open === r.key ? null : r.key)}
              onDelete={() => setDialog({ mode: "rows", keys: [r.key] })}
              onChanged={() => router.refresh()}
            />
          ))}
        </div>
      )}
      {shown.length > limit && (
        <div className="mt-4 text-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="rounded-full border px-5 py-2 text-sm hover:bg-foreground/5">
            Show more ({(shown.length - limit).toLocaleString()} left)
          </button>
        </div>
      )}

      {dialog?.mode === "rows" && (
        <DeleteDialog
          title={dialog.keys.length === 1 ? `Delete “${byKey.get(dialog.keys[0])?.title ?? "this item"}”?` : `Delete ${dialog.keys.length.toLocaleString()} items?`}
          description="This also removes their calendar entries and versions. Posts you logged in the performance log are kept."
          count={dialog.keys.length}
          backupUrl={dialog.keys.length > 1 ? backupUrlFor(dialog.keys) : undefined}
          onConfirm={(typed) => deleteKeys(dialog.keys, typed)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.mode === "starter" && (
        <DeleteDialog
          title="Delete the starter library?"
          description={`Deletes ${starter?.scripts ?? 0} starter scripts, ${starter?.carousels ?? 0} starter carousels and their calendar entries. Your own scripts and the reference scripts stay.`}
          count={starterTotal}
          backupUrl="/api/export/backup?what=starter"
          onConfirm={async (typed) => {
            const res = await deleteStarterContentAction({ confirmCount: typed });
            if (res.ok) router.refresh();
            return res;
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function Row({
  row,
  selected,
  onToggle,
  open,
  onOpen,
  onDelete,
  onChanged,
}: {
  row: ContentRow;
  selected: boolean;
  onToggle: () => void;
  open: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onChanged: () => void;
}) {
  return (
    <div className="border-b border-border/10 last:border-b-0">
      <div className="grid grid-cols-[28px_1fr] md:grid-cols-[28px_1fr_90px_160px_80px_100px] items-center gap-3 px-5 py-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${row.title}`} />
        <button onClick={onOpen} className="min-w-0 text-left">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <span className="truncate">{row.title}</span>
            {row.reference && <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-deep">Reference</span>}
            {row.starter && <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] text-muted">Starter</span>}
            {Boolean(row.toFix) && <span className="shrink-0 rounded-full bg-red-700/10 px-2 py-0.5 text-[11px] text-red-700" title="Checks that failed when it was saved">{row.toFix} to fix</span>}
          </span>
          <span className="mt-0.5 block text-xs text-muted md:hidden">
            {row.kind === "carousel" ? "Carousel" : durationLabel(row.duration)} · {typeLabel(row.type)} · {funnelLabel(row.funnel, true)} · {row.status}
          </span>
        </button>
        <span className="hidden md:block text-sm text-muted">{row.kind === "carousel" ? `Carousel` : durationLabel(row.duration)}</span>
        <span className="hidden md:block text-sm text-muted truncate">{typeLabel(row.type)}</span>
        <span className="hidden md:block text-sm text-muted">{funnelLabel(row.funnel, true)}</span>
        <span className="hidden md:block text-sm text-muted capitalize">{row.status}{row.date && row.status !== "draft" ? ` · ${row.date.slice(5)}` : ""}</span>
      </div>
      {open && <Detail row={row} onDelete={onDelete} onChanged={onChanged} />}
    </div>
  );
}

function Detail({ row, onDelete, onChanged }: { row: ContentRow; onDelete: () => void; onChanged: () => void }) {
  const [body, setBody] = useState<null | { say: string; board: string; screen: string } | { slides: { slide_role: string; headline: string; supporting_text: string }[] }>(null);
  const [date, setDate] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    const url = row.kind === "script" ? `/api/scripts/${row.id}/body` : `/api/carousels/${row.id}/slides`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        setBody(row.kind === "script" ? { say: d.body_black ?? "", board: d.body_red ?? "", screen: d.body_green ?? "" } : { slides: d.slides ?? [] });
      });
    return () => { live = false; };
  }, [row.kind, row.id]);

  return (
    <div className="bg-surface/60 px-5 pb-5 pt-1 md:pl-[60px]">
      {row.kind === "script" && row.words !== null && (
        <p className="mb-3 text-xs text-muted">
          {row.words} spoken words · about {Math.round(row.words / 2.5)} s at 2.5 words per second
        </p>
      )}
      {body === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : "slides" in body ? (
        <ol className="space-y-2 text-sm">
          {body.slides.map((s, i) => (
            <li key={i}>
              <span className="text-xs text-muted">{i + 1} · {s.slide_role}</span>
              <div className="font-medium">{s.headline}</div>
              {s.supporting_text && <div className="text-muted">{s.supporting_text}</div>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <Layer label="Say" text={body.say} />
          <Layer label="Board" text={body.board} />
          <Layer label="Screen" text={body.screen} />
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {row.kind === "script" ? (
          <>
            <Link href={`/studio?id=${row.id}`} className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-deep">Open in Studio</Link>
            <Link href={`/studio?id=${row.id}&mode=improve`} className="rounded-full border px-4 py-1.5 hover:bg-foreground/5">Improve</Link>
            <Link href={`/studio?id=${row.id}&mode=resize`} className="rounded-full border px-4 py-1.5 hover:bg-foreground/5">Resize</Link>
            <Link href={`/studio?fromScript=${row.id}&format=carousel`} className="rounded-full border px-4 py-1.5 hover:bg-foreground/5">Make carousel</Link>
          </>
        ) : (
          <Link href={`/studio?carousel=${row.id}`} className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-deep">Open in Studio</Link>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Schedule date" className="border bg-surface px-3 py-1.5 text-sm" />
        <button
          disabled={!date || pending}
          onClick={() => start(async () => { await scheduleContentAction({ kind: row.kind, id: row.id, date }); setDate(""); onChanged(); })}
          className="rounded-full bg-accent px-4 py-1.5 font-medium text-accent-deep disabled:opacity-40"
        >
          Schedule
        </button>
        <button
          disabled={pending}
          onClick={() => start(async () => { await setReferenceAction({ kind: row.kind, id: row.id, value: !row.reference }); onChanged(); })}
          className="rounded-full border px-4 py-1.5 hover:bg-foreground/5"
        >
          {row.reference ? "Unmark reference" : "Mark as reference"}
        </button>
        <button onClick={onDelete} className="ml-auto rounded-full px-4 py-1.5 text-red-700 hover:bg-red-700/5">
          Delete
        </button>
      </div>
    </div>
  );
}

function Layer({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-muted">{label}</div>
      <div className="whitespace-pre-wrap">{text || <span className="text-muted">—</span>}</div>
    </div>
  );
}
