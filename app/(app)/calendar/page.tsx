import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { FILMING_FORMATS, CTA_TYPES, FUNNEL_STAGES, CALENDAR_STATUSES, CONCEPT_BUCKETS, SCRIPT_ANGLES } from "@/lib/reference";
import { createCalendarItem } from "@/lib/actions";
import { Card, SectionHeader, PageSection } from "@/app/components/ui";
import CalendarClient, { type CalendarItem, type PickerScript } from "./CalendarClient";

export const dynamic = "force-dynamic";

// Calendar > Month (v2 brief, section 7.1). Nothing is scheduled
// automatically: the 14 one-click batch imports, ratio meters and the old
// danger zone are gone (clearing the calendar now lives in Settings).
export default async function CalendarPage() {
  const userId = await requireUserId();
  const [items, scripts] = await Promise.all([
    sql<CalendarItem[]>`SELECT * FROM calendar_items WHERE user_id = ${userId} ORDER BY date ASC`,
    sql<PickerScript[]>`SELECT id, title, funnel_stage, topic_tag, effort FROM scripts WHERE user_id = ${userId} ORDER BY title ASC`,
  ]);

  const selectClass = "w-full rounded-lg border border-border/15 bg-surface text-foreground text-sm p-2.5";
  const inputClass = selectClass;

  return (
    <div>
      <SectionHeader
        num="02"
        title="Calendar"
        description="Click a day to schedule any piece from Content. Nothing is scheduled for you."
      />

      <PageSection
        title="Schedule"
        actions={
          <a href="/api/export/calendar" className="text-sm rounded-full border border-border/15 px-4 py-2 hover:bg-foreground/5">
            Export to Word
          </a>
        }
      >
        <CalendarClient items={items} scripts={scripts} />
      </PageSection>

      <PageSection title="Add an entry by hand">
      <details className="mb-4 rounded-[28px] bg-card">
        <summary className="cursor-pointer select-none px-5 py-4 font-heading text-xl">Add a single item manually</summary>
        <div className="px-5 pb-5">
      <Card className="mb-0">
        <h3 className="font-heading text-xl mb-4">Add to calendar</h3>
        <form action={createCalendarItem} className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs text-muted block mb-1">Date</label>
            <input required type="date" name="date" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Pillar</label>
            <select name="pillar" className={selectClass} defaultValue="authority">
              <option value="authority">Authority</option>
              <option value="journey">Journey</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Concept bucket</label>
            <select name="concept_bucket" className={selectClass} defaultValue="proven">
              {CONCEPT_BUCKETS.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted block mb-1">Topic</label>
            <input name="topic" className={inputClass} placeholder="e.g. 3 mistakes founders make entering a new market" />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Content type</label>
            <select name="content_type" className={selectClass} defaultValue="educational">
              <option value="educational">Educational</option>
              <option value="storytelling">Storytelling</option>
              <option value="authority">Authority / transformation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Script angle</label>
            <select name="angle" className={selectClass} defaultValue="">
              <option value="">—</option>
              {SCRIPT_ANGLES.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Filming format</label>
            <select name="format" className={selectClass} defaultValue="">
              <option value="">—</option>
              {FILMING_FORMATS.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">CTA</label>
            <select name="cta_type" className={selectClass} defaultValue="follow">
              {CTA_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Funnel stage</label>
            <select name="funnel_stage" className={selectClass} defaultValue="tofu">
              {FUNNEL_STAGES.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Status</label>
            <select name="status" className={selectClass} defaultValue="idea">
              {CALENDAR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs text-muted block mb-1">Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>

          <div className="md:col-span-3">
            <button className="rounded-full bg-accent text-accent-deep text-sm font-medium px-4 py-2">
              Add to calendar
            </button>
          </div>
        </form>
      </Card>
        </div>
      </details>
      </PageSection>
    </div>
  );
}
