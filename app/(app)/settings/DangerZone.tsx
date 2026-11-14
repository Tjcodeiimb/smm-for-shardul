"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DangerCounts } from "@/lib/v2";
import { deleteAllScriptsAction, deleteAllCarouselsAction, clearCalendarAction } from "@/lib/content-actions";
import DeleteDialog from "@/app/components/DeleteDialog";

// Settings > Danger zone (v2 brief, section 6.3): three separate buttons,
// each showing its count, each with a JSON backup and a typed confirmation.
export default function DangerZone({ counts }: { counts: DangerCounts }) {
  const router = useRouter();
  const [open, setOpen] = useState<null | "scripts" | "carousels" | "calendar">(null);
  const [includeRefs, setIncludeRefs] = useState(false);
  const scriptCount = counts.scripts + (includeRefs ? counts.referenceScripts : 0);

  const rows = [
    {
      key: "scripts" as const,
      title: "Delete all scripts",
      detail: `${counts.scripts.toLocaleString()} scripts${counts.referenceScripts ? `, plus ${counts.referenceScripts} reference ${counts.referenceScripts === 1 ? "script" : "scripts"} kept unless you choose otherwise` : ""}. Their calendar entries go too.`,
      count: counts.scripts + counts.referenceScripts,
    },
    { key: "carousels" as const, title: "Delete all carousels", detail: `${counts.carousels.toLocaleString()} carousels and their calendar entries.`, count: counts.carousels },
    { key: "calendar" as const, title: "Clear the calendar", detail: `${counts.calendar.toLocaleString()} calendar entries. Scripts and carousels stay in Content.`, count: counts.calendar },
  ];

  const done = () => {
    setOpen(null);
    router.refresh();
  };

  return (
    <div className="rounded-[28px] border border-red-700/30 p-2">
      {rows.map((r) => (
        <div key={r.key} className="flex flex-col gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="text-sm font-medium">{r.title}</div>
            <div className="text-sm text-muted">{r.detail}</div>
          </div>
          <button
            disabled={r.count === 0}
            onClick={() => { setIncludeRefs(false); setOpen(r.key); }}
            className="rounded-full border border-red-700/50 px-4 py-2 text-sm text-red-700 hover:bg-red-700/5 disabled:opacity-40"
          >
            {r.title}
          </button>
        </div>
      ))}

      {open === "scripts" && (
        <DeleteDialog
          title="Delete all scripts?"
          description="Removes every script, its versions and its calendar entries. Posts you logged in the performance log are kept."
          count={scriptCount}
          backupUrl="/api/export/backup?what=scripts"
          onConfirm={async (typed) => { const r = await deleteAllScriptsAction({ confirmCount: typed, includeReferences: includeRefs }); if (r.ok) done(); return r; }}
          onClose={() => setOpen(null)}
        >
          {counts.referenceScripts > 0 && (
            <label className="mt-4 flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={includeRefs} onChange={(e) => setIncludeRefs(e.target.checked)} />
              Also delete the {counts.referenceScripts} reference {counts.referenceScripts === 1 ? "script" : "scripts"}
            </label>
          )}
        </DeleteDialog>
      )}
      {open === "carousels" && (
        <DeleteDialog
          title="Delete all carousels?"
          description="Removes every carousel, its slides and its calendar entries."
          count={counts.carousels}
          backupUrl="/api/export/backup?what=carousels"
          onConfirm={async (typed) => { const r = await deleteAllCarouselsAction({ confirmCount: typed }); if (r.ok) done(); return r; }}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "calendar" && (
        <DeleteDialog
          title="Clear the calendar?"
          description="Removes every calendar entry. Your scripts and carousels stay in Content."
          count={counts.calendar}
          backupUrl="/api/export/backup?what=calendar"
          onConfirm={async (typed) => { const r = await clearCalendarAction({ confirmCount: typed }); if (r.ok) done(); return r; }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
