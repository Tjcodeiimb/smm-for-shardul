import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { ensureV2Seed, getDangerCounts } from "@/lib/v2";
import { SectionHeader } from "@/app/components/ui";
import ContentClient, { type ContentRow } from "./ContentClient";
import BulkImportClient from "@/app/components/BulkImportClient";

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  const userId = await requireUserId();
  await ensureV2Seed(userId);
  const { format } = await searchParams;

  const [scripts, carousels, calendar, counts, dismissed] = await Promise.all([
    sql<{ id: number; title: string; duration_s: number | null; type: string | null; funnel_stage: string; word_count: number | null; is_reference: boolean; source: string; created_at: Date }[]>`
      SELECT id, title, duration_s, type, funnel_stage, word_count, is_reference, source, created_at
      FROM scripts WHERE user_id = ${userId} ORDER BY is_reference DESC, created_at DESC, id DESC`,
    sql<{ id: number; title: string; type: string | null; funnel_stage: string; slide_count: number; archetype: string; is_reference: boolean; source: string; created_at: Date }[]>`
      SELECT id, title, type, funnel_stage, slide_count, archetype, is_reference, source, created_at
      FROM carousels WHERE user_id = ${userId} ORDER BY is_reference DESC, created_at DESC, id DESC`,
    sql<{ script_id: number | null; carousel_id: number | null; date: string; status: string }[]>`
      SELECT script_id, carousel_id, date, status FROM calendar_items
      WHERE user_id = ${userId} AND (script_id IS NOT NULL OR carousel_id IS NOT NULL) ORDER BY date ASC`,
    getDangerCounts(userId),
    sql`SELECT 1 FROM brand_config WHERE user_id = ${userId} AND key = 'v2_starter_banner_dismissed'`,
  ]);

  // A piece is "posted" if any of its calendar entries is posted, otherwise
  // "scheduled" if it has a calendar entry at all, otherwise "draft".
  const cal = new Map<string, { date: string; posted: boolean }>();
  for (const c of calendar) {
    const key = c.script_id ? `s${c.script_id}` : `c${c.carousel_id}`;
    const prev = cal.get(key);
    cal.set(key, { date: prev?.date ?? c.date, posted: (prev?.posted ?? false) || c.status === "posted" });
  }
  const statusOf = (key: string) => {
    const c = cal.get(key);
    return { status: c ? (c.posted ? "posted" : "scheduled") : "draft", date: c?.date ?? "" };
  };

  const rows: ContentRow[] = [
    ...scripts.map((s) => ({
      key: `s${s.id}`,
      kind: "script" as const,
      id: s.id,
      title: s.title,
      duration: s.duration_s,
      type: s.type,
      funnel: s.funnel_stage,
      words: s.word_count,
      reference: s.is_reference,
      starter: s.source === "seed",
      ...statusOf(`s${s.id}`),
    })),
    ...carousels.map((c) => ({
      key: `c${c.id}`,
      kind: "carousel" as const,
      id: c.id,
      title: c.title,
      duration: null,
      type: c.type,
      funnel: c.funnel_stage,
      words: null,
      slides: c.slide_count,
      reference: c.is_reference,
      starter: c.source === "seed",
      ...statusOf(`c${c.id}`),
    })),
  ];

  const starterCount = counts.seedScripts + counts.seedCarousels;

  return (
    <div>
      <SectionHeader num="CT" title="Content" description="Every script and carousel you have. Filter by format, duration, type, funnel stage and status." />
      <ContentClient
        rows={rows}
        initialFormat={format === "carousel" ? "carousel" : format === "reel" ? "reel" : ""}
        starter={dismissed.length === 0 && starterCount > 0 ? { scripts: counts.seedScripts, carousels: counts.seedCarousels } : null}
      />
      <details className="mt-10 rounded-[28px] bg-card">
        <summary className="cursor-pointer select-none px-6 py-4 font-heading text-xl">Import scripts</summary>
        <div className="px-6 pb-6">
          <BulkImportClient />
        </div>
      </details>
    </div>
  );
}
