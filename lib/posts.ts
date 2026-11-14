// Post log maths (v2 brief, sections 7.3 and 7.4). Client-safe.

export type Snapshot = {
  at: "48h" | "7d";
  views?: number | null;
  reached?: number | null;
  nonFollowerPct?: number | null;
  avgWatch?: number | null; // seconds
  skipRate?: number | null; // % skipped in the first 3 s
  likes?: number | null;
  comments?: number | null;
  sends?: number | null;
  saves?: number | null;
  follows?: number | null;
  loggedAt?: string;
};

export const SNAPSHOT_FIELDS: { key: keyof Snapshot; label: string; group: "Reach" | "Retention" | "Response"; unit?: string }[] = [
  { key: "views", label: "Views", group: "Reach" },
  { key: "reached", label: "Accounts reached", group: "Reach" },
  { key: "nonFollowerPct", label: "Share from non-followers", group: "Reach", unit: "%" },
  { key: "avgWatch", label: "Average watch time", group: "Retention", unit: "s" },
  { key: "skipRate", label: "Skip rate, first 3 s", group: "Retention", unit: "%" },
  { key: "likes", label: "Likes", group: "Response" },
  { key: "comments", label: "Comments", group: "Response" },
  { key: "sends", label: "Sends", group: "Response" },
  { key: "saves", label: "Saves", group: "Response" },
  { key: "follows", label: "Follows gained", group: "Response" },
];

export type PostNotes = { worked?: string; didNot?: string; questions?: string; other?: string };

// The 7-day numbers win once they exist.
export function latestSnapshot(snaps: Snapshot[] | null | undefined): Snapshot | null {
  if (!snaps?.length) return null;
  return snaps.find((s) => s.at === "7d") ?? snaps.find((s) => s.at === "48h") ?? null;
}

const n = (x: number | null | undefined) => (typeof x === "number" && Number.isFinite(x) ? x : null);

export function metrics(snap: Snapshot | null, videoLength: number | null | undefined) {
  if (!snap) return { watchThrough: null, sendsPer1k: null, savesPer1k: null, followsPer1k: null, skipRate: null };
  const reach = n(snap.reached);
  const per1k = (v: number | null | undefined) => (reach && n(v) !== null ? (n(v)! / reach) * 1000 : null);
  const len = n(videoLength ?? null);
  return {
    watchThrough: len && n(snap.avgWatch) !== null ? n(snap.avgWatch)! / len : null,
    sendsPer1k: per1k(snap.sends),
    savesPer1k: per1k(snap.saves),
    followsPer1k: per1k(snap.follows),
    skipRate: n(snap.skipRate),
  };
}

export function median(values: (number | null)[]) {
  const v = values.filter((x): x is number => x !== null).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

// Which snapshot is due: the 48-hour one from 2 days after posting, the
// 7-day one from 7 days after.
export function dueSnapshots(postedDate: string, snaps: Snapshot[], today = new Date()) {
  const days = (today.getTime() - new Date(`${postedDate}T00:00:00Z`).getTime()) / 86400000;
  const has = (at: string) => snaps.some((s) => s.at === at);
  const due: ("48h" | "7d")[] = [];
  if (days >= 2 && !has("48h")) due.push("48h");
  if (days >= 7 && !has("7d")) due.push("7d");
  return due;
}

export const REVIEW_GROUPS = [
  { value: "duration", label: "Duration" },
  { value: "type", label: "Type" },
  { value: "funnel", label: "Funnel" },
  { value: "hookFormula", label: "Hook formula" },
  { value: "audience", label: "Audience group" },
  { value: "pillar", label: "Topic pillar" },
] as const;

export type V2Settings = { earned: number[]; perWeek: number; days: string[]; time: string };
export const DEFAULT_V2_SETTINGS: V2Settings = { earned: [20, 30, 35, 45], perWeek: 3, days: ["Mon", "Wed", "Sat"], time: "19:30 IST" };
