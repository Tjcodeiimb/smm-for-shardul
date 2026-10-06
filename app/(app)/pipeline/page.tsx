import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "@/app/components/ui";
import PipelineBoard, { type PipelineItem } from "./PipelineBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const userId = await requireUserId();
  const items = await sql<PipelineItem[]>`
    SELECT id, date, pillar, topic, format, status
    FROM calendar_items
    WHERE user_id = ${userId}
    ORDER BY date ASC
  `;

  return (
    <div>
      <SectionHeader
        num="P"
        title="Pipeline"
        description="Every video from idea to posted. Move cards between stages as work moves along."
      />
      <PipelineBoard items={items} />
    </div>
  );
}
