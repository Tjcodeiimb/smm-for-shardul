"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";

// Research > Ideas, References and Playbook (v2 brief, section 8).

const IDEA_BOARDS = ["proven", "favourite"];
const IDEA_STATUSES = ["new", "researching", "ready", "used", "dropped"];

function str(fd: FormData, k: string) {
  return String(fd.get(k) ?? "").trim();
}
function intId(fd: FormData, k = "id") {
  const n = Number(fd.get(k));
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export async function createIdeaAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  const text = str(fd, "text");
  if (!text) return;
  const board = IDEA_BOARDS.includes(str(fd, "board")) ? str(fd, "board") : "favourite";
  await sql`INSERT INTO ideas (text, link, board, user_id) VALUES (${text}, ${str(fd, "link")}, ${board}, ${userId})`;
  revalidatePath("/research");
  revalidatePath("/dashboard");
}

export async function updateIdeaAction(input: { id: number; board?: string; status?: string; score?: boolean[]; note?: string }) {
  await ensureSchema();
  const userId = await requireUserId();
  if (input.board && IDEA_BOARDS.includes(input.board)) await sql`UPDATE ideas SET board = ${input.board} WHERE id = ${input.id} AND user_id = ${userId}`;
  if (input.status && IDEA_STATUSES.includes(input.status)) await sql`UPDATE ideas SET status = ${input.status} WHERE id = ${input.id} AND user_id = ${userId}`;
  if (input.score && input.score.length === 10) {
    const checks = input.score.map(Boolean);
    await sql`UPDATE ideas SET score = ${sql.json({ checks, total: checks.filter(Boolean).length } as never)} WHERE id = ${input.id} AND user_id = ${userId}`;
  }
  if (typeof input.note === "string") await sql`UPDATE ideas SET note = ${input.note.trim()} WHERE id = ${input.id} AND user_id = ${userId}`;
  revalidatePath("/research");
  revalidatePath("/dashboard");
}

export async function deleteIdeaAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM ideas WHERE id = ${intId(fd)} AND user_id = ${userId}`;
  revalidatePath("/research");
  revalidatePath("/dashboard");
}

// References > "Make it an idea": an outlier becomes an idea on the
// "Proven elsewhere" board, linked back to the reference.
export async function promoteOutlierToIdeaAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  const id = intId(fd);
  const [o] = await sql<{ creator_handle: string; hook_written: string; hook_verbal: string; principle: string; link: string; niche_keyword: string }[]>`
    SELECT creator_handle, hook_written, hook_verbal, principle, link, niche_keyword FROM outlier_research WHERE id = ${id} AND user_id = ${userId}`;
  if (!o) return;
  const text = o.principle || o.hook_verbal || o.hook_written || o.niche_keyword || `Idea from ${o.creator_handle || "a reference"}`;
  const note = [o.creator_handle && `From ${o.creator_handle}`, o.hook_verbal && `Their hook: "${o.hook_verbal}"`].filter(Boolean).join(". ");
  await sql`INSERT INTO ideas (text, link, note, board, reference_id, user_id) VALUES (${text}, ${o.link}, ${note}, 'proven', ${id}, ${userId})`;
  await sql`UPDATE outlier_research SET used = TRUE WHERE id = ${id} AND user_id = ${userId}`;
  revalidatePath("/research");
  revalidatePath("/research/references");
}

// ---------- Playbook cards ----------

export async function savePlaybookCardAction(input: { id: number | null; title: string; body: string; grp: string; useInPrompts: boolean }) {
  await ensureSchema();
  const userId = await requireUserId();
  const title = input.title.trim();
  if (!title) return { ok: false as const, error: "A card needs a title." };
  if (input.id) {
    await sql`UPDATE playbook_cards SET title = ${title}, body = ${input.body}, grp = ${input.grp}, use_in_prompts = ${input.useInPrompts}, updated_at = now()
      WHERE id = ${input.id} AND user_id = ${userId}`;
  } else {
    const key = `custom-${Date.now()}`;
    await sql`INSERT INTO playbook_cards (key, title, body, grp, use_in_prompts, position, user_id)
      VALUES (${key}, ${title}, ${input.body}, ${input.grp}, ${input.useInPrompts}, 1000, ${userId})`;
  }
  revalidatePath("/research/playbook");
  return { ok: true as const };
}

export async function setPlaybookCardInPromptsAction(input: { id: number; value: boolean }) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE playbook_cards SET use_in_prompts = ${input.value}, updated_at = now() WHERE id = ${input.id} AND user_id = ${userId}`;
  revalidatePath("/research/playbook");
}

export async function deletePlaybookCardAction(input: { id: number }) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM playbook_cards WHERE id = ${input.id} AND user_id = ${userId}`;
  revalidatePath("/research/playbook");
}
