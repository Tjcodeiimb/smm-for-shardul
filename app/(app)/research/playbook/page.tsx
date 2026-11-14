import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { ensureV2Seed } from "@/lib/v2";
import { SectionHeader } from "@/app/components/ui";
import PlaybookClient, { type Card } from "./PlaybookClient";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const userId = await requireUserId();
  await ensureV2Seed(userId);
  const cards = await sql<Card[]>`
    SELECT id, key, title, body, grp, use_in_prompts FROM playbook_cards
    WHERE user_id = ${userId} ORDER BY position ASC, id ASC`;
  return (
    <div>
      <SectionHeader
        num="PB"
        title="Playbook"
        description="What kinds of script you make, how they're produced and how they look. Cards switched on for prompts shape every script Studio writes."
      />
      <PlaybookClient cards={cards} />
    </div>
  );
}
