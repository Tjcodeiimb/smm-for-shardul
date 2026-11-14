"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { updateBrand, BrandConfig } from "./brand";
import { requireUserId } from "./auth";
import { countWords, durationForWords } from "./taxonomy";

function val(fd: FormData, key: string, fallback = "") {
  const v = fd.get(key);
  return v === null || v === "" ? fallback : String(v);
}
function num(fd: FormData, key: string, fallback = 0) {
  const v = fd.get(key);
  const n = Number(v);
  return v === null || Number.isNaN(n) ? fallback : n;
}
function id(fd: FormData) {
  return num(fd, "id");
}

// ---------- Brand ----------
export async function saveBrandAction(partial: Partial<BrandConfig>) {
  const userId = await requireUserId();
  await updateBrand(userId, partial);
  revalidatePath("/brand");
  revalidatePath("/dashboard");
}

// ---------- Calendar ----------
export async function createCalendarItem(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO calendar_items (date, pillar, concept_bucket, content_type, topic, angle, format, cta_type, funnel_stage, status, notes, user_id)
    VALUES (${val(fd, "date")}, ${val(fd, "pillar", "authority")}, ${val(fd, "concept_bucket", "proven")}, ${val(fd, "content_type", "educational")}, ${val(fd, "topic")}, ${val(fd, "angle")}, ${val(fd, "format")}, ${val(fd, "cta_type", "follow")}, ${val(fd, "funnel_stage", "tofu")}, ${val(fd, "status", "idea")}, ${val(fd, "notes")}, ${userId})
  `;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/content");
}

export async function updateCalendarItemStatus(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE calendar_items SET status = ${val(fd, "status", "idea")} WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/content");
  revalidatePath("/pipeline");
}

export async function deleteCalendarItem(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM calendar_items WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/content");
}

// Schedules an existing script onto a calendar date, used by both the
// Calendar page's day picker and the Script Library's "Add to calendar"
// button. Denormalizes the script's fields onto the calendar_items row (as
// every other batch import does) while keeping a real script_id link back,
// so the calendar entry stays accurate even as the script list grows.
export async function scheduleScriptToCalendar(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  const scriptId = num(fd, "script_id");
  const date = val(fd, "date");
  if (!scriptId || !date) return;

  const rows = await sql<
    {
      title: string;
      pillar: string;
      content_type: string;
      angle_or_story_type: string;
      format: string;
      cta_type: string;
      funnel_stage: string;
      effort: string;
      topic_tag: string;
      segment: string;
    }[]
  >`SELECT title, pillar, content_type, angle_or_story_type, format, cta_type, funnel_stage, effort, topic_tag, segment FROM scripts WHERE id = ${scriptId} AND user_id = ${userId}`;
  const script = rows[0];
  if (!script) return;

  await sql`
    INSERT INTO calendar_items (
      date, pillar, concept_bucket, content_type, topic, angle, format, cta_type, funnel_stage,
      status, notes, effort, topic_tag, segment, script_id, user_id
    ) VALUES (
      ${date}, ${script.pillar}, 'proven', ${script.content_type}, ${script.title}, ${script.angle_or_story_type},
      ${script.format}, ${script.cta_type}, ${script.funnel_stage}, 'scheduled', '', ${script.effort},
      ${script.topic_tag}, ${script.segment}, ${scriptId}, ${userId}
    )
  `;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/content");
  revalidatePath("/content");
}

// Clears every scheduled date while leaving all scripts in the Script
// Library untouched -- lets the calendar restart clean without losing any
// written content.
export async function resetCalendarAction() {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM calendar_items WHERE user_id = ${userId}`;
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/content");
}

