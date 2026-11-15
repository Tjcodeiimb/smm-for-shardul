"use client";

// Shown instead of Next's generic "This page couldn't load" so a failure can
// be diagnosed: the digest matches the server log, and /api/health names the
// failing step with Postgres's own message.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="font-heading text-3xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">This page hit a server error.{error.digest ? ` Reference: ${error.digest}.` : ""}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={reset} className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-deep">Try again</button>
        <a href="/api/health" target="_blank" rel="noreferrer" className="rounded-full border px-5 py-2 text-sm">Run diagnostics</a>
      </div>
      <p className="mt-4 text-xs text-muted">Diagnostics shows which step fails. Copy what it shows and send it to Claude.</p>
    </div>
  );
}
