"use client";

import { useState } from "react";

const btn = "rounded-full border px-3.5 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-40";
const primary = "rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep disabled:opacity-40";
const field = "w-full border bg-surface px-3 py-2 text-sm";

export async function generate(prompt: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    const data = await res.json();
    if (data.text) return { ok: true, text: data.text };
    return { ok: false, message: data.error === "no_key" || data.error === "no_api_key" || /key/i.test(data.message ?? "") ? "No AI provider is connected. Use Copy prompt, then paste the answer below." : data.message || "Generation failed." };
  } catch {
    return { ok: false, message: "Generation failed. Use Copy prompt instead." };
  }
}

// One generated step: Show prompt, Generate, Copy prompt, and a box where
// the answer lands (or where you paste an answer from any chatbot).
export default function PromptBar({ prompt, onResult, label = "Generate", applyLabel = "Use this answer" }: { prompt: string; onResult: (text: string) => void; label?: string; applyLabel?: string }) {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button className={btn} onClick={() => setShow((s) => !s)}>{show ? "Hide prompt" : "Show prompt"}</button>
        <button
          className={primary}
          disabled={busy}
          onClick={async () => {
            setBusy(true); setMsg("");
            const r = await generate(prompt);
            setBusy(false);
            if (r.ok) onResult(r.text); else setMsg(r.message);
          }}
        >
          {busy ? "Generating…" : label}
        </button>
        <button className={btn} onClick={async () => { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-red-700">{msg}</p>}
      {show && <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-[14px] bg-surface p-4 text-xs">{prompt}</pre>}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted">Paste an answer from a chat</summary>
        <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={4} className={`${field} mt-2 font-mono text-xs`} aria-label="Pasted answer" />
        <button className={`${btn} mt-2`} disabled={!pasted.trim()} onClick={() => { onResult(pasted); setPasted(""); }}>{applyLabel}</button>
      </details>
    </div>
  );
}

