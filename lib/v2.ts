import { sql, ensureSchema } from "./db";
import { PLAYBOOK_CARDS, SEED_RULES, SEED_LESSON, SEED_IDEAS, REFERENCE_SCRIPTS } from "./v2-seed-data";

import { countWords } from "./taxonomy";

export * from "./taxonomy";

// ---------- Per-user v2 starting content ----------
//
// Seeded once per user, guarded by a brand_config marker, so deleting any of
// it never brings it back. Mirrors Appendix A/B of the v2 brief.
const V2_SEED_KEY = "v2_seed_v1";

export async function ensureV2Seed(userId: number) {
  await ensureSchema();
  const [marker] = await sql<{ key: string }[]>`SELECT key FROM brand_config WHERE key = ${V2_SEED_KEY} AND user_id = ${userId}`;
  if (marker) return;
  // Claim the marker first; if a concurrent request already did, stop.
  const claimed = await sql`
    INSERT INTO brand_config (key, value, user_id) VALUES (${V2_SEED_KEY}, ${JSON.stringify({ seededAt: new Date().toISOString() })}, ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO NOTHING
    RETURNING key
  `;
  if (claimed.length === 0) return;

  for (const [i, c] of PLAYBOOK_CARDS.entries()) {
    await sql`INSERT INTO playbook_cards (key, title, body, grp, steps, position, user_id)
      VALUES (${c.key}, ${c.title}, ${c.body}, ${c.grp}, ${sql.json(c.steps as never)}, ${i}, ${userId})`;
  }
  await sql`INSERT INTO rules ${sql(
    SEED_RULES.map((r, i) => ({ text: r.text, category: r.category, position: i, user_id: userId })),
    "text", "category", "position", "user_id"
  )}`;
  await sql`
    INSERT INTO lessons (text, scope, applies_to, evidence, status, user_id)
    VALUES (${SEED_LESSON.text}, ${SEED_LESSON.scope}, ${sql.json({ all: true } as never)}, ${SEED_LESSON.evidence}, ${SEED_LESSON.status}, ${userId})
  `;
  await sql`INSERT INTO ideas ${sql(
    SEED_IDEAS.map((x) => ({ text: x.text, suggested_type: x.suggestedType, board: "favourite", status: "new", user_id: userId })),
    "text", "suggested_type", "board", "status", "user_id"
  )}`;

  for (const r of REFERENCE_SCRIPTS) {
    const say = r.say.join("\n");
    const words = countWords(say);
    const beats = r.say.map((line, i) => ({ beat: i === 0 ? "hook" : `line ${i + 1}`, say: line, board: "", screen: "", drawing: false, locked: true, fact_ids: [] }));
    const notes = [
      r.board && `Board: ${r.board}`,
      r.sources && `Sources:\n${r.sources}`,
      r.doNotSay && `Do not say: ${r.doNotSay}`,
      r.why && `Why it is a reference: ${r.why}`,
    ].filter(Boolean).join("\n\n");
    await sql`
      INSERT INTO scripts (
        title, pillar, content_type, format, body_black, body_red, body_green, cta_type, funnel_stage, status,
        duration_s, type, template, hook_text, word_count, est_seconds, beats, is_reference, source, user_id
      ) VALUES (
        ${r.title}, 'authority', 'storytelling', 'Reel', ${say}, ${r.board ? `Board: ${r.board}` : ""}, ${notes}, 'none', ${r.funnel}, 'ready',
        ${r.duration}, ${r.type}, ${r.template}, ${r.say[0]}, ${words}, ${Math.round(words / 2.5)}, ${sql.json(beats as never)}, TRUE, 'reference', ${userId}
      )
    `;
  }
}

// Counts for Settings > Danger zone and the Content starter banner. Lives
// here (not in content-actions.ts) because every export of a "use server"
// file is callable from the browser, and this takes a user id.
export type DangerCounts = { scripts: number; referenceScripts: number; carousels: number; calendar: number; seedScripts: number; seedCarousels: number };

export async function getDangerCounts(userId: number): Promise<DangerCounts> {
  await ensureSchema();
  const [r] = await sql<DangerCounts[]>`
    SELECT
      (SELECT count(*)::int FROM scripts WHERE user_id = ${userId} AND NOT is_reference) AS "scripts",
      (SELECT count(*)::int FROM scripts WHERE user_id = ${userId} AND is_reference) AS "referenceScripts",
      (SELECT count(*)::int FROM carousels WHERE user_id = ${userId}) AS "carousels",
      (SELECT count(*)::int FROM calendar_items WHERE user_id = ${userId}) AS "calendar",
      (SELECT count(*)::int FROM scripts WHERE user_id = ${userId} AND source = 'seed') AS "seedScripts",
      (SELECT count(*)::int FROM carousels WHERE user_id = ${userId} AND source = 'seed') AS "seedCarousels"
  `;
  return r;
}

