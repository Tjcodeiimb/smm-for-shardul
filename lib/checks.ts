// Step 6 checks (v2 brief, section 5.5). Automatic where the app can compute
// it; a tick box where it needs judgement. A failed check never blocks saving.
// Client-safe.

import { budgetFor, budgetStatus, countWords, estimateSeconds } from "./taxonomy";
import type { Beat } from "./script-format";

export type Fact = {
  id: string;
  text: string;
  number: string;
  citation: string;
  sample: string;
  replication: string;
  caveat: string;
  link: string;
  checked: string;
  status: "verified" | "known" | "unverified";
};

export type CheckResult = {
  key: string;
  label: string;
  kind: "auto" | "tick";
  pass: boolean;
  detail: string;
  items?: string[];
};

export const BANNED_HOOK = ["in this video i'll", "in this video i will", "hey guys", "you won't believe", "game-changer", "game changer", "secret", "hack", "stay till the end"];

// Appendix A11: popular claim -> safe wording.
export const MISQUOTES: { pattern: RegExp; claim: string; safe: string }[] = [
  { pattern: /10,?000 hours/i, claim: "10,000 hours to mastery", safe: "Practice matters a lot in chess and music, and surprisingly little in most jobs." },
  { pattern: /21 days/i, claim: "21 days to form a habit", safe: "Closer to two months on average, and it varies hugely." },
  { pattern: /multitask\w*[^.]{0,40}40\s?%|40\s?%[^.]{0,40}multitask/i, claim: "Multitasking costs 40%", safe: "Every switch has a time cost; in some lab conditions it adds up to a lot." },
  { pattern: /goldfish|8[- ]second attention/i, claim: "An 8-second attention span, less than a goldfish", safe: "Myth-bust only. Nobody has measured a goldfish." },
  { pattern: /attention span[^.]{0,30}47 seconds|47[- ]second attention/i, claim: "Our attention span is 47 seconds", safe: "We switch screens about every 47 seconds." },
  { pattern: /23 minutes/i, claim: "23 minutes to refocus", safe: "It can take about 25 minutes to return to the original task, usually after doing other things." },
  { pattern: /93\s?%/i, claim: "93% of communication is non-verbal", safe: "Myth-bust only." },
  { pattern: /left[- ]brain|right[- ]brain/i, claim: "Left-brained and right-brained people", safe: "Functions lateralise; people don't." },
  { pattern: /learning styles?/i, claim: "Learning styles", safe: "Match the method to the material, not to a \"style\"." },
  { pattern: /hungry judges|decision fatigue/i, claim: "Decision fatigue and the hungry judges", safe: "A famous study, now heavily questioned." },
  { pattern: /willpower[^.]{0,30}(battery|muscle|runs out)|ego depletion/i, claim: "Willpower is a battery", safe: "The idea failed its biggest tests." },
  { pattern: /zeigarnik/i, claim: "Unfinished tasks stick in memory (Zeigarnik)", safe: "They don't stick better, but they do pull you back." },
  { pattern: /marshmallow/i, claim: "The marshmallow test predicts success", safe: "It mostly measured circumstances, not character." },
  { pattern: /dunning[- ]kruger/i, claim: "Dunning–Kruger", safe: "Novices tend to overestimate; how much is debated. Never as an insult." },
  { pattern: /eisenhower matrix/i, claim: "The Eisenhower Matrix, by Eisenhower", safe: "Inspired by a line Eisenhower borrowed." },
  { pattern: /pomodoro[^.]{0,30}(proven|science|scientific)/i, claim: "Pomodoro is scientifically proven", safe: "A structure that helps some people." },
];

const KIT_BANNED = /\b(b-?roll|stock footage|stock clip|green ?screen|second camera|drone|outdoor shot|ai[- ]generated|ai visual|ai b-?roll)\b/i;

function sentences(text: string) {
  return text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => countWords(s) > 0);
}

function tokens(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s']/g, " ").split(/\s+/).filter((w) => w.length > 2);
}

