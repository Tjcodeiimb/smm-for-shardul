"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";
import { countWords, DURATIONS, TYPES, FUNNELS } from "./taxonomy";
import { estimateSeconds } from "./taxonomy";
import type { Beat } from "./script-format";
import type { CheckResult, Fact } from "./checks";

// Studio saves (v2 brief, sections 5.3, 5.6, 6.3, 8.2). Every save of a
// script also writes a version snapshot.

export type StudioScriptInput = {
  id: number | null;
  title: string;
  duration: number;
  type: string;
  funnel: string;
  template: string;
  idea: string;
  angle: string;
  hook: string;
  hookFormula: string;
  hookFollow: string;
  skeleton: string;
  delivery: string;
  beats: Beat[];
  checks: CheckResult[];
  ticks: Record<string, boolean>;
  briefId: number | null;
  parentId: number | null;
  variantKind: string;
  ideaId: number | null;
  scheduleDate?: string;
};

const clamp = <T extends string | number>(v: T, allowed: readonly T[], fallback: T) => (allowed.includes(v) ? v : fallback);

export async function saveStudioScriptAction(input: StudioScriptInput): Promise<{ ok: true; id: number; version: number } | { ok: false; error: string }> {
  await ensureSchema();
  const userId = await requireUserId();
  const beats = (input.beats ?? []).map((b) => ({
    beat: String(b.beat ?? ""), say: String(b.say ?? ""), board: String(b.board ?? ""), screen: String(b.screen ?? ""),
    drawing: Boolean(b.drawing), locked: Boolean(b.locked), fact_ids: Array.isArray(b.fact_ids) ? b.fact_ids.map(String) : [],
  }));
  const say = beats.map((b) => b.say).filter(Boolean).join("\n");
  const words = countWords(say);
  const duration = clamp(Number(input.duration), DURATIONS.map((d) => d.value as number), 20);
  const type = clamp(input.type, TYPES.map((t) => t.value as string), "whiteboard");
  const funnel = clamp(input.funnel, FUNNELS.map((f) => f.value as string), "tofu");
  const title = input.title.trim() || beats[0]?.say.slice(0, 80) || "Untitled script";
  const board = beats.map((b) => b.board).filter(Boolean).join("\n");
  const screen = beats.map((b) => b.screen).filter(Boolean).join("\n");
  const meta = { angle: input.angle, hookFollow: input.hookFollow, skeleton: input.skeleton, delivery: input.delivery, ticks: input.ticks };
  const checks = { results: input.checks ?? [], meta };

  let id = input.id;
  if (id) {
    const res = await sql`
      UPDATE scripts SET title = ${title}, duration_s = ${duration}, type = ${type}, funnel_stage = ${funnel}, template = ${input.template},
        one_idea = ${input.idea}, hook_text = ${input.hook}, hook_formula = ${input.hookFormula}, word_count = ${words},
        est_seconds = ${Math.round(estimateSeconds(beats))}, beats = ${sql.json(beats as never)}, checks = ${sql.json(checks as never)},
        brief_id = ${input.briefId}, body_black = ${say}, body_red = ${board}, body_green = ${screen}, format = 'Reel', updated_at = now()
      WHERE id = ${id} AND user_id = ${userId}`;
    if (res.count === 0) return { ok: false, error: "That script no longer exists." };
  } else {
    const [row] = await sql<{ id: number }[]>`
      INSERT INTO scripts (title, duration_s, type, funnel_stage, template, one_idea, hook_text, hook_formula, word_count, est_seconds,
        beats, checks, brief_id, parent_id, variant_kind, body_black, body_red, body_green, format, cta_type, status, source, user_id)
      VALUES (${title}, ${duration}, ${type}, ${funnel}, ${input.template}, ${input.idea}, ${input.hook}, ${input.hookFormula}, ${words},
        ${Math.round(estimateSeconds(beats))}, ${sql.json(beats as never)}, ${sql.json(checks as never)}, ${input.briefId}, ${input.parentId},
        ${input.variantKind}, ${say}, ${board}, ${screen}, 'Reel', 'none', 'draft', 'studio', ${userId})
      RETURNING id`;
    id = row.id;
    if (input.ideaId) await sql`UPDATE ideas SET status = 'used' WHERE id = ${input.ideaId} AND user_id = ${userId}`;
  }

  const [{ v }] = await sql<{ v: number }[]>`SELECT COALESCE(MAX(version), 0) + 1 AS v FROM script_versions WHERE script_id = ${id}`;
  const snapshot = { ...input, id, title, duration, type, funnel, beats, checks: input.checks, savedAt: new Date().toISOString() };
  await sql`INSERT INTO script_versions (script_id, version, snapshot, user_id) VALUES (${id}, ${v}, ${sql.json(snapshot as never)}, ${userId})`;

  if (input.scheduleDate && /^\d{4}-\d{2}-\d{2}$/.test(input.scheduleDate)) {
    await sql`INSERT INTO calendar_items (date, topic, format, funnel_stage, status, script_id, user_id)
      VALUES (${input.scheduleDate}, ${title}, 'Reel', ${funnel}, 'scripted', ${id}, ${userId})`;
  }
  for (const p of ["/content", "/calendar", "/dashboard", "/studio"]) revalidatePath(p);
  return { ok: true, id: id!, version: v };
}

export type VersionRow = { version: number; created_at: string; snapshot: StudioScriptInput & { savedAt: string } };

