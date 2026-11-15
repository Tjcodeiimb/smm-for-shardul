import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import type { Fact } from "@/lib/checks";
import { SectionHeader } from "@/app/components/ui";
import BriefsClient, { type BriefRow } from "./BriefsClient";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const userId = await requireUserId();
  const rows = await sql<{ id: number; question: string; answer: string; facts: Fact[]; anchors: { text: string; source: string }[]; twist: string; do_not_say: string; checked_on: string }[]>`
    SELECT id, question, answer, facts, anchors, twist, do_not_say, checked_on FROM briefs WHERE user_id = ${userId} ORDER BY created_at DESC`;
  const briefs: BriefRow[] = rows.map((r) => ({ id: r.id, question: r.question, answer: r.answer, facts: r.facts ?? [], anchors: r.anchors ?? [], twist: r.twist, doNotSay: r.do_not_say, checkedOn: r.checked_on }));
  return (
    <div>
      <SectionHeader num="BR" title="Briefs" description="The verified research for one topic. Studio may only state facts that are in a brief, and only Verified facts pass its fact check." />
      <BriefsClient briefs={briefs} />
    </div>
  );
}