// Numbers, years and quotes that need a source: digit runs (with , . %),
// plus anything inside double quotes.
export function claimsIn(text: string) {
  const nums = text.match(/\b\d[\d,.]*%?/g) ?? [];
  const quotes = text.match(/["“][^"”]{12,}["”]/g) ?? [];
  return [...new Set([...nums.map((n) => n.replace(/[.,]$/, "")), ...quotes])];
}

function factCovers(fact: Fact, claim: string) {
  const hay = `${fact.text} ${fact.number} ${fact.citation}`.toLowerCase();
  const c = claim.toLowerCase().replace(/["“”]/g, "");
  if (/^\d/.test(c)) {
    const bare = c.replace(/[,%]/g, "");
    const hayNums = (hay.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,]/g, "").replace(/\.$/, ""));
    return hayNums.some((n) => n === bare || Math.round(Number(n)) === Number(bare));
  }
  const words = tokens(c);
  const hit = words.filter((w) => hay.includes(w)).length;
  return words.length > 0 && hit / words.length >= 0.6;
}

export type CheckInput = {
  beats: Beat[];
  duration: number;
  funnel: string;
  idea: string;
  title: string;
  facts: Fact[]; // facts from the attached brief
  hasBrief: boolean;
  existingTitles: string[]; // other Content items, for the duplicate warning
  ticks: Record<string, boolean>;
};

export function runChecks(input: CheckInput): CheckResult[] {
  const { beats, duration, funnel, idea, title, facts, ticks } = input;
  const say = beats.map((b) => b.say).join("\n");
  const words = countWords(say);
  const results: CheckResult[] = [];
  const add = (r: CheckResult) => results.push(r);

  // Length
  const budget = budgetFor(duration);
  const st = budgetStatus(words, duration);
  add({
    key: "length", label: "Length", kind: "auto", pass: st.state === "ok",
    detail: `${words} words, about ${Math.round(estimateSeconds(beats))} s. Budget for ${budget.label}: ${budget.min} to ${budget.max}.` +
      (st.state === "over" ? ` ${st.by} over.` : st.state === "under" ? ` ${st.by} under.` : ""),
  });

  // Hook
  const hook = beats[0]?.say ?? "";
  const hookWords = countWords(hook);
  const banned = BANNED_HOOK.filter((p) => hook.toLowerCase().includes(p)) as string[];
  if (/^did you know\b/i.test(hook) && !/\d|[A-Z][a-z]+\s[A-Z]/.test(hook.slice(12))) banned.push("did you know (without a specific)");
  add({
    key: "hook", label: "Hook", kind: "auto", pass: hook !== "" && hookWords <= 8 && banned.length === 0 && Boolean(ticks.hookPick),
    detail: hook ? `${hookWords} words${hookWords > 8 ? " (8 or fewer, so it can be said in 3 seconds)" : ""}.${banned.length ? ` Banned: ${banned.join(", ")}.` : ""}${ticks.hookPick ? " Pick test 7+ ticked." : " Tick the pick test (7 of 10) below."}` : "No hook yet.",
  });

  // One idea
  const ideaTok = tokens(idea);
  const tail = beats.slice(-3).map((b) => b.say).join(" ").toLowerCase();
  const overlap = ideaTok.length ? ideaTok.filter((w) => tail.includes(w)).length / ideaTok.length : 0;
  add({
    key: "idea", label: "One idea", kind: "auto", pass: ideaTok.length > 0 && overlap >= 0.5,
    detail: ideaTok.length === 0 ? "No idea sentence in step 1." : `${Math.round(overlap * 100)}% of the idea sentence's words appear in the last beats (aim for most of them).`,
  });

  // Sentences
  const sents = sentences(say);
  const lens = sents.map(countWords);
  const avg = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const long = sents.filter((s) => countWords(s) > 20);
  add({
    key: "sentences", label: "Sentences", kind: "auto", pass: sents.length > 0 && avg <= 12 && long.length === 0,
    detail: `Average ${avg.toFixed(1)} words (12 or fewer); ${long.length} over 20.`, items: long.map((s) => `“${s}”`),
  });

  // Concrete
  const hasNumber = /\b\d/.test(say) || /\b(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|billion|half|third)\b/i.test(say);
  const hasName = sents.some((s) => /\s[A-Z][a-z]+/.test(s.replace(/^\S+/, "").replace(/\s(I|I'm|I've|I'd|I'll)\b/g, "")));
  add({ key: "concrete", label: "Concrete", kind: "auto", pass: hasNumber && hasName, detail: `${hasName ? "Has a name" : "No name"}; ${hasNumber ? "has a year or number" : "no year or number"}.` });

  // The turn
  if (duration >= 30) {
    const lower = say.toLowerCase();
    const idx = [...lower.matchAll(/\bbut\b/g)].map((m) => m.index ?? 0);
    const pos = idx.map((i) => countWords(say.slice(0, i)) / Math.max(words, 1));
    const ok = pos.some((p) => p >= 0.3 && p <= 0.5);
    add({ key: "turn", label: "The turn", kind: "auto", pass: ok, detail: pos.length ? `"But" at ${pos.map((p) => `${Math.round(p * 100)}%`).join(", ")} of the script (aim for 30% to 50%).` : "No \"but\" in the script." });
  }

  // Facts
  const verified = facts.filter((f) => f.status === "verified");
  const claims = claimsIn(say);
  const unsourced = claims.filter((c) => !verified.some((f) => factCovers(f, c)));
  add({
    key: "facts", label: "Facts", kind: "auto", pass: unsourced.length === 0,
    detail: !input.hasBrief && claims.length ? "No research brief attached, so every number and quote is unsourced." :
      unsourced.length ? `${unsourced.length} unsourced: not backed by a Verified fact in the brief.` : claims.length ? "Every number and quote links to a Verified fact." : "No numbers or quotes to source.",
    items: unsourced.map((u) => `Unsourced: ${u}`),
  });

  // Misquotes
  const mis = MISQUOTES.filter((m) => m.pattern.test(say));
  add({ key: "misquotes", label: "Misquotes", kind: "auto", pass: mis.length === 0, detail: mis.length ? "Claims to be careful with:" : "None of the guardrail claims.", items: mis.map((m) => `${m.claim} → ${m.safe}`) });

  // Kit
  const kit = beats.flatMap((b) => [b.board, b.screen]).filter((t) => KIT_BANNED.test(t));
  add({ key: "kit", label: "Kit", kind: "auto", pass: kit.length === 0, detail: kit.length ? "Direction asks for something your setup can't record:" : "Only face, whiteboard, drawings, cards, captions and sound.", items: kit });

  // Ending
  const last = (beats[beats.length - 1]?.say ?? "").toLowerCase();
  const followForMore = /follow (me )?for (more|part)/.test(say.toLowerCase());
  const ctaOk = funnel === "tofu" ? !followForMore && !/\bcomment\b|\bdm\b|link in bio/.test(last) :
    funnel === "mofu" ? /\?|comment/.test(last) : /\bdm\b|link|book|keyword/.test(last);
  add({
    key: "ending", label: "Ending", kind: "tick", pass: ctaOk && Boolean(ticks.ending),
    detail: `${ctaOk ? "Call to action matches the funnel stage." : funnel === "tofu" ? "Top of funnel ends by answering the hook: no \"follow for more\", no ask." : funnel === "mofu" ? "Middle of funnel ends with one specific question or value exchange." : "Bottom of funnel ends with one explicit next step."} ${ticks.ending ? "Ticked: the last line answers the hook, two sentences or fewer after the payoff." : "Tick when the last line answers the hook."}`,
  });

  // Story
  add({ key: "story", label: "Story", kind: "tick", pass: Boolean(ticks.story), detail: ticks.story ? "All twelve \"is this a lecture?\" questions answered yes." : "Tick when all twelve \"is this a lecture?\" questions are yes." });

  // Duplicate
  const me = tokens(`${title} ${idea}`);
  const dups = input.existingTitles.filter((t) => {
    const o = tokens(t);
    if (!o.length || !me.length) return false;
    const inter = o.filter((w) => me.includes(w)).length;
    return inter / Math.min(o.length, me.length) >= 0.75;
  });
  add({ key: "duplicate", label: "Duplicate", kind: "auto", pass: dups.length === 0, detail: dups.length ? "Close to something already in Content:" : "Nothing similar in Content.", items: dups.slice(0, 5) });

  return results;
}

export const LECTURE_TEST = [
  "Is something happening in the first 5 seconds?",
  "Can every beat be joined to the one before with \"but\" or \"so\"?",
  "Is there a person who wants or loses something?",
  "Does the viewer get a moment to guess before a reveal?",
  "Is the name held back until the idea is felt?",
  "Is there a \"but\" between 30% and 60% of the runtime?",
  "Does every number have a comparison?",
  "Is there a breath every 25 to 40 seconds (45 s and longer)?",
  "Does the opening image return in the last 15%?",
  "Would a friend who knows nothing follow every step?",
  "Is every interesting-but-irrelevant fact cut?",
  "Does the ending land a change, and not a summary?",
];

export const HOOK_PICK_TEST = [
  "Understandable with the sound off.",
  "Has a concrete noun, number or name.",
  "Opens a gap that only this video closes.",
  "True: the body delivers exactly what it promises.",
  "Can be said in 3 seconds.",
];
