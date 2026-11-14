"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DURATIONS, TYPES, FUNNELS, TEMPLATES_BY_TYPE, PRODUCTION_STYLE, FUNNEL_ENDING, beatTemplate, budgetFor, budgetStatus,
  countWords, estimateSeconds, durationLabel, WPS,
} from "@/lib/taxonomy";
import { parseScript, classifyScript, enforceLocks, emptyBeat, spokenWords, serializeScript, type Beat } from "@/lib/script-format";
import { runChecks, LECTURE_TEST, HOOK_PICK_TEST, type Fact } from "@/lib/checks";
import {
  buildStepPrompt, buildLinePrompt, buildScriptToolPrompt, buildClaudeBrief, extractFinal, parseOptions,
  type Lesson, type Rule, type PlaybookCard, type ReferenceScript, type PromptContext,
} from "@/lib/studio-prompts";
import PromptBar, { generate } from "@/app/components/PromptBar";
import { saveRuleAction } from "@/lib/loop-actions";
import { saveStudioScriptAction, saveStudioCarouselAction, listVersionsAction, type VersionRow } from "@/lib/studio-actions";

export type BriefOption = { id: number; question: string; facts: Fact[]; doNotSay: string };
type Slide = { role: string; headline: string; supportingText: string };
type ScriptInit = {
  id: number; title: string; duration: number; type: string; funnel: string; template: string; idea: string; hook: string; hookFormula: string;
  beats: Beat[]; briefId: number | null; parentId: number | null; variantKind: string; angle: string; hookFollow: string; skeleton: string;
  delivery: string; ticks: Record<string, boolean>;
};
export type StudioInitial = {
  format: "reel" | "carousel";
  mode: "new" | "improve" | "resize" | "paste";
  script?: ScriptInit;
  carousel?: { id: number | null; title: string; type: string; funnel: string; archetype: string; parentScriptId: number | null; slides: Slide[]; idea?: string; hook?: string };
  fromIdea?: { id: number; text: string; type: string; briefId: number | null };
  like?: { id: number; title: string; duration: number; type: string; funnel: string; hookFormula: string; template: string };
};

const HOOK_FORMULAS = [
  "Big question", "Contrarian snapback", "Specific number", "In the middle of the scene", "You and your pain", "Myth-bust", "Famous-name anchor",
  "Mistake or confession", "Versus", "What X gets wrong", "Whiteboard reveal", "Old study, new life", "Stakes", "Hinglish tag", "Series slot",
];
const ARCHETYPES = ["listicle", "single_concept", "before_after", "myth_bust", "story_arc", "comparison", "tutorial", "quote_chain"];
const JOINTS = ["But ", "So ", "Which means ", "Because ", "In 19"];
const ENDINGS: Record<string, string[]> = {
  tofu: ["So no, … wasn't … . … just …", "Send this to the friend who …"],
  mofu: ["Which one are you: … or …?", "Comment … and I'll send you the …"],
  bofu: ["DM me … and I'll send you …", "The link is in my bio."],
};

const btn = "rounded-full border px-3.5 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-40";
const primary = "rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-deep disabled:opacity-40";
const field = "w-full border bg-surface px-3 py-2 text-sm";
const select = "rounded-full border bg-surface px-3.5 py-2 text-sm";

function Step({ n, title, hint, children, defaultOpen = false }: { n: number | string; title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-[28px] bg-card">
      <summary className="flex cursor-pointer select-none items-center gap-3 px-6 py-4">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-xs font-medium">{n}</span>
        <span className="font-heading text-lg">{title}</span>
        {hint && <span className="ml-auto truncate text-xs text-muted">{hint}</span>}
      </summary>
      <div className="px-6 pb-6">{children}</div>
    </details>
  );
}