export async function listVersionsAction(scriptId: number): Promise<VersionRow[]> {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = await sql<VersionRow[]>`
    SELECT version, created_at::text, snapshot FROM script_versions WHERE script_id = ${scriptId} AND user_id = ${userId} ORDER BY version DESC LIMIT 50`;
  return rows.map((r) => ({ version: r.version, created_at: r.created_at, snapshot: r.snapshot }));
}

export type StudioCarouselInput = {
  id: number | null;
  title: string;
  type: string;
  funnel: string;
  archetype: string;
  slides: { role: string; headline: string; supportingText: string }[];
  parentScriptId: number | null;
  scheduleDate?: string;
};

export async function saveStudioCarouselAction(input: StudioCarouselInput): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await ensureSchema();
  const userId = await requireUserId();
  const slides = (input.slides ?? []).filter((s) => s.headline.trim() || s.supportingText.trim());
  if (slides.length === 0) return { ok: false, error: "Add at least one slide." };
  const title = input.title.trim() || slides[0].headline.slice(0, 80) || "Untitled carousel";
  const type = clamp(input.type, TYPES.map((t) => t.value as string), "whiteboard");
  const funnel = clamp(input.funnel, FUNNELS.map((f) => f.value as string), "tofu");
  let id = input.id;
  if (id) {
    const res = await sql`UPDATE carousels SET title = ${title}, type = ${type}, funnel_stage = ${funnel}, archetype = ${input.archetype}, slide_count = ${slides.length}
      WHERE id = ${id} AND user_id = ${userId}`;
    if (res.count === 0) return { ok: false, error: "That carousel no longer exists." };
    await sql`DELETE FROM carousel_slides WHERE carousel_id = ${id} AND user_id = ${userId}`;
  } else {
    const [row] = await sql<{ id: number }[]>`
      INSERT INTO carousels (title, type, funnel_stage, archetype, slide_count, cta_type, background_style, design_notes, parent_script_id, source, user_id)
      VALUES (${title}, ${type}, ${funnel}, ${input.archetype}, ${slides.length}, 'save', 'solid',
        'Video identity: grained near-black page, yellow #FFD60A accent, plain bold type.', ${input.parentScriptId}, 'studio', ${userId})
      RETURNING id`;
    id = row.id;
  }
  await sql`INSERT INTO carousel_slides ${sql(
    slides.map((s, i) => ({ carousel_id: id, slide_number: i + 1, slide_role: ["hook", "body", "cta"].includes(s.role) ? s.role : "body", headline: s.headline, supporting_text: s.supportingText, user_id: userId })),
    "carousel_id", "slide_number", "slide_role", "headline", "supporting_text", "user_id"
  )}`;
  if (input.scheduleDate && /^\d{4}-\d{2}-\d{2}$/.test(input.scheduleDate)) {
    await sql`INSERT INTO calendar_items (date, topic, format, funnel_stage, status, carousel_id, user_id)
      VALUES (${input.scheduleDate}, ${title}, 'Carousel', ${funnel}, 'scripted', ${id}, ${userId})`;
  }
  for (const p of ["/content", "/calendar", "/dashboard"]) revalidatePath(p);
  return { ok: true, id: id! };
}

// ---------- Research briefs (section 8.2) ----------

export type BriefInput = {
  id: number | null;
  question: string;
  answer: string;
  facts: Fact[];
  anchors: { text: string; source: string }[];
  twist: string;
  doNotSay: string;
};

const FACT_STATUSES = ["verified", "known", "unverified"];

export async function saveBriefAction(input: BriefInput): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  await ensureSchema();
  const userId = await requireUserId();
  if (!input.question.trim()) return { ok: false, error: "A brief needs its question." };
  const facts = (input.facts ?? []).filter((f) => f.text.trim()).map((f, i) => ({
    id: f.id || `f${Date.now()}${i}`, text: f.text, number: f.number ?? "", citation: f.citation ?? "", sample: f.sample ?? "",
    replication: f.replication ?? "", caveat: f.caveat ?? "", link: f.link ?? "", checked: f.checked ?? "",
    status: FACT_STATUSES.includes(f.status) ? f.status : "unverified",
  }));
  const anchors = (input.anchors ?? []).filter((a) => a.text.trim()).slice(0, 2);
  const today = new Date().toISOString().slice(0, 10);
  let id = input.id;
  if (id) {
    await sql`UPDATE briefs SET question = ${input.question}, answer = ${input.answer}, facts = ${sql.json(facts as never)}, anchors = ${sql.json(anchors as never)},
      twist = ${input.twist}, do_not_say = ${input.doNotSay}, checked_on = ${today} WHERE id = ${id} AND user_id = ${userId}`;
  } else {
    const [row] = await sql<{ id: number }[]>`INSERT INTO briefs (question, answer, facts, anchors, twist, do_not_say, checked_on, user_id)
      VALUES (${input.question}, ${input.answer}, ${sql.json(facts as never)}, ${sql.json(anchors as never)}, ${input.twist}, ${input.doNotSay}, ${today}, ${userId}) RETURNING id`;
    id = row.id;
  }
  revalidatePath("/research/briefs");
  revalidatePath("/studio");
  return { ok: true, id: id! };
}

export async function deleteBriefAction(input: { id: number }) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE scripts SET brief_id = NULL WHERE brief_id = ${input.id} AND user_id = ${userId}`;
  await sql`DELETE FROM briefs WHERE id = ${input.id} AND user_id = ${userId}`;
  revalidatePath("/research/briefs");
}
