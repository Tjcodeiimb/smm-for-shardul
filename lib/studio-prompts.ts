// Studio prompt assembly (v2 brief, section 10.2). Every prompt is built from
// the same blocks, in this order, and is always shown to the user:
//   1 Task  2 Hard constraints  3 The brief  4 Facts  5 Rules, then lessons
//   6 Playbook cards for this step  7 Reference scripts  8 Output template
// Client-safe: no database access.

import { budgetFor, beatTemplate, DURATION_PLAN, FUNNEL_ENDING, PRODUCTION_STYLE, durationLabel, typeLabel, funnelLabel } from "./taxonomy";
import { serializeScript, type Beat } from "./script-format";
import type { Fact } from "./checks";

export type StudioStep = "angle" | "hook" | "skeleton" | "script" | "delivery" | "slides" | "brief";

export type Lesson = { id: number; text: string; scope: string; applies_to: { all?: boolean; duration?: number[]; type?: string[]; funnel?: string[] }; status: string; created_at: string };
export type Rule = { id: number; text: string; category: string; active: boolean };
export type PlaybookCard = { key: string; title: string; body: string; steps: string[] };
export type ReferenceScript = { id: number; title: string; duration: number; type: string; text: string };

export type PromptContext = {
  format: "reel" | "carousel";
  duration: number;
  type: string;
  funnel: string;
  template: string;
  idea: string;
  angle: string;
  hook: string;
  hookFollow: string;
  skeleton: string;
  title: string;
  beats: Beat[];
  facts: Fact[];
  doNotSay: string;
  rules: Rule[];
  lessons: Lesson[];
  cards: PlaybookCard[];
  references: ReferenceScript[];
  archetype?: string;
};

export const HARD_CONSTRAINTS = [
  "Use only facts from the attached brief that are marked Verified. Never invent a number, study, quote, date or client result. Where a fact is missing, write `[FACT NEEDED: what]`.",
  "Stay within the word budget.",
  "Use only visuals his setup can make: his face, the whiteboard, a hand-drawn overlay, a full-screen text card, a caption, a sound.",
  "One idea. The hook is 8 words or fewer, and the body pays off exactly what the hook promises.",
  "Return locked lines unchanged, and follow Shardul's rules and lessons over anything else in this prompt.",
];

export const FINAL_MARKER = "=== FINAL SCRIPT ===";

// Lessons that apply to this brief bar: not retired, and "applies to" all or
// matching. Past about 15, keep the confirmed ones and the most recent.
export function applicableLessons(lessons: Lesson[], ctx: { duration: number; type: string; funnel: string }) {
  const fits = lessons.filter((l) => {
    if (l.status === "retired") return false;
    const a = l.applies_to ?? {};
    if (a.all || (!a.duration?.length && !a.type?.length && !a.funnel?.length)) return true;
    return (!a.duration?.length || a.duration.includes(ctx.duration)) && (!a.type?.length || a.type.includes(ctx.type)) && (!a.funnel?.length || a.funnel.includes(ctx.funnel));
  });
  if (fits.length <= 15) return fits;
  const confirmed = fits.filter((l) => l.status === "confirmed");
  const recent = fits.filter((l) => l.status !== "confirmed").sort((x, y) => y.created_at.localeCompare(x.created_at));
  return [...confirmed, ...recent].slice(0, 15);
}

export function nearestReferences(refs: ReferenceScript[], ctx: { duration: number; type: string }, n = 2) {
  return [...refs]
    .sort((a, b) => Number(b.type === ctx.type) - Number(a.type === ctx.type) || Math.abs(a.duration - ctx.duration) - Math.abs(b.duration - ctx.duration))
    .slice(0, n);
}

function briefBlock(ctx: PromptContext) {
  const lines = [`Format: ${ctx.format === "carousel" ? "Carousel" : "Reel"}`];
  if (ctx.format === "reel") {
    const b = budgetFor(ctx.duration);
    const plan = DURATION_PLAN[ctx.duration];
    lines.push(`Duration: ${durationLabel(ctx.duration)}. Word budget: ${b.min} to ${b.max} spoken words (2.5 words per second, 2.3 while drawing).`);
    if (plan) lines.push(`Beats: ${plan.beats}. Board images: ${plan.boardImages}. Re-hooks: ${plan.rehooks}. Planned silences: ${plan.silences}.`);
    lines.push("Beat template:", ...beatTemplate(ctx.duration).map((t, i) => `  ${i + 1}. ${t.beat} (${t.share}): ${t.job}`));
  }
  lines.push(`Type: ${typeLabel(ctx.type)}${ctx.template ? `, template "${ctx.template}"` : ""}. Production style: ${PRODUCTION_STYLE[ctx.type] ?? "—"}.`);
  lines.push(`Funnel: ${funnelLabel(ctx.funnel)}. Ending rule: ${FUNNEL_ENDING[ctx.funnel] ?? ""}`);
  lines.push("Storytelling applies to every script: at least three story atoms (a person, a date, a place, an object, a number pair, a misconception, a cost); join beats with \"but\" or \"so\", never \"and then\"; bring the opening image back at the end.");
  if (ctx.idea) lines.push(`Idea (one sentence): ${ctx.idea}`);
  if (ctx.angle) lines.push(`Chosen angle: ${ctx.angle}`);
  if (ctx.hook) lines.push(`Hook: ${ctx.hook}${ctx.hookFollow ? `\nLine that follows the hook: ${ctx.hookFollow}` : ""}`);
  if (ctx.archetype) lines.push(`Carousel archetype: ${ctx.archetype}`);
  return lines.join("\n");
}

