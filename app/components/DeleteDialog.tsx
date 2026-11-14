"use client";

import { useState } from "react";
import type { DeleteResult } from "@/lib/content-actions";

// Confirm step for every delete (v2 brief, section 6.3):
// - single item: a plain confirm
// - bulk (count > 1): a JSON backup download, ticked by default, and the count typed in
export default function DeleteDialog({
  title,
  description,
  count,
  backupUrl,
  onConfirm,
  onClose,
  children,
}: {
  title: string;
  description: string;
  count: number;
  backupUrl?: string;
  onConfirm: (typedCount: number) => Promise<DeleteResult>;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const bulk = count > 1;
  const [backup, setBackup] = useState(Boolean(backupUrl));
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = !bulk || Number(typed) === count;

  async function run() {
    setBusy(true);
    setError("");
    try {
      if (backup && backupUrl) {
        const res = await fetch(backupUrl);
        if (!res.ok) throw new Error("The backup could not be created, so nothing was deleted.");
        const blob = await res.blob();
        const name = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "upcreate-backup.json";
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
      }
      const result = await onConfirm(bulk ? Number(typed) : 1);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Nothing was deleted.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-md rounded-[28px] bg-surface p-6 shadow-xl">
        <h2 className="font-heading text-xl">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        {children}
        {backupUrl && (
          <label className="mt-5 flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={backup} onChange={(e) => setBackup(e.target.checked)} />
            Download a JSON backup first
          </label>
        )}
        {bulk && (
          <label className="mt-4 block text-sm">
            Type <span className="font-medium">{count}</span> to confirm
            <input
              inputMode="numeric"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1.5 w-full border bg-surface px-3 py-2 text-sm"
              autoFocus
            />
          </label>
        )}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm hover:bg-foreground/5" disabled={busy}>
            Cancel
          </button>
          <button
            onClick={run}
            disabled={!ready || busy}
            className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "Deleting…" : bulk ? `Delete ${count}` : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
