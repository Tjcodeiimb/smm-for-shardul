import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "@/app/components/ui";
import WeekBoard, { type WeekItem } from "./WeekBoard";

export const dynamic = "force-dynamic";

// Calendar > Week, the planner (v2 brief, section 7.2).
export default async function WeekPage() {
  const userId = await requireUserId();
  const items = await sql<WeekItem[]>`
    SELECT c.id, c.date, c.topic, c.status, c.script_id, c.carousel_id, s.duration_s, s.type
    FROM calendar_items c LEFT JOIN scripts s ON s.id = c.script_id AND s.user_id = c.user_id
    WHERE c.user_id = ${userId} ORDER BY c.date ASC, c.id ASC`;
  return (
    <div>
      <SectionHeader num="WK" title="Week" description="Every piece from idea to reviewed. Drag a card to change its status; tick scripted cards to export one shoot sheet for a recording session." />
      <WeekBoard items={[...items]} today={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
