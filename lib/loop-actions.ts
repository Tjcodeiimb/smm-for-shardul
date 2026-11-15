"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";
import { SNAPSHOT_FIELDS, type Snapshot, type PostNotes, type V2Settings, DEFAULT_V2_SETTINGS } from "./posts";
import { DURATIONS, TYPES, FUNNELS } from "./taxonomy";
import { CALENDAR_STATUSES } from "./reference";

// The learning loop (v2 brief, sections 7.2-7.4 and 10.1).

function touch(...paths: string[]) {
  for (const p of ["/analytics", "/insights", "/pipeline", "/calendar", "/dashboard", "/content", ...paths]) revalidatePath(p);
}

// ---------- Calendar status (Week view) ----------

export async function setCalendarStatusAction(input: { id: number; status: string }) {
  await ensureSchema();
  const userId = await requireUserId();
  if (!(CALENDAR_STATUSES as readonly string[]).includes(input.status)) return;
  await sql`UPDATE calendar_items SET status = ${input.status} WHERE id = ${input.id} AND user_id = ${userId}`;
  touch();
}

// Moving a piece to Posted asks for the Reel link and date, and starts its log.
export async function markPostedAction(input: { calendarItemId: number; url: string; date: string; videoLength: number | null }) {
  await ensureSchema();
  const userId = await requireUserId();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false as const, error: "Pick the date it went live." };
  const [c] = await sql<{ id: number; topic: string; script_id: number | null; carousel_id: number | null }[]>`
    SELECT id, topic, script_id, carousel_id FROM calendar_items WHERE id = ${input.calendarItemId} AND user_id = ${userId}`;
  if (!c) return { ok: false as const, error: "That calendar entry no longer exists." };
  let length = input.videoLength;
  if (!length && c.script_id) {
    const [s] = await sql<{ est_seconds: number | null }[]>`SELECT est_seconds FROM scripts WHERE id = ${c.script_id} AND user_id = ${userId}`;
    length = s?.est_seconds ?? null;
  }
  await sql`UPDATE calendar_items SET status = 'posted', date = ${input.date} WHERE id = ${c.id} AND user_id = ${userId}`;
  const [existing] = await sql<{ id: number }[]>`SELECT id FROM own_posts WHERE calendar_item_id = ${c.id} AND user_id = ${userId}`;
  if (existing) {
    await sql`UPDATE own_posts SET reel_url = ${input.url.trim()}, posted_date = ${input.date}, video_length = ${length} WHERE id = ${existing.id}`;
  } else {
    await sql`INSERT INTO own_posts (title, posted_date, calendar_item_id, script_id, carousel_id, reel_url, video_length, user_id)
      VALUES (${c.topic}, ${input.date}, ${c.id}, ${c.script_id}, ${c.carousel_id}, ${input.url.trim()}, ${length}, ${userId})`;
  }
  if (c.script_id) await sql`UPDATE scripts SET status = 'posted' WHERE id = ${c.script_id} AND user_id = ${userId}`;
  touch();
  return { ok: true as const };
}

export async function saveSnapshotAction(input: { postId: number; snapshot: Snapshot; videoLength?: number | null; whereLeft?: string }) {
  await ensureSchema();
  const userId = await requireUserId();
  const at = input.snapshot.at === "7d" ? "7d" : "48h";
  const clean: Snapshot = { at, loggedAt: new Date().toISOString() };
  for (const f of SNAPSHOT_FIELDS) {
    const v = input.snapshot[f.key];
    const num = v === null || v === undefined || v === ("" as unknown) ? null : Number(v);
    (clean as Record<string, unknown>)[f.key] = num !== null && Number.isFinite(num) ? num : null;
  }
  const [row] = await sql<{ snapshots: Snapshot[] }[]>`SELECT snapshots FROM own_posts WHERE id = ${input.postId} AND user_id = ${userId}`;
  if (!row) return;
  const snaps = [...(row.snapshots ?? []).filter((s) => s.at !== at), clean];
  await sql`UPDATE own_posts SET snapshots = ${sql.json(snaps as never)},
    views = ${clean.views ?? 0},
    video_length = COALESCE(${input.videoLength ?? null}, video_length),
    where_left = COALESCE(${input.whereLeft ?? null}, where_left)
    WHERE id = ${input.postId} AND user_id = ${userId}`;
  touch();
}

