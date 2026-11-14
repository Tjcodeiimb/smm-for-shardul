"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";

// Delete for Content (v2 brief, section 6.3). Every query is scoped to the
// signed-in user. Deleting a script also removes its calendar entries and
// versions (FK cascade); logged posts in own_posts are real history, so they
// are kept and only their link is cleared.

export type DeleteResult = { ok: true; scripts: number; carousels: number; calendar: number } | { ok: false; error: string };

function revalidateAll() {
  for (const p of ["/content", "/calendar", "/pipeline", "/dashboard", "/settings"]) revalidatePath(p);
}

async function deleteScriptIds(userId: number, ids: number[]) {
  if (ids.length === 0) return { scripts: 0, calendar: 0 };
  const cal = await sql`DELETE FROM calendar_items WHERE user_id = ${userId} AND script_id = ANY(${ids}::int[])`;
  await sql`UPDATE own_posts SET script_id = NULL WHERE user_id = ${userId} AND script_id = ANY(${ids}::int[])`;
  await sql`UPDATE carousels SET parent_script_id = NULL WHERE user_id = ${userId} AND parent_script_id = ANY(${ids}::int[])`;
  const del = await sql`DELETE FROM scripts WHERE user_id = ${userId} AND id = ANY(${ids}::int[])`;
  return { scripts: del.count, calendar: cal.count };
}

async function deleteCarouselIds(userId: number, ids: number[]) {
  if (ids.length === 0) return { carousels: 0, calendar: 0 };
  const cal = await sql`DELETE FROM calendar_items WHERE user_id = ${userId} AND carousel_id = ANY(${ids}::int[])`;
  await sql`UPDATE own_posts SET carousel_id = NULL WHERE user_id = ${userId} AND carousel_id = ANY(${ids}::int[])`;
  const del = await sql`DELETE FROM carousels WHERE user_id = ${userId} AND id = ANY(${ids}::int[])`;
  return { carousels: del.count, calendar: cal.count };
}

function cleanIds(ids: unknown): number[] {
  return Array.isArray(ids) ? ids.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
}

// Single item, selected items, or "delete all N shown". Bulk deletes (more
// than one item) must send the typed count, which the server re-checks.
export async function deleteContentAction(input: { scriptIds: number[]; carouselIds: number[]; confirmCount?: number }): Promise<DeleteResult> {
  await ensureSchema();
  const userId = await requireUserId();
  const scriptIds = cleanIds(input.scriptIds);
  const carouselIds = cleanIds(input.carouselIds);
  const total = scriptIds.length + carouselIds.length;
  if (total === 0) return { ok: false, error: "Nothing selected." };
  if (total > 1 && input.confirmCount !== total) return { ok: false, error: `Type ${total} to confirm.` };
  const s = await deleteScriptIds(userId, scriptIds);
  const c = await deleteCarouselIds(userId, carouselIds);
  revalidateAll();
  return { ok: true, scripts: s.scripts, carousels: c.carousels, calendar: s.calendar + c.calendar };
}

// Settings > Danger zone. Three separate actions, each confirmed by typing
// the count shown. "Delete all scripts" keeps reference scripts unless asked.
export async function deleteAllScriptsAction(input: { confirmCount: number; includeReferences: boolean }): Promise<DeleteResult> {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = input.includeReferences
    ? await sql<{ id: number }[]>`SELECT id FROM scripts WHERE user_id = ${userId}`
    : await sql<{ id: number }[]>`SELECT id FROM scripts WHERE user_id = ${userId} AND NOT is_reference`;
  if (input.confirmCount !== rows.length) return { ok: false, error: `Type ${rows.length} to confirm.` };
  const s = await deleteScriptIds(userId, rows.map((r) => r.id));
  revalidateAll();
  return { ok: true, scripts: s.scripts, carousels: 0, calendar: s.calendar };
}