function factsBlock(ctx: PromptContext) {
  const v = ctx.facts.filter((f) => f.status === "verified");
  const out = v.length
    ? v.map((f, i) => `${i + 1}. ${f.text}${f.number ? ` (${f.number})` : ""}. On screen: ${f.citation || "—"}${f.sample ? `. Sample and design: ${f.sample}` : ""}${f.replication ? `. Replication: ${f.replication}` : ""}${f.caveat ? `. Caveat: ${f.caveat}` : ""}`)
    : ["No Verified facts attached. Do not state any number, study, quote or date as fact; write [FACT NEEDED: what] instead."];
  if (ctx.doNotSay.trim()) out.push(`Do not say: ${ctx.doNotSay.trim()}`);
  return out.join("\n");
}

function rulesBlock(ctx: PromptContext) {
  const rules = ctx.rules.filter((r) => r.active);
  const lessons = applicableLessons(ctx.lessons, ctx);
  const out = ["These come from Shardul's own feedback and results. They override the general guidance below."];
  out.push("Rules:", ...(rules.length ? rules.map((r) => `- ${r.text}`) : ["- (none)"]));
  out.push("Lessons from posted pieces:", ...(lessons.length ? lessons.map((l) => `- ${l.text} [${l.scope}; ${l.status}]`) : ["- (none yet)"]));
  return out.join("\n");
}

function cardsBlock(ctx: PromptContext, step: string) {
  const cards = ctx.cards.filter((c) => c.steps.includes(step));
  return cards.length ? cards.map((c) => `### ${c.title}\n${c.body}`).join("\n\n") : "(none for this step)";
}

function refsBlock(ctx: PromptContext) {
  const refs = nearestReferences(ctx.references, ctx);
  return refs.length ? refs.map((r) => `### ${r.title} (${durationLabel(r.duration)}, ${typeLabel(r.type)})\n${r.text}`).join("\n\n") : "(none)";
}

function assemble(task: string, ctx: PromptContext, step: string, output: string) {
  return [
    `# 1. Task\n${task}`,
    `# 2. Hard constraints (non-negotiable)\n${HARD_CONSTRAINTS.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
    `# 3. The brief\n${briefBlock(ctx)}`,
    `# 4. Facts\n${factsBlock(ctx)}`,
    `# 5. Shardul's rules, then his lessons\n${rulesBlock(ctx)}`,
    `# 6. Playbook\n${cardsBlock(ctx, step)}`,
    `# 7. Reference scripts (worked examples of the voice and structure; never copy their wording)\n${refsBlock(ctx)}`,
    `# 8. Output\n${output}`,
  ].join("\n\n");
}

const SCRIPT_FORMAT = `Write each beat as:
[Beat name]
SAY: what Shardul says
BOARD: what his hands and the whiteboard do (use the cues in the notation card, e.g. [WB: ...])
SCREEN: what the edit adds on screen and in sound (e.g. [CARD: ...], [SRC: ...])
Start with a line "TITLE: ..." (the hook works as the title).`;

const SCAFFOLD = `Work in four phases and show all of them:
<retention_plan> The hook mechanism, the open question and where it closes, the turn's position, the pacing risks, the payoff. </retention_plan>
<draft_v1> The first draft. </draft_v1>
<self_critique> Switch roles: you are a ruthless editor reviewing a stranger's draft. Check every hard constraint, the word budget, the story rules and the ending rule. List what fails. </self_critique>
Then write the line ${FINAL_MARKER} and, after it, only the final script.`;

