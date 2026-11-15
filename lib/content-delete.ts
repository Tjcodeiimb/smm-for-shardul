import { sql } from "./db";

// The cascade behind every delete in Content and Settings (v2 brief,
// section 6.3), kept out of the "use server" file so it can be tested
// directly. Calendar entries and versions go with the script; logged posts
// are real history, so they stay and only their link is cleared. Everything
// is scoped to the given user.

export async function deleteScriptIds(userId: number, ids: number[]) {
  if (ids.length === 0) return { scripts: 0, calendar: 0 };
  const cal = await sql`DELETE FROM calendar_items WHERE user_id = ${userId} AND script_id = ANY(${ids}::int[])`;
  await sql`UPDATE own_posts SET script_id = NULL WHERE user_id = ${userId} AND script_id = ANY(${ids}::int[])`;
  await sql`UPDATE carousels SET parent_script_id = NULL WHERE user_id = ${userId} AND parent_script_id = ANY(${ids}::int[])`;
  const del = await sql`DELETE FROM scripts WHERE user_id = ${userId} AND id = ANY(${ids}::int[])`;
  return { scripts: del.count, calendar: cal.count };
}

export async function deleteCarouselIds(userId: number, ids: number[]) {
  if (ids.length === 0) return { carousels: 0, calendar: 0 };
  const cal = await sql`DELETE FROM calendar_items WHERE user_id = ${userId} AND carousel_id = ANY(${ids}::int[])`;
  await sql`UPDATE own_posts SET carousel_id = NULL WHERE user_id = ${userId} AND carousel_id = ANY(${ids}::int[])`;
  const del = await sql`DELETE FROM carousels WHERE user_id = ${userId} AND id = ANY(${ids}::int[])`;
  return { carousels: del.count, calendar: cal.count };
}