export async function deleteAllCarouselsAction(input: { confirmCount: number }): Promise<DeleteResult> {
  await ensureSchema();
  const userId = await requireUserId();
  const rows = await sql<{ id: number }[]>`SELECT id FROM carousels WHERE user_id = ${userId}`;
  if (input.confirmCount !== rows.length) return { ok: false, error: `Type ${rows.length} to confirm.` };
  const c = await deleteCarouselIds(userId, rows.map((r) => r.id));
  revalidateAll();
  return { ok: true, scripts: 0, carousels: c.carousels, calendar: c.calendar };
}

export async function clearCalendarAction(input: { confirmCount: number }): Promise<DeleteResult> {
  await ensureSchema();
  const userId = await requireUserId();
  const [{ n }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM calendar_items WHERE user_id = ${userId}`;
  if (input.confirmCount !== n) return { ok: false, error: `Type ${n} to confirm.` };
  const del = await sql`DELETE FROM calendar_items WHERE user_id = ${userId}`;
  revalidateAll();
  return { ok: true, scripts: 0, carousels: 0, calendar: del.count };
}

// The one-time "starter library" banner in Content (section 6.3, rule 6).
export async function deleteStarterContentAction(input: { confirmCount: number }): Promise<DeleteResult> {
  await ensureSchema();
  const userId = await requireUserId();
  const s = await sql<{ id: number }[]>`SELECT id FROM scripts WHERE user_id = ${userId} AND source = 'seed'`;
  const c = await sql<{ id: number }[]>`SELECT id FROM carousels WHERE user_id = ${userId} AND source = 'seed'`;
  if (input.confirmCount !== s.length + c.length) return { ok: false, error: `Type ${s.length + c.length} to confirm.` };
  const rs = await deleteScriptIds(userId, s.map((r) => r.id));
  const rc = await deleteCarouselIds(userId, c.map((r) => r.id));
  await dismissStarterBannerAction();
  revalidateAll();
  return { ok: true, scripts: rs.scripts, carousels: rc.carousels, calendar: rs.calendar + rc.calendar };
}

export async function dismissStarterBannerAction() {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`
    INSERT INTO brand_config (key, value, user_id) VALUES ('v2_starter_banner_dismissed', 'true', ${userId})
    ON CONFLICT (COALESCE(user_id, 0), key) DO NOTHING
  `;
  revalidatePath("/content");
}

export async function setReferenceAction(input: { kind: "script" | "carousel"; id: number; value: boolean }) {
  await ensureSchema();
  const userId = await requireUserId();
  if (input.kind === "script") await sql`UPDATE scripts SET is_reference = ${input.value} WHERE id = ${input.id} AND user_id = ${userId}`;
  else await sql`UPDATE carousels SET is_reference = ${input.value} WHERE id = ${input.id} AND user_id = ${userId}`;
  revalidatePath("/content");
}

export async function scheduleContentAction(input: { kind: "script" | "carousel"; id: number; date: string }) {
  await ensureSchema();
  const userId = await requireUserId();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return;
  if (input.kind === "script") {
    const [s] = await sql<{ title: string; funnel_stage: string; pillar: string; content_type: string; format: string }[]>`
      SELECT title, funnel_stage, pillar, content_type, format FROM scripts WHERE id = ${input.id} AND user_id = ${userId}`;
    if (!s) return;
    await sql`INSERT INTO calendar_items (date, pillar, content_type, topic, format, funnel_stage, status, script_id, user_id)
      VALUES (${input.date}, ${s.pillar}, ${s.content_type}, ${s.title}, ${s.format}, ${s.funnel_stage}, 'scripted', ${input.id}, ${userId})`;
  } else {
    const [c] = await sql<{ title: string; funnel_stage: string; pillar: string; content_type: string }[]>`
      SELECT title, funnel_stage, pillar, content_type FROM carousels WHERE id = ${input.id} AND user_id = ${userId}`;
    if (!c) return;
    await sql`INSERT INTO calendar_items (date, pillar, content_type, topic, format, funnel_stage, status, carousel_id, user_id)
      VALUES (${input.date}, ${c.pillar}, ${c.content_type}, ${c.title}, 'Carousel', ${c.funnel_stage}, 'scripted', ${input.id}, ${userId})`;
  }
  revalidateAll();
}
