import Link from "next/link";
import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { ensureV2Seed } from "@/lib/v2";
import { AREAS } from "@/app/components/nav-config";

export const dynamic = "force-dynamic";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Home (v2 brief, section 4.1): four doors, one live number each, and a
// single "This week" strip. Nothing else.
export default async function HomePage() {
  const userId = await requireUserId();
  await ensureV2Seed(userId);

  const today = new Date();
  const dow = (today.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - dow);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setUTCDate(today.getUTCDate() - 14);

  const [[n], upcoming, awaiting] = await Promise.all([
    sql<{ ideas: number; drafts: number; content: number; week: number }[]>`
      SELECT
        (SELECT count(*)::int FROM ideas WHERE user_id = ${userId} AND status IN ('new', 'researching', 'ready')) AS ideas,
        (SELECT count(*)::int FROM scripts s WHERE s.user_id = ${userId} AND s.source <> 'seed' AND NOT s.is_reference AND s.status = 'draft'
           AND NOT EXISTS (SELECT 1 FROM calendar_items c WHERE c.script_id = s.id)) AS drafts,
        (SELECT count(*)::int FROM scripts WHERE user_id = ${userId}) + (SELECT count(*)::int FROM carousels WHERE user_id = ${userId}) AS content,
        (SELECT count(*)::int FROM calendar_items WHERE user_id = ${userId} AND date BETWEEN ${isoDay(monday)} AND ${isoDay(sunday)}) AS week`,
    sql<{ id: number; date: string; topic: string; status: string; format: string }[]>`
      SELECT id, date, topic, status, format FROM calendar_items
      WHERE user_id = ${userId} AND date >= ${isoDay(today)} AND status <> 'posted'
      ORDER BY date ASC, id ASC LIMIT 6`,
    sql<{ id: number; date: string; topic: string }[]>`
      SELECT c.id, c.date, c.topic FROM calendar_items c
      WHERE c.user_id = ${userId} AND c.status = 'posted' AND c.date >= ${isoDay(twoWeeksAgo)}
        AND NOT EXISTS (
          SELECT 1 FROM own_posts p WHERE p.user_id = ${userId}
            AND ((c.script_id IS NOT NULL AND p.script_id = c.script_id) OR (c.carousel_id IS NOT NULL AND p.carousel_id = c.carousel_id))
        )
      ORDER BY c.date DESC LIMIT 6`,
  ]);

  const doors = [
    { area: AREAS[0], value: n.ideas, unit: n.ideas === 1 ? "idea waiting" : "ideas waiting" },
    { area: AREAS[1], value: n.drafts, unit: n.drafts === 1 ? "draft in progress" : "drafts in progress" },
    { area: AREAS[2], value: n.content, unit: n.content === 1 ? "piece in Content" : "pieces in Content" },
    { area: AREAS[3], value: n.week, unit: n.week === 1 ? "post this week" : "posts this week" },
  ];

  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 stagger">
        {doors.map((d) => (
          <Link key={d.area.label} href={d.area.href} className="group rounded-[28px] bg-card p-5 md:p-7 transition-colors hover:bg-accent">
            <div className="font-heading text-xl md:text-2xl">{d.area.label}</div>
            <div className="mt-6 md:mt-10 font-heading text-4xl md:text-5xl tabular-nums">{d.value.toLocaleString()}</div>
            <div className="mt-1 text-sm text-muted group-hover:text-accent-deep">{d.unit}</div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">This week</h2>
        <div className="mt-4 rounded-[28px] bg-card p-2">
          {upcoming.length === 0 && awaiting.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              Nothing scheduled yet. Pick something in <Link href="/content" className="underline underline-offset-2">Content</Link> and schedule it.
            </p>
          ) : (
            <ul>
              {upcoming.map((c) => (
                <li key={`u${c.id}`} className="flex items-center gap-4 rounded-[18px] px-4 py-3 hover:bg-surface">
                  <span className="w-28 shrink-0 text-sm text-muted">{fmt(c.date)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.topic || "Untitled"}</span>
                  <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs capitalize">{c.status === "filmed" ? "shot" : c.status}</span>
                </li>
              ))}
              {awaiting.map((c) => (
                <li key={`a${c.id}`} className="flex items-center gap-4 rounded-[18px] px-4 py-3 hover:bg-surface">
                  <span className="w-28 shrink-0 text-sm text-muted">{fmt(c.date)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{c.topic || "Untitled"}</span>
                  <Link href="/analytics" className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-deep">
                    Log its numbers
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