export function buildStepPrompt(step: StudioStep, ctx: PromptContext) {
  switch (step) {
    case "angle":
      return assemble(
        "Generate seven angles for the idea, each one or two sentences with its lens named: at least two from thinkers who shaped Shardul, two from other fields, one from his own life, one redefinition, one contrarian. First name the universal pain or desire under the idea. Mark the strongest two by relatable, novel and simple. Say plainly when an angle is weak.",
        ctx, "angle",
        "Line 1: the universal pain or desire. Then a numbered list of seven angles, each formatted `N. [lens] angle`. End with `Strongest: N, N` and one line on why.");
    case "hook":
      return assemble(
        "Generate five hooks for this script, each from a different formula in the hook bank, each with the line that follows it. Score each on the five-point pick test (0 to 2 per point; a hook needs 7 of 10). Reject anything with a banned phrase.",
        ctx, "hook",
        "A numbered list. For each: `N. Formula name | Hook (8 words or fewer) | Line that follows | Score x/10 with one-line reason`. Put the recommended hook first.");
    case "skeleton":
      return assemble(
        "Write the skeleton: the beats from the beat template with a time budget for each, as one causal paragraph per beat. Every sentence starts with But, So, Because, Which means, or a date.",
        ctx, "skeleton",
        "One line per beat: `Beat name (seconds): causal sentence(s)`. Then the planned silences.");
    case "script":
      return assemble(
        `Write the full script in beats, with the three layers per beat, inside the word budget. Keep any locked lines exactly as given.${ctx.skeleton ? `\nSkeleton to follow:\n${ctx.skeleton}` : ""}${ctx.beats.some((b) => b.locked) ? `\nLocked lines (return unchanged, in place):\n${ctx.beats.filter((b) => b.locked).map((b) => `- ${b.say}`).join("\n")}` : ""}`,
        ctx, "script", `${SCAFFOLD}\n\n${SCRIPT_FORMAT}`);
    case "delivery":
      return assemble(
        "Mark the script for delivery using the notation card's delivery marks. Words and facts must not change. If more than a third of a line is marked, remove marks. Then give the teleprompter text (the marked SAY lines only).",
        { ...ctx, facts: [] }, "delivery",
        `Return the marked script in the same beat format, then a line "=== TELEPROMPTER ===" and the teleprompter text.\n\nScript:\n${serializeScript(ctx.beats, ctx.title)}`);
    case "slides":
      return assemble(
        "Write the carousel slides: a hook slide, body slides with one idea each, and one call-to-action slide, following the carousel card and the archetype.",
        ctx, "carousel",
        "One slide per line: `role | headline | supporting text`, where role is hook, body or cta. 6 to 10 slides.");
    case "brief":
      return assemble(
        "Draft a research brief for the idea: the question as one testable question, the honest one-line answer, 5 to 8 facts, 2 story anchors, 1 twist and a do-not-say list. Everything you return starts as Unverified: Shardul will open each source himself. An AI answer is never a source.",
        ctx, "idea",
        "Question: ...\nAnswer: ... (20 words or fewer)\nFacts: one per line as `fact | number | Author, Year, Journal | sample and design | replication status | caveat | link`\nAnchors: two lines, `dated scene | source`\nTwist: ...\nDo not say: ...");
  }
}

export function buildLinePrompt(kind: "options", ctx: PromptContext, lineIndex: number) {
  const line = ctx.beats[lineIndex];
  return assemble(
    `Give five or six alternatives for this one line of Shardul's script, the recommended one first, each with a one-line reason. Do not touch any other line.\nThe line (beat "${line?.beat}"): ${line?.say}`,
    ctx, "script",
    `Numbered list: \`N. alternative — reason\`.\n\nWhole script for context:\n${serializeScript(ctx.beats, ctx.title)}`);
}

export function buildScriptToolPrompt(kind: "correct" | "tighten" | "improve" | "resize", ctx: PromptContext, extra?: { fromDuration?: number }) {
  const script = serializeScript(ctx.beats, ctx.title);
  const tasks = {
    correct: "Correct only: fix facts and grammar across the script and change nothing else. Never change a line marked (LOCKED).",
    tighten: "Tighten: cut words to reach the word budget without changing meaning or facts. Never change a line marked (LOCKED).",
    improve: "Improve: first diagnose every weakness with a severity (high, medium, low) and name the lines that are already strong (protect them). Then fix in order of severity, changing only what the diagnosis names. Never change a line marked (LOCKED).",
    resize: `Resize: write the same idea at ${durationLabel(ctx.duration)}${extra?.fromDuration ? ` (the original runs ${durationLabel(extra.fromDuration)})` : ""}. Remove whole beats in this order (the second proof goes first) and narrow the idea; never squeeze the same content into fewer words. Keep the hook's question and the landing that answers it.`,
  };
  return assemble(tasks[kind], ctx, "script",
    `${kind === "correct" || kind === "improve" ? "First list every change with its reason, one per line starting with `- `." : "First one line on what you cut."} Then write ${FINAL_MARKER} and the full script after it.\n\n${SCRIPT_FORMAT}\n\nThe script:\n${script}`);
}

// Everything after the FINAL marker (or the whole text if the model skipped it).
export function extractFinal(text: string) {
  const i = text.lastIndexOf(FINAL_MARKER);
  return i >= 0 ? text.slice(i + FINAL_MARKER.length).trim() : text.trim();
}

export function parseOptions(text: string) {
  return text.split("\n").map((l) => l.match(/^\s*\d+[.)]\s*(.+?)(?:\s+[—–-]\s+(.+))?$/)).filter(Boolean).map((m) => ({ text: m![1].replace(/^["“]|["”]$/g, "").trim(), reason: m![2]?.trim() ?? "" }));
}

// Section 5.7: one block holding everything a Claude chat needs.
export function buildClaudeBrief(ctx: PromptContext) {
  return assemble(
    "Help Shardul write this piece. Follow the brief, the facts, his rules and lessons, and the playbook below.",
    ctx, "script", `${SCRIPT_FORMAT}${ctx.beats.length ? `\n\nCurrent draft:\n${serializeScript(ctx.beats, ctx.title)}` : ""}`);
}
