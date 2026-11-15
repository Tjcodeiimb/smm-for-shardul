import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "@/app/components/ui";
import type { Snapshot, PostNotes } from "@/lib/posts";
import ReviewClient, { type ReviewPost } from "./ReviewClient";

export const dynamic = "force-dynamic";

// Calendar > Review (v2 brief, section 7.4). Only real logged numbers; no
// invented recommendations.
export default async function ReviewPage() {
  const userId = await requireUserId();
  const rows = await sql<{ id: number; title: string; posted_date: string; video_length: string | null; snapshots: Snapshot[]; log_notes: PostNotes;
    where_left: string; script_id: number | null; duration_s: number | null; type: string | null; funnel_stage: string | null; hook_formula: string | null;
    audience_group: string | null; topic_pillar: string | null }[]>`
    SELECT p.id, p.title, p.posted_date, p.video_length::text, p.snapshots, p.log_notes, p.where_left, p.script_id,
      s.duration_s, s.type, s.funnel_stage, s.hook_formula, s.audience_group, s.topic_pillar
    FROM own_posts p LEFT JOIN scripts s ON s.id = p.script_id AND s.user_id = p.user_id
    WHERE p.user_id = ${userId} ORDER BY p.posted_date DESC`;
  const posts: ReviewPost[] = rows.map((r) => ({
    id: r.id, title: r.title, date: r.posted_date, videoLength: r.video_length ? Number(r.video_length) : null, snapshots: r.snapshots ?? [],
    notes: r.log_notes ?? {}, whereLeft: r.where_left, scriptId: r.script_id,
    layers: { duration: r.duration_s, type: r.type, funnel: r.funnel_stage, hookFormula: r.hook_formula, audience: r.audience_group, pillar: r.topic_pillar },
  }));
  return (
    <div>
      <SectionHeader num="RV" title="Review" description="Posted pieces grouped by one layer, with medians. Groups with fewer than three posts are too few to compare." />
      <ReviewClient posts={posts} />
    </div>
  );
}
