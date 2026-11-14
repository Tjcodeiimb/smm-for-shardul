import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "@/app/components/ui";
import type { Snapshot, PostNotes } from "@/lib/posts";
import PostsClient, { type PostRow, type Unlogged } from "./PostsClient";

export const dynamic = "force-dynamic";

// Calendar > Posts: the post log (v2 brief, section 7.3).
export default async function PostsPage() {
  const userId = await requireUserId();
  const [posts, unlogged] = await Promise.all([
    sql<{ id: number; title: string; posted_date: string; reel_url: string; video_length: string | null; snapshots: Snapshot[]; where_left: string;
      log_notes: PostNotes; views: number; script_id: number | null; duration_s: number | null; type: string | null; funnel_stage: string | null;
      hook_formula: string | null }[]>`
      SELECT p.id, p.title, p.posted_date, p.reel_url, p.video_length::text, p.snapshots, p.where_left, p.log_notes, p.views, p.script_id,
        s.duration_s, s.type, s.funnel_stage, s.hook_formula
      FROM own_posts p LEFT JOIN scripts s ON s.id = p.script_id AND s.user_id = p.user_id
      WHERE p.user_id = ${userId} ORDER BY p.posted_date DESC, p.id DESC`,
    sql<Unlogged[]>`
      SELECT c.id, c.date, c.topic, c.status FROM calendar_items c
      WHERE c.user_id = ${userId} AND c.status IN ('edited', 'posted')
        AND NOT EXISTS (SELECT 1 FROM own_posts p WHERE p.calendar_item_id = c.id)
      ORDER BY c.date DESC LIMIT 30`,
  ]);
  const rows: PostRow[] = posts.map((p) => ({
    id: p.id, title: p.title, date: p.posted_date, url: p.reel_url, videoLength: p.video_length ? Number(p.video_length) : null,
    snapshots: p.snapshots ?? [], whereLeft: p.where_left, notes: p.log_notes ?? {}, legacyViews: p.views, scriptId: p.script_id,
    layers: { duration: p.duration_s, type: p.type, funnel: p.funnel_stage, hookFormula: p.hook_formula },
  }));
  return (
    <div>
      <SectionHeader num="PL" title="Posts" description="Log each post's numbers at 48 hours and again at 7 days, and write what you noticed. Lessons you save here shape every future script." />
      <PostsClient posts={rows} unlogged={unlogged} today={new Date().toISOString().slice(0, 10)} />
    </div>
  );
}
