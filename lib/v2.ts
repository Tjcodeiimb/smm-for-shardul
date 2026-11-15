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

  const cards = PLAYBOOK_CARDS.map((c, i) => ({ key: c.key, title: c.title, body: c.body, grp: c.grp, steps: c.steps, position: i }));
  const rules = SEED_RULES.map((r, i) => ({ text: r.text, category: r.category, position: i }));
  const ideas = SEED_IDEAS.map((x) => ({ text: x.text, suggested_type: x.suggestedType }));
  const refs = REFERENCE_SCRIPTS.map((r) => {
    const say = r.say.join("\n");
    const words = countWords(say);
    return {
      title: r.title, body_black: say, body_red: r.board ? `Board: ${r.board}` : "",
      body_green: [r.board && `Board: ${r.board}`, r.sources && `Sources:\n${r.sources}`, r.doNotSay && `Do not say: ${r.doNotSay}`, r.why && `Why it is a reference: ${r.why}`].filter(Boolean).join("\n\n"),
      funnel_stage: r.funnel, duration_s: r.duration, type: r.type, template: r.template, hook_text: r.say[0], word_count: words,
      est_seconds: Math.round(words / 2.5),
      beats: r.say.map((line, i) => ({ beat: i === 0 ? "hook" : `line ${i + 1}`, say: line, board: "", screen: "", drawing: false, locked: true, fact_ids: [] })),
    };
  });

  // One transaction, marker included: either everything is seeded or nothing
  // is (and the next request tries again). Five statements, not ~25 round trips.
  await sql.begin(async (txRaw) => {
    const tx = txRaw as unknown as typeof sql;
    const claimed = await tx`
      INSERT INTO brand_config (key, value, user_id) VALUES (${V2_SEED_KEY}, ${JSON.stringify({ seededAt: new Date().toISOString() })}, ${userId})
      ON CONFLICT (COALESCE(user_id, 0), key) DO NOTHING
      RETURNING key`;
    if (claimed.length === 0) return; // a concurrent request is seeding (or did)
    await tx`INSERT INTO playbook_cards (key, title, body, grp, steps, position, user_id)
      SELECT key, title, body, grp, steps, position, ${userId}
      FROM jsonb_to_recordset(${tx.json(cards as never)}) AS x(key text, title text, body text, grp text, steps jsonb, position int)`;
    await tx`INSERT INTO rules (text, category, position, user_id)
      SELECT text, category, position, ${userId} FROM jsonb_to_recordset(${tx.json(rules as never)}) AS x(text text, category text, position int)`;
    await tx`INSERT INTO lessons (text, scope, applies_to, evidence, status, user_id)
      VALUES (${SEED_LESSON.text}, ${SEED_LESSON.scope}, ${tx.json({ all: true } as never)}, ${SEED_LESSON.evidence}, ${SEED_LESSON.status}, ${userId})`;
    await tx`INSERT INTO ideas (text, suggested_type, board, status, user_id)
      SELECT text, suggested_type, 'favourite', 'new', ${userId} FROM jsonb_to_recordset(${tx.json(ideas as never)}) AS x(text text, suggested_type text)`;
    await tx`INSERT INTO scripts (title, pillar, content_type, format, body_black, body_red, body_green, cta_type, funnel_stage, status,
        duration_s, type, template, hook_text, word_count, est_seconds, beats, is_reference, source, user_id)
      SELECT title, 'authority', 'storytelling', 'Reel', body_black, body_red, body_green, 'none', funnel_stage, 'ready',
        duration_s, type, template, hook_text, word_count, est_seconds, beats, TRUE, 'reference', ${userId}
      FROM jsonb_to_recordset(${tx.json(refs as never)}) AS x(title text, body_black text, body_red text, body_green text, funnel_stage text,
        duration_s int, type text, template text, hook_text text, word_count int, est_seconds int, beats jsonb)`;
  });
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


// Cadence and earned durations (sections 7.1 and 9.2), stored per user.
export async function getV2Settings(userId: number): Promise<import("./posts").V2Settings> {
  const { DEFAULT_V2_SETTINGS } = await import("./posts");
  await ensureSchema();
  const [row] = await sql<{ value: string }[]>`SELECT value FROM brand_config WHERE key = 'v2_settings' AND user_id = ${userId}`;
  if (!row) return DEFAULT_V2_SETTINGS;
  try {
    return { ...DEFAULT_V2_SETTINGS, ...JSON.parse(row.value) };
  } catch {
    return DEFAULT_V2_SETTINGS;
  }
}