// ---------- Outlier research ----------
export async function createOutlier(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO outlier_research (source_type, creator_handle, link, niche_keyword, follower_count, views, hook_written, hook_verbal, hook_visual, angle, notes, principle, user_id)
    VALUES (${val(fd, "source_type", "keyword")}, ${val(fd, "creator_handle")}, ${val(fd, "link")}, ${val(fd, "niche_keyword")}, ${num(fd, "follower_count")}, ${num(fd, "views")}, ${val(fd, "hook_written")}, ${val(fd, "hook_verbal")}, ${val(fd, "hook_visual")}, ${val(fd, "angle")}, ${val(fd, "notes")}, ${val(fd, "principle")}, ${userId})
  `;
  revalidatePath("/research/references");
}

export async function toggleOutlierUsed(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE outlier_research SET used = NOT used WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/research/references");
}

export async function deleteOutlier(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM outlier_research WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/research/references");
}

export type BulkOutlierRow = {
  source_type: string;
  creator_handle: string;
  link: string;
  niche_keyword: string;
  follower_count: number;
  views: number;
  hook_written: string;
  hook_verbal: string;
  hook_visual: string;
  angle: string;
  notes: string;
};

export async function createOutliersBulk(rows: BulkOutlierRow[]) {
  if (rows.length === 0) return;
  await ensureSchema();
  const userId = await requireUserId();
  const rowsWithUser = rows.map((r) => ({ ...r, user_id: userId }));
  await sql`
    INSERT INTO outlier_research ${sql(
      rowsWithUser,
      "source_type",
      "creator_handle",
      "link",
      "niche_keyword",
      "follower_count",
      "views",
      "hook_written",
      "hook_verbal",
      "hook_visual",
      "angle",
      "notes",
      "user_id"
    )}
  `;
  revalidatePath("/research/references");
}

// ---------- Hook stacks ----------
export async function createHookStack(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO hook_stacks (written, verbal, visual, angle, topic, user_id)
    VALUES (${val(fd, "written")}, ${val(fd, "verbal")}, ${val(fd, "visual")}, ${val(fd, "angle")}, ${val(fd, "topic")}, ${userId})
  `;
  revalidatePath("/hooks");
}

export async function deleteHookStack(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM hook_stacks WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/hooks");
}

// ---------- Scripts ----------
export async function createScript(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  const words = countWords(val(fd, "body_black"));
  await sql`
    INSERT INTO scripts (title, pillar, content_type, angle_or_story_type, format, body_black, body_red, body_green, cta_type, funnel_stage, status, series_name,
      word_count, est_seconds, duration_s, source, user_id)
    VALUES (${val(fd, "title", "Untitled script")}, ${val(fd, "pillar", "authority")}, ${val(fd, "content_type", "educational")}, ${val(fd, "angle_or_story_type")}, ${val(fd, "format")}, ${val(fd, "body_black")}, ${val(fd, "body_red")}, ${val(fd, "body_green")}, ${val(fd, "cta_type", "follow")}, ${val(fd, "funnel_stage", "tofu")}, ${val(fd, "status", "draft")}, ${val(fd, "series_name")},
      ${words}, ${Math.round(words / 2.5)}, ${durationForWords(words)}, 'studio', ${userId})
  `;
  revalidatePath("/scripts");
  revalidatePath("/content");
  revalidatePath("/production");
}

export async function deleteScript(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM scripts WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/scripts");
  revalidatePath("/production");
}

export async function createScriptTemplate(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO script_templates (name, pillar, angle, source_note, template_text, user_id)
    VALUES (${val(fd, "name", "Untitled template")}, ${val(fd, "pillar", "authority")}, ${val(fd, "angle")}, ${val(fd, "source_note")}, ${val(fd, "template_text")}, ${userId})
  `;
  revalidatePath("/scripts");
}

export async function deleteScriptTemplate(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM script_templates WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/scripts");
}

// ---------- Own posts / analytics ----------
export async function createOwnPost(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO own_posts (title, posted_date, views, followers_at_post, pillar, notes, user_id)
    VALUES (${val(fd, "title")}, ${val(fd, "posted_date")}, ${num(fd, "views")}, ${num(fd, "followers_at_post")}, ${val(fd, "pillar", "authority")}, ${val(fd, "notes")}, ${userId})
  `;
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function deleteOwnPost(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM own_posts WHERE id = ${id(fd)} AND user_id = ${userId}`;
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}