export async function savePostNotesAction(input: { postId: number; notes: PostNotes }) {
  await ensureSchema();
  const userId = await requireUserId();
  const notes = { worked: input.notes.worked ?? "", didNot: input.notes.didNot ?? "", questions: input.notes.questions ?? "", other: input.notes.other ?? "" };
  await sql`UPDATE own_posts SET log_notes = ${sql.json(notes as never)} WHERE id = ${input.postId} AND user_id = ${userId}`;
  touch();
}

// ---------- Rules and lessons (section 10.1) ----------

const SCOPES = ["hook", "structure", "length", "topic", "delivery", "edit", "audience"];
const LESSON_STATUSES = ["testing", "confirmed", "retired"];

export async function saveRuleAction(input: { id: number | null; text: string; category: string; active: boolean }) {
  await ensureSchema();
  const userId = await requireUserId();
  const text = input.text.trim();
  if (!text) return;
  const category = ["writing", "look", "delivery", "other"].includes(input.category) ? input.category : "writing";
  if (input.id) await sql`UPDATE rules SET text = ${text}, category = ${category}, active = ${input.active} WHERE id = ${input.id} AND user_id = ${userId}`;
  else await sql`INSERT INTO rules (text, category, active, position, user_id) VALUES (${text}, ${category}, ${input.active}, 1000, ${userId})`;
  touch("/settings", "/studio");
}

export async function deleteRuleAction(input: { id: number }) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM rules WHERE id = ${input.id} AND user_id = ${userId}`;
  touch("/settings", "/studio");
}

export type LessonInput = {
  id: number | null;
  text: string;
  scope: string;
  appliesTo: { all?: boolean; duration?: number[]; type?: string[]; funnel?: string[] };
  evidence: string;
  evidencePostIds: number[];
  status: string;
};

export async function saveLessonAction(input: LessonInput) {
  await ensureSchema();
  const userId = await requireUserId();
  const text = input.text.trim();
  if (!text) return { ok: false as const, error: "A lesson needs its text." };
  const a = input.appliesTo ?? {};
  const appliesTo = {
    all: Boolean(a.all) || (!a.duration?.length && !a.type?.length && !a.funnel?.length),
    duration: (a.duration ?? []).map(Number).filter((d) => DURATIONS.some((x) => x.value === d)),
    type: (a.type ?? []).filter((t) => TYPES.some((x) => x.value === t)),
    funnel: (a.funnel ?? []).filter((f) => FUNNELS.some((x) => x.value === f)),
  };
  const scope = SCOPES.includes(input.scope) ? input.scope : "structure";
  const status = LESSON_STATUSES.includes(input.status) ? input.status : "testing";
  const ids = (input.evidencePostIds ?? []).map(Number).filter((x) => Number.isInteger(x) && x > 0);
  if (input.id) {
    await sql`UPDATE lessons SET text = ${text}, scope = ${scope}, applies_to = ${sql.json(appliesTo as never)}, evidence = ${input.evidence},
      evidence_post_ids = ${sql.json(ids as never)}, status = ${status} WHERE id = ${input.id} AND user_id = ${userId}`;
  } else {
    await sql`INSERT INTO lessons (text, scope, applies_to, evidence, evidence_post_ids, status, user_id)
      VALUES (${text}, ${scope}, ${sql.json(appliesTo as never)}, ${input.evidence}, ${sql.json(ids as never)}, ${status}, ${userId})`;
  }
  touch("/settings", "/studio");
  return { ok: true as const };
}

export async function deleteLessonAction(input: { id: number }) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM lessons WHERE id = ${input.id} AND user_id = ${userId}`;
  touch("/settings", "/studio");
}

// ---------- Cadence and earned durations (sections 7.1, 9.2) ----------

export async function saveV2SettingsAction(input: V2Settings) {
  await ensureSchema();
  const userId = await requireUserId();
  const value: V2Settings = {
    earned: (input.earned ?? []).map(Number).filter((d) => DURATIONS.some((x) => x.value === d)),
    perWeek: Math.max(0, Math.min(21, Math.round(Number(input.perWeek) || DEFAULT_V2_SETTINGS.perWeek))),
    days: (input.days ?? []).filter((d) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(d)),
    time: String(input.time ?? "").slice(0, 40),
  };
  await sql`INSERT INTO brand_config (key, value, user_id) VALUES ('v2_settings', ${JSON.stringify(value)}, ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO UPDATE SET value = EXCLUDED.value`;
  touch("/settings", "/studio");
}
