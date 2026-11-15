import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Diagnostics for a signed-in user: runs the migration, the v2 seed and the
// queries behind each main page one by one, and reports which step fails and
// Postgres's own message. Opened from the app's error screen.
export async function GET() {
  const userId = verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (userId === null) return NextResponse.json({ error: "Sign in first, then open /api/health again." }, { status: 401 });

  const steps: { step: string; ok: boolean; ms: number; error?: string; code?: string }[] = [];
  const run = async (step: string, fn: () => Promise<unknown>) => {
    const t = Date.now();
    try {
      await fn();
      steps.push({ step, ok: true, ms: Date.now() - t });
    } catch (e) {
      const err = e as { message?: string; code?: string };
      steps.push({ step, ok: false, ms: Date.now() - t, error: err?.message ?? String(e), code: err?.code });
    }
  };

  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
    ENCRYPTION_KEY: Boolean(process.env.ENCRYPTION_KEY),
    node: process.version,
  };

  const { sql, ensureSchema } = await import("@/lib/db");
  await run("connect", () => sql`SELECT 1`);
  await run("postgres version", async () => { const [r] = await sql<{ v: string }[]>`SELECT current_setting('server_version') AS v`; env.node += ` · postgres ${r.v}`; });
  await run("migration", () => ensureSchema());
  const v2 = await import("@/lib/v2");
  await run("starter content seed", () => v2.ensureV2Seed(userId));
  await run("home", () => sql`SELECT (SELECT count(*) FROM ideas WHERE user_id = ${userId}), (SELECT count(*) FROM scripts WHERE user_id = ${userId} AND source <> 'seed' AND NOT is_reference)`);
  await run("content", () => sql`SELECT id, duration_s, type, is_reference, source, checks FROM scripts WHERE user_id = ${userId} LIMIT 5`);
  await run("content counts", () => v2.getDangerCounts(userId));
  await run("calendar", () => sql`SELECT c.date, s.type, s.duration_s FROM calendar_items c LEFT JOIN scripts s ON s.id = c.script_id WHERE c.user_id = ${userId} LIMIT 5`);
  await run("settings", () => v2.getV2Settings(userId));
  await run("research", () => sql`SELECT id FROM ideas WHERE user_id = ${userId} LIMIT 1`);
  await run("playbook", () => sql`SELECT id, steps FROM playbook_cards WHERE user_id = ${userId} LIMIT 1`);
  await run("posts", () => sql`SELECT id, snapshots, log_notes FROM own_posts WHERE user_id = ${userId} LIMIT 1`);
  await run("ai settings", async () => (await import("@/lib/ai-providers")).getMaskedAiSettings(userId));
  await run("schema version", async () => { const [r] = await sql<{ value: string }[]>`SELECT value FROM app_meta WHERE key = 'schema_version'`; env.node += ` · schema ${r?.value}`; });

  return NextResponse.json({ ok: steps.every((s) => s.ok), env, steps }, { headers: { "Cache-Control": "no-store" } });
}
