// Client-safe v2 taxonomy: the three classification layers, labels and
// word-budget helpers. No database imports here, so client components can
// use it.

// ---------- The three classification layers (v2 brief, section 9) ----------

export const DURATIONS = [
  { value: 20, label: "20 s", words: [45, 55] },
  { value: 30, label: "30 s", words: [70, 80] },
  { value: 35, label: "35 s", words: [80, 95] },
  { value: 45, label: "45 s", words: [105, 120] },
  { value: 60, label: "60 s", words: [140, 160] },
  { value: 90, label: "60 s+", words: [210, 240] },
] as const;

export const TYPES = [
  { value: "whiteboard", label: "Whiteboard explainer" },
  { value: "history", label: "History story" },
  { value: "authority", label: "Authority" },
  { value: "build", label: "Build" },
] as const;

export const FUNNELS = [
  { value: "tofu", label: "Top of funnel", short: "Top" },
  { value: "mofu", label: "Middle of funnel", short: "Middle" },
  { value: "bofu", label: "Bottom of funnel", short: "Bottom" },
] as const;

// Content status. Scripts store draft/ready/posted on scripts.status; once a
// piece is on the calendar, the calendar status is the more precise one.
export const CONTENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
] as const;

export const PLAYBOOK_GROUPS = [
  { value: "kinds", label: "Kinds of script" },
  { value: "whiteboard", label: "Whiteboard scripts" },
  { value: "production", label: "Production" },
  { value: "look", label: "Look and feel" },
  { value: "writing", label: "Writing" },
  { value: "research", label: "Research standard" },
  { value: "platform", label: "Platform" },
] as const;

export function durationLabel(s: number | null | undefined) {
  return DURATIONS.find((d) => d.value === s)?.label ?? "—";
}
export function typeLabel(t: string | null | undefined) {
  return TYPES.find((x) => x.value === t)?.label ?? "Unclassified";
}
export function funnelLabel(f: string | null | undefined, short = false) {
  const x = FUNNELS.find((y) => y.value === f);
  return x ? (short ? x.short : x.label) : "—";
}

// The duration whose word budget is nearest to this word count (distance to
// the budget range; ties go to the shorter duration). A 60-word script is
// 5 over the 20 s budget and 10 under the 30 s one, so it reads as 20 s.
export function durationForWords(words: number) {
  let best: number = DURATIONS[0].value;
  let bestDist = Infinity;
  for (const d of DURATIONS) {
    const [lo, hi] = d.words;
    const dist = words < lo ? lo - words : words > hi ? words - hi : 0;
    if (dist < bestDist) {
      best = d.value;
      bestDist = dist;
    }
  }
  return best;
}

// ---------- Budgets (v2 brief, section 9.2) ----------

export const WPS = { talk: 2.5, drawing: 2.3 } as const;

export const DURATION_PLAN: Record<number, { beats: string; boardImages: string; rehooks: string; silences: string }> = {
  20: { beats: "4 or 5", boardImages: "1", rehooks: "0", silences: "One long hold on the key number" },
  30: { beats: "5", boardImages: "1", rehooks: "1", silences: "One long hold" },
  35: { beats: "5 or 6", boardImages: "1", rehooks: "1", silences: "One long hold" },
  45: { beats: "7", boardImages: "1 or 2", rehooks: "1 or 2", silences: "1 breath of 1.5 to 4 s" },
  60: { beats: "7", boardImages: "2 or 3", rehooks: "2 or 3", silences: "2 breaths" },
  90: { beats: "7, with an optional second turn", boardImages: "3 or 4", rehooks: "4", silences: "3 breaths" },
};

export function budgetFor(duration: number) {
  const d = DURATIONS.find((x) => x.value === duration) ?? DURATIONS[0];
  return { min: d.words[0], max: d.words[1], label: d.label };
}

// Within 5% of the budget range counts as on budget (section 5.5).
export function budgetStatus(words: number, duration: number) {
  const { min, max } = budgetFor(duration);
  if (words > Math.floor(max * 1.05)) return { state: "over" as const, by: words - max };
  if (words < Math.ceil(min * 0.95)) return { state: "under" as const, by: min - words };
  return { state: "ok" as const, by: 0 };
}

export function estimateSeconds(lines: { say: string; drawing?: boolean }[]) {
  return lines.reduce((t, l) => t + countWords(l.say) / (l.drawing ? WPS.drawing : WPS.talk), 0);
}

// ---------- Beat templates (Appendix A5) ----------

export const SEVEN_BEATS = [
  { beat: "Hook", job: "Open a question the viewer needs closed.", share: "first 3 s" },
  { beat: "Lean-in", job: "Why the viewer should care: a pain, a scene, a stake. A concrete noun in the first 8 s.", share: "about 10%" },
  { beat: "Setup", job: "Who, when, what happened: a name, a year, a place.", share: "about 20%" },
  { beat: "Turn", job: "\"But\": the surprise or failed expectation.", share: "about 10%" },
  { beat: "Mechanism", job: "The idea itself, drawn. One picture, three labels at most.", share: "about 25%" },
  { beat: "Apply", job: "One thing to do today, said as a specific action.", share: "about 15%" },
  { beat: "Payoff and exit", job: "Close the hook's question with a callback. Stop.", share: "10 to 15%" },
] as const;

export function beatTemplate(duration: number) {
  if (duration <= 20) {
    return [
      { beat: "Hook", job: "The question, 8 words or fewer.", share: "first 3 s" },
      { beat: "Fact or scene", job: "One dated fact or scene, with its number.", share: "about 30%" },
      { beat: "Twist", job: "The number or result that breaks the expectation.", share: "about 30%" },
      { beat: "Second proof (optional)", job: "Cut this first if the take runs long.", share: "about 15%" },
      { beat: "Landing", job: "Answer the hook in words. Stop.", share: "about 20%" },
    ];
  }
  if (duration <= 35) {
    return [
      { beat: "Hook", job: "Open a question the viewer needs closed.", share: "first 3 s" },
      { beat: "Lean-in and setup", job: "Why it matters, then who, when, where.", share: "about 30%" },
      { beat: "Turn", job: "\"But\": the surprise.", share: "about 15%" },
      { beat: "Mechanism and apply", job: "The idea, drawn, and one thing to do today.", share: "about 35%" },
      { beat: "Payoff and exit", job: "Callback to the hook. Stop.", share: "about 15%" },
    ];
  }
  return SEVEN_BEATS.map((b) => ({ ...b }));
}

export const TEMPLATES_BY_TYPE: Record<string, string[]> = {
  whiteboard: ["Framework reveal", "The study", "Misconception to correction"],
  history: ["Newton engine", "A historical figure's system", "Origin of an everyday thing", "Then and now"],
  authority: ["Authority take (draft)"],
  build: ["Build log (draft)"],
};

export const PRODUCTION_STYLE: Record<string, string> = {
  whiteboard: "Board-led",
  history: "Cards-led",
  authority: "Face-led",
  build: "Show-and-tell",
};

// How each funnel stage ends (section 9.4 / A9).
export const FUNNEL_ENDING: Record<string, string> = {
  tofu: "The last line answers the hook, then the video stops. At most one specific \"send this to...\" line. Never \"follow for more\".",
  mofu: "One specific question, or one value exchange (\"comment X and I'll send the checklist\").",
  bofu: "One explicit next step, said once, near the end (a DM keyword or the link).",
};

export function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
