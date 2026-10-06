"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/Icons";
import { updateCalendarItemStatus } from "@/lib/actions";
import { CALENDAR_STATUSES } from "@/lib/reference";

export type PipelineItem = {
  id: number;
  date: string;
  pillar: string;
  topic: string;
  format: string;
  status: string;
};

const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  researched: "Researched",
  scripted: "Scripted",
  filmed: "Filmed",
  edited: "Edited",
  posted: "Posted",
};

export default function PipelineBoard({ items }: { items: PipelineItem[] }) {
  const [filter, setFilter] = useState<"all" | "authority" | "journey">("all");

  const visible = useMemo(
    () => items.filter((c) => filter === "all" || c.pillar === filter),
    [items, filter]
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="inline-flex rounded-full bg-card p-1">
          {(["all", "authority", "journey"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${
                filter === f ? "bg-surface font-medium" : "text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{visible.length} videos</span>
        </div>
      </div>

      <div data-tour="pipeline-board" className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {CALENDAR_STATUSES.map((stage) => {
          const col = visible.filter((c) => c.status === stage);
          return (
            <div key={stage} className="w-72 shrink-0 rounded-[28px] bg-card p-3">
              <div className="flex items-center justify-between px-2 py-2 mb-1">
                <span className="text-sm font-medium">{STAGE_LABELS[stage] ?? stage}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted tabular-nums">
                  {col.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 min-h-24">
                {col.map((c) => (
                  <div key={c.id} className="rounded-[18px] bg-surface p-4">
                    <div className="text-sm font-medium leading-snug">{c.topic || "(untitled topic)"}</div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          c.pillar === "authority" ? "bg-accent text-accent-deep" : "bg-foreground/10"
                        }`}
                      >
                        {c.pillar}
                      </span>
                      {c.format && (
                        <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-muted">
                          {c.format}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={12} /> {c.date}
                      </span>
                      <form action={updateCalendarItemStatus}>
                        <input type="hidden" name="id" value={c.id} />
                        <select
                          name="status"
                          defaultValue={c.status}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className="rounded-full border border-border/15 bg-card text-foreground text-[11px] px-2 py-1"
                        >
                          {CALENDAR_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STAGE_LABELS[s] ?? s}
                            </option>
                          ))}
                        </select>
                      </form>
                    </div>
                  </div>
                ))}
                {col.length === 0 && (
                  <div className="rounded-[18px] border border-dashed border-border/15 py-6 text-center text-xs text-muted">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
