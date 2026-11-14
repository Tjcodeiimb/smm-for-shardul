import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { ensureV2Seed } from "@/lib/v2";
import { createIdeaAction } from "@/lib/research-actions";
import { SectionHeader } from "@/app/components/ui";
import IdeasClient, { type Idea } from "./IdeasClient";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const userId = await requireUserId();
  await ensureV2Seed(userId);
  const ideas = await sql<Idea[]>`
    SELECT id, text, board, link, note, suggested_type, score, status FROM ideas
    WHERE user_id = ${userId} ORDER BY (status IN ('used', 'dropped')) ASC, created_at DESC, id DESC`;

  return (
    <div>
      <SectionHeader num="RS" title="Ideas" description="Catch an idea in one line, then score it. Film at 7 or more, rework at 5 or 6, drop at 4 or less." />
      <form action={createIdeaAction} className="mb-8 flex flex-col gap-2 rounded-[28px] bg-card p-4 md:flex-row md:items-center">
        <input name="text" required placeholder="One line: the idea" aria-label="Idea" className="flex-1 border bg-surface px-4 py-2.5 text-sm" />
        <input name="link" placeholder="Link (optional)" aria-label="Link" className="md:w-56 border bg-surface px-4 py-2.5 text-sm" />
        <select name="board" aria-label="Board" className="rounded-full border bg-surface px-3.5 py-2.5 text-sm" defaultValue="favourite">
          <option value="favourite">My favourites</option>
          <option value="proven">Proven elsewhere</option>
        </select>
        <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-deep">Save</button>
      </form>
      <IdeasClient ideas={ideas} />
    </div>
  );
}