export default function StudioClient({
  initial, rules, lessons, cards, references, briefs, existing, earned,
}: {
  initial: StudioInitial; rules: Rule[]; lessons: Lesson[]; cards: PlaybookCard[]; references: ReferenceScript[]; briefs: BriefOption[]; existing: string[]; earned: number[];
}) {
  const router = useRouter();
  const s = initial.script;
  const c = initial.carousel;
  const [format, setFormat] = useState<"reel" | "carousel">(initial.format);
  const [mode, setMode] = useState(initial.mode);
  const lk = initial.like;
  const [duration, setDuration] = useState<number>(s?.duration ?? lk?.duration ?? 20);
  const [type, setType] = useState(s?.type ?? c?.type ?? lk?.type ?? initial.fromIdea?.type ?? "whiteboard");
  const [funnel, setFunnel] = useState(s?.funnel ?? c?.funnel ?? lk?.funnel ?? "tofu");
  const [template, setTemplate] = useState(s?.template ?? lk?.template ?? "");
  const [title, setTitle] = useState(s?.title ?? c?.title ?? "");
  const [idea, setIdea] = useState(s?.idea ?? c?.idea ?? initial.fromIdea?.text ?? "");
  const [briefId, setBriefId] = useState<number | null>(s?.briefId ?? initial.fromIdea?.briefId ?? null);
  const [angleOut, setAngleOut] = useState("");
  const [angle, setAngle] = useState(s?.angle ?? "");
  const [hookOut, setHookOut] = useState("");
  const [hook, setHook] = useState(s?.hook ?? c?.hook ?? "");
  const [hookFormula, setHookFormula] = useState(s?.hookFormula ?? lk?.hookFormula ?? "");
  const [hookFollow, setHookFollow] = useState(s?.hookFollow ?? "");
  const [pick, setPick] = useState<number[]>([0, 0, 0, 0, 0]);
  const [skeleton, setSkeleton] = useState(s?.skeleton ?? "");
  const [beats, setBeats] = useState<Beat[]>(s?.beats?.length ? s.beats : [emptyBeat("Hook")]);
  const [selected, setSelected] = useState(0);
  const [options, setOptions] = useState<{ line: number; items: { text: string; reason: string }[] } | null>(null);
  const [toolNote, setToolNote] = useState("");
  const [delivery, setDelivery] = useState(s?.delivery ?? "");
  const [ticks, setTicks] = useState<Record<string, boolean>>(s?.ticks ?? {});
  const [scriptId, setScriptId] = useState<number | null>(s?.id ?? null);
  const [parentId, setParentId] = useState<number | null>(s?.parentId ?? lk?.id ?? null);
  const [variantKind, setVariantKind] = useState(s?.variantKind ?? (lk ? "follow_up" : ""));
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [ruleAsk, setRuleAsk] = useState<null | { why: string }>(null);
  const [ruleText, setRuleText] = useState("");
  const [resizeTo, setResizeTo] = useState<number>(30);
  const [paste, setPaste] = useState("");
  const [archetype, setArchetype] = useState(c?.archetype ?? "single_concept");
  const [slides, setSlides] = useState<Slide[]>(c?.slides?.length ? c.slides : [{ role: "hook", headline: c?.hook ?? "", supportingText: "" }]);
  const [carouselId, setCarouselId] = useState<number | null>(c?.id ?? null);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const brief = briefs.find((b) => b.id === briefId) ?? null;
  const facts = useMemo(() => brief?.facts ?? [], [brief]);
  const words = spokenWords(beats);
  const secs = estimateSeconds(beats);
  const budget = budgetFor(duration);
  const bstate = budgetStatus(words, duration);
  const hookPickScore = pick.reduce((a, b) => a + b, 0);
  const effTicks = useMemo(() => ({ ...ticks, hookPick: ticks.hookPick || hookPickScore >= 7 }), [ticks, hookPickScore]);

  const ctx: PromptContext = useMemo(() => ({
    format, duration, type, funnel, template, idea, angle, hook, hookFollow, skeleton, title, beats,
    facts, doNotSay: brief?.doNotSay ?? "", rules, lessons, cards, references, archetype: format === "carousel" ? archetype : undefined,
  }), [format, duration, type, funnel, template, idea, angle, hook, hookFollow, skeleton, title, beats, facts, brief, rules, lessons, cards, references, archetype]);

  const checks = useMemo(() => runChecks({
    beats, duration, funnel, idea, title, facts, hasBrief: Boolean(brief), existingTitles: existing, ticks: effTicks,
  }), [beats, duration, funnel, idea, title, facts, brief, existing, effTicks]);
  const failing = checks.filter((x) => !x.pass).length;

  useEffect(() => {
    if (scriptId) listVersionsAction(scriptId).then(setVersions);
  }, [scriptId]);

  // "Remember this as a rule?" (section 10.1): offered when a generated line
  // is rewritten by hand or a set of options is rejected.
  function noticeRewrite(i: number, next: string) {
    const prev = beats[i]?.say ?? "";
    if (!ruleAsk && generated.has(prev) && next !== prev) setRuleAsk({ why: "You rewrote a generated line." });
  }

  function setBeat(i: number, patch: Partial<Beat>) {
    setBeats((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  }

  function applyScriptText(text: string, opts: { keepLocks: boolean }) {
    const parsed = parseScript(extractFinal(text));
    if (!parsed.beats.length) { setToolNote("Couldn't find any lines in that answer."); return; }
    setBeats((prev) => (opts.keepLocks ? enforceLocks(prev, parsed.beats) : parsed.beats));
    setGenerated(new Set(parsed.beats.map((b) => b.say)));
    if (parsed.title && !title) setTitle(parsed.title);
    setToolNote(text.includes("=== FINAL SCRIPT ===") ? text.slice(0, text.indexOf("=== FINAL SCRIPT ===")).trim().split("\n").filter((l) => l.startsWith("- ")).join("\n") : "");
  }

  function bringInPaste() {
    const parsed = parseScript(paste);
    if (!parsed.beats.length) { setStatus("Nothing to bring in: paste the script text first."); return; }
    const k = classifyScript(paste, parsed.beats);
    setFormat("reel"); setBeats(parsed.beats); setTitle(parsed.title); setDuration(k.duration); setType(k.type); setFunnel(k.funnel);
    setHook(parsed.beats[0]?.say ?? ""); setScriptId(null); setParentId(null); setVariantKind(""); setMode("new");
    setStatus(`Brought in ${parsed.beats.length} lines: Reel, ${durationLabel(k.duration)}, ${TYPES.find((t) => t.value === k.type)?.label}, ${FUNNELS.find((f) => f.value === k.funnel)?.label}. Check the layers above.`);
  }

  async function save(schedule: boolean) {
    setSaving(true); setStatus("");
    if (format === "carousel") {
      const r = await saveStudioCarouselAction({ id: carouselId, title, type, funnel, archetype, slides, parentScriptId: c?.parentScriptId ?? null, scheduleDate: schedule ? date : undefined });
      setSaving(false);
      if (!r.ok) { setStatus(r.error); return; }
      setCarouselId(r.id); setStatus(schedule ? `Saved and scheduled for ${date}.` : "Saved to Content.");
      router.replace(`/studio?carousel=${r.id}`, { scroll: false });
      return;
    }
    const r = await saveStudioScriptAction({
      id: scriptId, title, duration, type, funnel, template, idea, angle, hook: hook || beats[0]?.say || "", hookFormula, hookFollow, skeleton, delivery,
      beats, checks, ticks: effTicks, briefId, parentId, variantKind, ideaId: initial.fromIdea?.id ?? null, scheduleDate: schedule ? date : undefined,
    });
    setSaving(false);
    if (!r.ok) { setStatus(r.error); return; }
    setScriptId(r.id);
    setStatus(`Saved as version ${r.version}${schedule ? `, scheduled for ${date}` : ""}.${failing ? ` ${failing} ${failing === 1 ? "check" : "checks"} still to fix (saving is never blocked).` : ""}`);
    listVersionsAction(r.id).then(setVersions);
    router.replace(`/studio?id=${r.id}`, { scroll: false });
  }

  function restore(v: (typeof versions)[number]) {
    const x = v.snapshot;
    setTitle(x.title); setDuration(x.duration); setType(x.type); setFunnel(x.funnel); setTemplate(x.template ?? ""); setIdea(x.idea ?? "");
    setAngle(x.angle ?? ""); setHook(x.hook ?? ""); setHookFormula(x.hookFormula ?? ""); setHookFollow(x.hookFollow ?? ""); setSkeleton(x.skeleton ?? "");
    setDelivery(x.delivery ?? ""); setBeats(x.beats?.length ? x.beats : [emptyBeat("Hook")]); setTicks(x.ticks ?? {}); setBriefId(x.briefId ?? null);
    setStatus(`Restored version ${v.version}. Save to keep it.`);
  }

  const lineSecs = (b: Beat) => countWords(b.say) / (b.drawing ? WPS.drawing : WPS.talk);

  return (
    <div className="pb-10">
      {/* Brief bar: Format · Duration · Type · Funnel (section 5.1) */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-border/10 bg-background/95 px-4 py-3 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value as "reel" | "carousel")} className={select}>
            <option value="reel">Reel</option>
            <option value="carousel">Carousel</option>
          </select>
          {format === "reel" && (
            <select aria-label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={select}>
              {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          )}
          <select aria-label="Type" value={type} onChange={(e) => { setType(e.target.value); setTemplate(""); }} className={select}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select aria-label="Funnel" value={funnel} onChange={(e) => setFunnel(e.target.value)} className={select}>
            {FUNNELS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {format === "reel" && (
            <span data-testid="budget" className={`ml-auto rounded-full px-3 py-1.5 text-sm ${bstate.state === "ok" ? "bg-accent text-accent-deep" : "bg-foreground/10"}`}>
              {words} / {budget.min}–{budget.max} words · ~{secs.toFixed(1)} s{bstate.state === "over" ? ` · ${bstate.by} over budget` : bstate.state === "under" ? ` · ${bstate.by} under` : ""}
            </span>
          )}
          <button
            className={`${btn} ${format === "reel" ? "" : "ml-auto"}`}
            onClick={async () => { await navigator.clipboard.writeText(buildClaudeBrief(ctx)); setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 1500); }}
          >
            {copiedBrief ? "Copied" : "Copy brief for Claude"}
          </button>
        </div>
      </div>

      {format === "reel" && !earned.includes(duration) && (
        <p className="mb-3 text-sm text-muted" data-testid="unearned">{durationLabel(duration)} isn&apos;t marked as earned yet (Settings). Short first: 20 to 35 s until your numbers earn longer.</p>
      )}
      {lk && !scriptId && <p className="mb-3 text-sm text-muted">Another like “{lk.title}”: same layers and hook formula, tagged as a follow-up.</p>}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (the hook works)" aria-label="Title" className="min-w-0 flex-1 bg-transparent font-heading text-3xl outline-none md:text-[40px]" />
        {format === "reel" && (
          <div className="inline-flex rounded-full bg-card p-1 text-sm" role="tablist" aria-label="Mode">
            {(["new", "improve", "resize", "paste"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} disabled={(m === "improve" || m === "resize") && !scriptId}
                className={`rounded-full px-4 py-1.5 disabled:opacity-40 ${mode === m ? "bg-surface font-medium" : "text-muted"}`}>
                {m === "new" ? "Write" : m === "improve" ? "Improve" : m === "resize" ? "Resize" : "Paste from Claude"}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "paste" && format === "reel" && (
        <div className="mb-6 rounded-[28px] bg-card p-6">
          <p className="text-sm text-muted">Paste a finished script from a chat. Lines become beats; [WB: …] cues move to Board, [CARD: …] and similar to Screen. It is classified into the three layers by word count and content.</p>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={10} className={`${field} mt-3`} aria-label="Script to paste" />
          <button className={`${primary} mt-3`} onClick={bringInPaste}>Bring it in</button>
        </div>
      )}

      {mode === "improve" && format === "reel" && (
        <div className="mb-6 rounded-[28px] bg-card p-6">
          <h2 className="font-heading text-lg">Improve</h2>
          <p className="text-sm text-muted">Diagnose, protect the strong lines, fix by severity. Locked lines are never rewritten.</p>
          <PromptBar prompt={buildScriptToolPrompt("improve", ctx)} onResult={(t) => applyScriptText(t, { keepLocks: true })} />
        </div>
      )}

      {mode === "resize" && format === "reel" && (
        <div className="mb-6 rounded-[28px] bg-card p-6">
          <h2 className="font-heading text-lg">Resize</h2>
          <p className="text-sm text-muted">Writes the same idea at another duration and saves it as a linked variant. Whole beats are removed and the idea narrowed; the same content is never squeezed.</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm">From {durationLabel(duration)} to</span>
            <select aria-label="Resize to" value={resizeTo} onChange={(e) => setResizeTo(Number(e.target.value))} className={select}>
              {DURATIONS.filter((d) => d.value !== duration).map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <PromptBar
            prompt={buildScriptToolPrompt("resize", { ...ctx, duration: resizeTo }, { fromDuration: duration })}
            onResult={(t) => {
              const parsed = parseScript(extractFinal(t));
              if (!parsed.beats.length) { setStatus("Couldn't find any lines in that answer."); return; }
              setParentId(scriptId); setScriptId(null); setVariantKind("resize"); setDuration(resizeTo); setBeats(parsed.beats);
              setTitle((tt) => `${tt.replace(/ \([^)]*\)$/, "")} (${durationLabel(resizeTo)})`); setMode("new");
              setStatus(`Resized to ${durationLabel(resizeTo)}. Save to keep it as a linked variant.`);
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <Step n={1} title="Idea" hint={idea ? `${countWords(idea)} words` : "One sentence the viewer could repeat to a friend"} defaultOpen={!s}>
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={2} className={field} aria-label="Idea" placeholder="15 words or fewer. If it needs “and”, it is two videos." />
          <p className={`mt-1 text-xs ${countWords(idea) > 15 || /\band\b/i.test(idea) ? "text-red-700" : "text-muted"}`}>
            {countWords(idea)} words{countWords(idea) > 15 ? " (15 or fewer)" : ""}{/\band\b/i.test(idea) ? " · it has “and”: is this two videos?" : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span>Research brief</span>
            <select aria-label="Research brief" value={briefId ?? ""} onChange={(e) => setBriefId(Number(e.target.value) || null)} className={select}>
              <option value="">None attached</option>
              {briefs.map((b) => <option key={b.id} value={b.id}>{b.question}</option>)}
            </select>
            {brief && <span className="text-xs text-muted">{facts.filter((f) => f.status === "verified").length} of {facts.length} facts Verified</span>}
            <Link href="/research/briefs" className="text-xs underline underline-offset-2">Briefs</Link>
          </div>
          {!brief && <p className="mt-2 text-xs text-muted">Without a brief, every number in the script is flagged as unsourced.</p>}
        </Step>

        {format === "reel" && (
          <>
            <Step n={2} title="Angle" hint={angle || "Seven angles, lens named"}>
              <PromptBar prompt={buildStepPrompt("angle", ctx)} onResult={setAngleOut} />
              {angleOut && <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-surface p-4 text-sm">{angleOut}</pre>}
              <input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="The angle you chose" aria-label="Chosen angle" className={`${field} mt-3`} />
            </Step>

            <Step n={3} title="Hook" hint={hook ? `${countWords(hook)} words · pick test ${hookPickScore}/10` : "Five hooks from the formula bank"}>
              <PromptBar prompt={buildStepPrompt("hook", ctx)} onResult={setHookOut} />
              {hookOut && <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-surface p-4 text-sm">{hookOut}</pre>}
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px]">
                <input value={hook} onChange={(e) => { setHook(e.target.value); if (beats[0] && !beats[0].locked) setBeat(0, { say: e.target.value }); }} placeholder="The hook: 8 words or fewer" aria-label="Hook" className={field} />
                <select aria-label="Hook formula" value={hookFormula} onChange={(e) => setHookFormula(e.target.value)} className={select}>
                  <option value="">Formula…</option>
                  {HOOK_FORMULAS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <p className={`mt-1 text-xs ${countWords(hook) > 8 ? "text-red-700" : "text-muted"}`}>{countWords(hook)} words</p>
              <input value={hookFollow} onChange={(e) => setHookFollow(e.target.value)} placeholder="The line that follows it" aria-label="Line after the hook" className={`${field} mt-2`} />
              <div className="mt-4 text-sm">
                <div className="mb-2 font-medium">Pick test (0 to 2 each; a hook needs 7 of 10): {hookPickScore}/10</div>
                {HOOK_PICK_TEST.map((q, i) => (
                  <label key={i} className="flex items-center gap-2 py-0.5">
                    <select aria-label={q} value={pick[i]} onChange={(e) => setPick((p) => p.map((x, j) => (j === i ? Number(e.target.value) : x)))} className="rounded border bg-surface px-1 text-xs">
                      {[0, 1, 2].map((v) => <option key={v}>{v}</option>)}
                    </select>
                    {q}
                  </label>
                ))}
              </div>
            </Step>

            <Step n={4} title="Skeleton" hint={`${beatTemplate(duration).length} beats · ${PRODUCTION_STYLE[type]}`}>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>Template</span>
                <select aria-label="Template" value={template} onChange={(e) => setTemplate(e.target.value)} className={select}>
                  <option value="">Choose…</option>
                  {(TEMPLATES_BY_TYPE[type] ?? []).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <ol className="mt-3 space-y-1 text-sm">
                {beatTemplate(duration).map((b, i) => (
                  <li key={i}><span className="font-medium">{b.beat}</span> <span className="text-muted">({b.share})</span>: {b.job}</li>
                ))}
              </ol>
              <PromptBar prompt={buildStepPrompt("skeleton", ctx)} onResult={setSkeleton} />
              <textarea value={skeleton} onChange={(e) => setSkeleton(e.target.value)} rows={6} className={`${field} mt-3`} aria-label="Skeleton" placeholder="Each sentence starts with But, So, Because, Which means, or a date." />
            </Step>

            <Step n={5} title="Script" hint={`${words} words · ~${Math.round(secs)} s`} defaultOpen>
              <PromptBar prompt={buildStepPrompt("script", ctx)} onResult={(t) => applyScriptText(t, { keepLocks: true })} label="Generate script" applyLabel="Use this script" />
              <div className="mt-4 space-y-2">
                {beats.map((b, i) => (
                  <div key={i} data-testid="beat" onFocus={() => setSelected(i)} className={`rounded-[18px] border p-3 ${selected === i ? "border-foreground/40" : "border-border/10"} ${b.locked ? "bg-accent/10" : "bg-surface"}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                      <input value={b.beat} onChange={(e) => setBeat(i, { beat: e.target.value })} aria-label="Beat name" className="w-40 border-0 bg-transparent font-medium outline-none" />
                      <span className="text-muted">{countWords(b.say)} words · {lineSecs(b).toFixed(1)} s</span>
                      <label className="ml-auto flex items-center gap-1"><input type="checkbox" checked={b.drawing} onChange={(e) => setBeat(i, { drawing: e.target.checked })} aria-label="Drawing" /> Drawing</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={b.locked} onChange={(e) => setBeat(i, { locked: e.target.checked })} aria-label="Lock" /> Lock</label>
                      <OptionsButton disabled={b.locked || !b.say.trim()} prompt={buildLinePrompt("options", ctx, i)} onResult={(items) => setOptions({ line: i, items })} />
                      <button className="text-muted hover:text-red-700" disabled={b.locked} onClick={() => setBeats((bs) => bs.filter((_, j) => j !== i))} aria-label="Remove beat">✕</button>
                    </div>
                    <textarea value={b.say} readOnly={b.locked} onChange={(e) => { noticeRewrite(i, e.target.value); setBeat(i, { say: e.target.value }); }} rows={2} aria-label="Say" placeholder="Say" className={`${field} ${b.locked ? "opacity-80" : ""}`} />
                    <div className="mt-1.5 grid gap-1.5 md:grid-cols-2">
                      <input value={b.board} readOnly={b.locked} onChange={(e) => setBeat(i, { board: e.target.value })} aria-label="Board" placeholder="Board: hands and whiteboard, e.g. [WB: …]" className={`${field} text-xs`} />
                      <input value={b.screen} readOnly={b.locked} onChange={(e) => setBeat(i, { screen: e.target.value })} aria-label="Screen" placeholder="Screen: edit and sound, e.g. [CARD: …]" className={`${field} text-xs`} />
                    </div>
                    {options?.line === i && (
                      <div className="mt-2 rounded-[14px] bg-card p-3" data-testid="options">
                        <div className="mb-1 flex items-center text-xs font-medium">Options for this line <button className="ml-auto text-muted" onClick={() => { setOptions(null); if (!ruleAsk) setRuleAsk({ why: "You closed the options without using one." }); }}>None of these</button></div>
                        {options.items.map((o, k) => (
                          <button key={k} onClick={() => { setBeat(i, { say: o.text }); setOptions(null); }} className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface">
                            {k === 0 && <span className="mr-1 rounded-full bg-accent px-1.5 text-[10px] text-accent-deep">recommended</span>}
                            {o.text} {o.reason && <span className="text-xs text-muted">— {o.reason}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className={btn} onClick={() => setBeats((bs) => [...bs, emptyBeat(`Beat ${bs.length + 1}`)])}>Add a line</button>
              </div>

              <div className="mt-5 rounded-[18px] bg-surface p-4 text-sm">
                <div className="font-medium">Swap bank</div>
                <p className="text-xs text-muted">The hook, the joints and the ending are where viewers leave. Click to drop into the selected line ({beats[selected]?.beat || "none"}).</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {JOINTS.map((j) => (
                    <button key={j} className="rounded-full border px-2.5 py-1 text-xs" disabled={beats[selected]?.locked}
                      onClick={() => setBeat(selected, { say: `${j}${(beats[selected]?.say ?? "").replace(/^(But|So|Which means|Because|And then)\s+/i, "")}` })}>{j.trim()}…</button>
                  ))}
                  {(ENDINGS[funnel] ?? []).map((e) => (
                    <button key={e} className="rounded-full border px-2.5 py-1 text-xs" disabled={beats[selected]?.locked} onClick={() => setBeat(selected, { say: e })}>{e}</button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">Ending rule for {FUNNELS.find((f) => f.value === funnel)?.label.toLowerCase()}: {FUNNEL_ENDING[funnel]}</p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[18px] bg-surface p-4">
                  <div className="text-sm font-medium">Correct only</div>
                  <p className="text-xs text-muted">Fix facts and grammar, change nothing else, list every change.</p>
                  <PromptBar prompt={buildScriptToolPrompt("correct", ctx)} onResult={(t) => applyScriptText(t, { keepLocks: true })} label="Correct" />
                </div>
                <div className="rounded-[18px] bg-surface p-4">
                  <div className="text-sm font-medium">Tighten</div>
                  <p className="text-xs text-muted">Cut words to reach the budget without changing meaning or facts.</p>
                  <PromptBar prompt={buildScriptToolPrompt("tighten", ctx)} onResult={(t) => applyScriptText(t, { keepLocks: true })} label="Tighten" />
                </div>
              </div>
              {ruleAsk && (
                <div className="mt-4 rounded-[18px] border border-accent bg-accent/10 p-4 text-sm" data-testid="remember-rule">
                  <div>{ruleAsk.why} Remember this as a rule?</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input value={ruleText} onChange={(e) => setRuleText(e.target.value)} placeholder="e.g. Keep my wording; offer options instead of rewriting." aria-label="Rule" className={`${field} min-w-0 flex-1`} />
                    <button className={primary} disabled={!ruleText.trim()} onClick={async () => { await saveRuleAction({ id: null, text: ruleText, category: "writing", active: true }); setRuleText(""); setRuleAsk(null); setStatus("Saved as a rule. It goes into every prompt from now on."); router.refresh(); }}>Remember</button>
                    <button className={btn} onClick={() => setRuleAsk(null)}>Not now</button>
                  </div>
                </div>
              )}
              {toolNote && <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-surface p-3 text-xs">{toolNote}</pre>}
            </Step>
          </>
        )}

        {format === "carousel" && (
          <>
            <Step n={2} title="Hook slide" hint={slides[0]?.headline || ""} defaultOpen>
              <select aria-label="Archetype" value={archetype} onChange={(e) => setArchetype(e.target.value)} className={select}>
                {ARCHETYPES.map((a) => <option key={a} value={a}>{a.replace("_", " ")}</option>)}
              </select>
              <input value={slides[0]?.headline ?? ""} onChange={(e) => setSlides((ss) => ss.map((x, j) => (j === 0 ? { ...x, role: "hook", headline: e.target.value } : x)))} placeholder="Hook slide headline: legible in under a second" aria-label="Hook slide" className={`${field} mt-3`} />
            </Step>
            <Step n={3} title="Slides" hint={`${slides.length} slides`} defaultOpen>
              <PromptBar
                prompt={buildStepPrompt("slides", { ...ctx, hook: slides[0]?.headline || hook })}
                onResult={(t) => {
                  const rows = t.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p.length >= 2 && ["hook", "body", "cta"].includes(p[0].toLowerCase()));
                  if (rows.length) setSlides(rows.map((p) => ({ role: p[0].toLowerCase(), headline: p[1], supportingText: p[2] ?? "" })));
                }}
              />
              <div className="mt-3 space-y-2">
                {slides.map((sl, i) => (
                  <div key={i} className="grid gap-1.5 rounded-[14px] bg-surface p-2 md:grid-cols-[90px_1fr_1fr_24px]">
                    <select aria-label="Role" value={sl.role} onChange={(e) => setSlides((ss) => ss.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} className="rounded border bg-surface px-1 text-xs">
                      <option value="hook">hook</option><option value="body">body</option><option value="cta">cta</option>
                    </select>
                    <input value={sl.headline} onChange={(e) => setSlides((ss) => ss.map((x, j) => (j === i ? { ...x, headline: e.target.value } : x)))} aria-label="Headline" placeholder="Headline" className={`${field} text-xs`} />
                    <input value={sl.supportingText} onChange={(e) => setSlides((ss) => ss.map((x, j) => (j === i ? { ...x, supportingText: e.target.value } : x)))} aria-label="Supporting text" placeholder="Supporting text" className={`${field} text-xs`} />
                    <button onClick={() => setSlides((ss) => ss.filter((_, j) => j !== i))} aria-label="Remove slide" className="text-muted">✕</button>
                  </div>
                ))}
              </div>
              <button className={`${btn} mt-2`} onClick={() => setSlides((ss) => [...ss, { role: "body", headline: "", supportingText: "" }])}>Add a slide</button>
            </Step>
          </>
        )}

        <Step n={format === "reel" ? 6 : 4} title="Check" hint={format === "reel" ? (failing ? `${failing} to fix` : "All clear") : ""} defaultOpen={format === "reel"}>
          {format === "reel" ? (
            <>
              <ul className="space-y-2" data-testid="checks">
                {checks.map((k) => (
                  <li key={k.key} className="text-sm">
                    <span className={`mr-2 inline-block w-14 rounded-full px-2 py-0.5 text-center text-xs ${k.pass ? "bg-accent text-accent-deep" : "bg-red-700/10 text-red-700"}`}>{k.pass ? "Pass" : "Fix"}</span>
                    <span className="font-medium">{k.label}</span> <span className="text-muted">{k.detail}</span>
                    {k.items && k.items.length > 0 && <ul className="ml-16 mt-1 list-disc text-xs text-muted">{k.items.map((x, i) => <li key={i}>{x}</li>)}</ul>}
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(ticks.ending)} onChange={(e) => setTicks((t) => ({ ...t, ending: e.target.checked }))} /> The last line answers the hook, with two sentences or fewer after the payoff.</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(ticks.story)} onChange={(e) => setTicks((t) => ({ ...t, story: e.target.checked }))} /> All twelve “is this a lecture?” questions are yes.</label>
                <details className="ml-6 text-xs text-muted"><summary className="cursor-pointer">The twelve questions</summary><ol className="ml-4 list-decimal">{LECTURE_TEST.map((q) => <li key={q}>{q}</li>)}</ol></details>
              </div>
            </>
          ) : (
            <ul className="space-y-1 text-sm">
              <li>{slides.length >= 6 && slides.length <= 10 ? "✓" : "✗"} 6 to 10 slides ({slides.length})</li>
              <li>{countWords(slides[0]?.headline ?? "") <= 10 && slides[0]?.headline ? "✓" : "✗"} Hook slide legible in under a second (10 words or fewer)</li>
              <li>{slides.filter((x) => x.role === "cta").length === 1 ? "✓" : "✗"} Exactly one call to action</li>
              <li>{slides.every((x) => countWords(x.headline) <= 12) ? "✓" : "✗"} One idea per slide (headlines 12 words or fewer)</li>
            </ul>
          )}
        </Step>

        {format === "reel" && (
          <Step n={7} title="Delivery (optional)" hint="Marks for how to say it; words and facts don't change">
            <PromptBar prompt={buildStepPrompt("delivery", ctx)} onResult={setDelivery} label="Mark delivery" />
            <textarea value={delivery} onChange={(e) => setDelivery(e.target.value)} rows={8} className={`${field} mt-3 font-mono text-xs`} aria-label="Delivery" placeholder="(slower) **louder** >faster< °softer° / // ///" />
          </Step>
        )}

        <Step n={format === "reel" ? 8 : 5} title="Save" hint={status || (scriptId || carouselId ? "Saved" : "Not saved yet")} defaultOpen>
          <div className="flex flex-wrap items-center gap-2">
            <button className={primary} disabled={saving} onClick={() => save(false)}>{saving ? "Saving…" : "Save"}</button>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Schedule date" className="border bg-surface px-3 py-1.5 text-sm" />
            <button className={btn} disabled={saving || !date} onClick={() => save(true)}>Save and schedule</button>
            {format === "reel" && scriptId && <Link href={`/studio?fromScript=${scriptId}&format=carousel`} className={btn}>Make a carousel from this Reel</Link>}
          </div>
          {status && <p className="mt-3 text-sm" data-testid="status">{status}</p>}
          {parentId && variantKind === "resize" && <p className="mt-1 text-xs text-muted">Linked variant of script #{parentId}.</p>}
          {format === "reel" && versions.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium">Versions</div>
              <ul className="space-y-1 text-sm">
                {versions.map((v) => (
                  <li key={v.version} className="flex items-center gap-3">
                    <span className="w-10 text-muted">v{v.version}</span>
                    <span className="flex-1 text-xs text-muted">{new Date(v.created_at).toLocaleString()} · {spokenWords(v.snapshot.beats ?? [])} words</span>
                    <button className="text-xs underline underline-offset-2" onClick={() => restore(v)}>Restore</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {format === "reel" && (
            <details className="mt-4 text-xs text-muted">
              <summary className="cursor-pointer">Script as text</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-[14px] bg-surface p-3">{serializeScript(beats, title)}</pre>
            </details>
          )}
        </Step>
      </div>
    </div>
  );
}

function OptionsButton({ prompt, onResult, disabled }: { prompt: string; onResult: (items: { text: string; reason: string }[]) => void; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <>
      <button
        className="rounded-full border px-2.5 py-0.5 disabled:opacity-40"
        disabled={disabled || busy}
        onClick={async () => {
          setBusy(true); setMsg("");
          const r = await generate(prompt);
          setBusy(false);
          if (r.ok) {
            const items = parseOptions(r.text);
            if (items.length) onResult(items); else setMsg("No options found");
          } else {
            await navigator.clipboard.writeText(prompt).catch(() => {});
            setMsg("No AI connected: prompt copied");
          }
        }}
      >
        {busy ? "…" : "Options"}
      </button>
      {msg && <span className="text-red-700">{msg}</span>}
    </>
  );
}
