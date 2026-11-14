import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { ensureV2Seed } from "@/lib/v2";
import type { Beat } from "@/lib/script-format";
import type { Fact } from "@/lib/checks";
import type { Lesson, Rule, PlaybookCard, ReferenceScript } from "@/lib/studio-prompts";
import StudioClient, { type StudioInitial, type BriefOption } from "./StudioClient";

export const dynamic = "force-dynamic";

type ScriptRow = {
  id: number; title: string; duration_s: number | null; type: string | null; funnel_stage: string; template: string; one_idea: string;
  hook_text: string; hook_formula: string; beats: Beat[] | null; checks: { meta?: Record<string, unknown> } | null; brief_id: number | null;
  body_black: string; body_red: string; body_green: string; parent_id: number | null; variant_kind: string;
};

// Old scripts have no beats: one beat per spoken line, with the old
// filming / on-screen notes on the first beat.
function beatsFrom(s: ScriptRow): Beat[] {
  if (Array.isArray(s.beats) && s.beats.length) return s.beats;
  const lines = (s.body_black ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((say, i) => ({
    beat: i === 0 ? "Hook" : `Beat ${i + 1}`, say, board: i === 0 ? s.body_red ?? "" : "", screen: i === 0 ? s.body_green ?? "" : "",
    drawing: false, locked: false, fact_ids: [],
  }));
}

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const userId = await requireUserId();
  await ensureV2Seed(userId);
  const sp = await searchParams;
  const id = Number(sp.id) || null;
  const carouselId = Number(sp.carousel) || null;
  const ideaId = Number(sp.idea) || null;
  const fromScript = Number(sp.fromScript) || null;

  const [rules, lessons, cards, refs, briefs, titles] = await Promise.all([
    sql<Rule[]>`SELECT id, text, category, active FROM rules WHERE user_id = ${userId} ORDER BY position, id`,
    sql<Lesson[]>`SELECT id, text, scope, applies_to, status, created_at::text FROM lessons WHERE user_id = ${userId} AND status <> 'retired' ORDER BY created_at DESC`,
    sql<PlaybookCard[]>`SELECT key, title, body, steps FROM playbook_cards WHERE user_id = ${userId} AND use_in_prompts ORDER BY position, id`,
    sql<{ id: number; title: string; duration_s: number | null; type: string | null; body_black: string }[]>`
      SELECT id, title, duration_s, type, body_black FROM scripts WHERE user_id = ${userId} AND is_reference ORDER BY id`,
    sql<{ id: number; question: string; facts: Fact[]; do_not_say: string }[]>`SELECT id, question, facts, do_not_say FROM briefs WHERE user_id = ${userId} ORDER BY created_at DESC`,
    sql<{ title: string; id: number; kind: string }[]>`
      SELECT title, id, 's' AS kind FROM scripts WHERE user_id = ${userId} UNION ALL SELECT title, id, 'c' AS kind FROM carousels WHERE user_id = ${userId}`,
  ]);

  const references: ReferenceScript[] = refs.map((r) => ({ id: r.id, title: r.title, duration: r.duration_s ?? 20, type: r.type ?? "", text: r.body_black }));
  const briefOptions: BriefOption[] = briefs.map((b) => ({ id: b.id, question: b.question, facts: b.facts ?? [], doNotSay: b.do_not_say }));

  let initial: StudioInitial = { format: sp.format === "carousel" ? "carousel" : "reel", mode: sp.mode === "paste" ? "paste" : "new" };

  if (id) {
    const [s] = await sql<ScriptRow[]>`
      SELECT id, title, duration_s, type, funnel_stage, template, one_idea, hook_text, hook_formula, beats, checks, brief_id,
        body_black, body_red, body_green, parent_id, variant_kind
      FROM scripts WHERE id = ${id} AND user_id = ${userId}`;
    if (s) {
      const meta = (s.checks?.meta ?? {}) as Record<string, unknown>;
      initial = {
        format: "reel",
        mode: sp.mode === "improve" ? "improve" : sp.mode === "resize" ? "resize" : "new",
        script: {
          id: s.id, title: s.title, duration: s.duration_s ?? 20, type: s.type ?? "whiteboard", funnel: s.funnel_stage || "tofu",
          template: s.template, idea: s.one_idea, hook: s.hook_text, hookFormula: s.hook_formula, beats: beatsFrom(s), briefId: s.brief_id,
          parentId: s.parent_id, variantKind: s.variant_kind,
          angle: String(meta.angle ?? ""), hookFollow: String(meta.hookFollow ?? ""), skeleton: String(meta.skeleton ?? ""),
          delivery: String(meta.delivery ?? ""), ticks: (meta.ticks as Record<string, boolean>) ?? {},
        },
      };
    }
  } else if (carouselId) {
    const [c] = await sql<{ id: number; title: string; type: string | null; funnel_stage: string; archetype: string; parent_script_id: number | null }[]>`
      SELECT id, title, type, funnel_stage, archetype, parent_script_id FROM carousels WHERE id = ${carouselId} AND user_id = ${userId}`;
    if (c) {
      const slides = await sql<{ slide_role: string; headline: string; supporting_text: string }[]>`
        SELECT slide_role, headline, supporting_text FROM carousel_slides WHERE carousel_id = ${c.id} AND user_id = ${userId} ORDER BY slide_number`;
      initial = {
        format: "carousel", mode: "new",
        carousel: { id: c.id, title: c.title, type: c.type ?? "whiteboard", funnel: c.funnel_stage, archetype: c.archetype, parentScriptId: c.parent_script_id,
          slides: slides.map((x) => ({ role: x.slide_role, headline: x.headline, supportingText: x.supporting_text })) },
      };
    }
  } else if (fromScript) {
    // "Make a carousel from this Reel": start from the script's idea and hook.
    const [s] = await sql<{ id: number; title: string; type: string | null; funnel_stage: string; one_idea: string; hook_text: string; body_black: string }[]>`
      SELECT id, title, type, funnel_stage, one_idea, hook_text, body_black FROM scripts WHERE id = ${fromScript} AND user_id = ${userId}`;
    if (s) {
      initial = {
        format: "carousel", mode: "new",
        carousel: { id: null, title: `${s.title} (cheat sheet)`, type: s.type ?? "whiteboard", funnel: s.funnel_stage || "tofu", archetype: "single_concept",
          parentScriptId: s.id, slides: [], idea: s.one_idea || s.body_black.split("\n").slice(-1)[0] || "", hook: s.hook_text || s.title },
      };
    }
  } else if (ideaId) {
    const [i] = await sql<{ id: number; text: string; suggested_type: string; brief_id: number | null }[]>`
      SELECT id, text, suggested_type, brief_id FROM ideas WHERE id = ${ideaId} AND user_id = ${userId}`;
    if (i) {
      const st = i.suggested_type.toLowerCase();
      const type = st.startsWith("history") ? "history" : st.startsWith("authority") ? "authority" : st.startsWith("build") ? "build" : "whiteboard";
      initial = { format: "reel", mode: "new", fromIdea: { id: i.id, text: i.text, type, briefId: i.brief_id } };
    }
  }

  return (
    <StudioClient
      initial={initial}
      rules={rules}
      lessons={lessons}
      cards={cards}
      references={references}
      briefs={briefOptions}
      existing={titles.filter((t) => !(t.kind === "s" && t.id === id) && !(t.kind === "c" && t.id === carouselId)).map((t) => t.title)}
    />
  );
}
