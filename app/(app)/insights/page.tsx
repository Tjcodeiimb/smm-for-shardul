import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader, PageSection } from "@/app/components/ui";

type HookStack = {
  id: number;
  written: string;
  verbal: string;
  visual: string;
  angle: string;
  topic: string;
  created_at: string;
};

type Post = {
  id: number;
  views: number;
  followers_at_post: number;
  pillar: string;
};

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const userId = await requireUserId();
  const [hooks, posts] = await Promise.all([
    sql<HookStack[]>`SELECT * FROM hook_stacks WHERE user_id = ${userId} AND saved = TRUE ORDER BY created_at DESC LIMIT 8`,
    sql<Post[]>`SELECT id, views, followers_at_post, pillar FROM own_posts WHERE user_id = ${userId}`,
  ]);

  // Format performance: average views per pillar, only shown once there's
  // enough logged data for it to mean anything.
  const byPillar = new Map<string, { total: number; count: number }>();
  for (const p of posts) {
    const entry = byPillar.get(p.pillar) || { total: 0, count: 0 };
    entry.total += p.views;
    entry.count += 1;
    byPillar.set(p.pillar, entry);
  }
  const formatPerformance = [...byPillar.entries()]
    .map(([pillar, { total, count }]) => ({ pillar, avgViews: Math.round(total / count), count }))
    .sort((a, b) => b.avgViews - a.avgViews);
  const maxAvgViews = Math.max(1, ...formatPerformance.map((f) => f.avgViews));
  const hasEnoughPosts = posts.length >= 3;

  return (
    <div>
      <SectionHeader
        num="IN"
        title="Insights"
        description="What's actually working for your account, learned from the posts and hooks you've logged."
      />

      <PageSection title="Hooks that perform" description="Your most recently saved hooks from the Hook Lab.">
        <div className="rounded-[28px] bg-card p-2">
          {hooks.length === 0 ? (
            <p className="text-sm text-muted p-4">No saved hooks yet. Save a few in the Hook Lab to see them here.</p>
          ) : (
            hooks.map((h) => (
              <div key={h.id} className="flex items-center gap-4 rounded-[18px] px-4 py-3.5 hover:bg-surface">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{h.written || h.verbal || "(no hook text)"}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {[h.angle, h.topic].filter(Boolean).join(" · ") || "No angle or topic set"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PageSection>

      <PageSection title="Format performance" description="Average views by content pillar, from your logged posts.">
        {hasEnoughPosts ? (
          <div className="rounded-[28px] bg-card p-6 space-y-4">
            {formatPerformance.map((f) => (
              <div key={f.pillar}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="capitalize">{f.pillar}</span>
                  <span className="tabular-nums text-muted">{f.avgViews.toLocaleString()} avg views</span>
                </div>
                <div className="h-2.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(f.avgViews / maxAvgViews) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted pt-2">Based on {posts.length} logged posts. Averages get more reliable as you log more.</p>
          </div>
        ) : (
          <div className="rounded-[28px] bg-card p-6">
            <p className="text-sm text-muted">Log a few posts in Analytics to see format performance here.</p>
          </div>
        )}
      </PageSection>
    </div>
  );
}
