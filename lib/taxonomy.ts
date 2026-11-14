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

// Nearest of the six durations for a spoken word count (2.5 words per second).
export function durationForWords(words: number) {
  if (words <= 55) return 20;
  if (words <= 80) return 30;
  if (words <= 95) return 35;
  if (words <= 120) return 45;
  if (words <= 160) return 60;
  return 90;
}

export function countWords(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
