import { NextRequest, NextResponse } from "next/server";
import { Document, Paragraph, TextRun, HeadingLevel, Packer, PageBreak } from "docx";
import { sql, ensureSchema } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { durationLabel, typeLabel, PRODUCTION_STYLE } from "@/lib/taxonomy";
import type { Beat } from "@/lib/script-format";

// Shoot sheet (v2 brief, section 7.2): per script, the whiteboard
// preparation, the teleprompter text and the delivery-marked script.
const RECORDING_BASICS = [
  "Rear camera. Sit far enough back that the whiteboard is in frame.",
  "Lock exposure and white balance. Record two seconds of the empty board first.",
  "Marker letters 8 cm or taller.",
  "Three full takes: as marked; smaller, like telling one friend a secret; deliberately too big.",
];

export async function GET(req: NextRequest) {
  await ensureSchema();
  const userId = await getCurrentUserId();
  if (userId === null) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ids = (req.nextUrl.searchParams.get("ids") ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const rows = await sql<{ date: string; title: string; duration_s: number | null; type: string | null; beats: Beat[] | null; body_black: string; body_red: string; checks: { meta?: { delivery?: string } } | null }[]>`
    SELECT c.date, s.title, s.duration_s, s.type, s.beats, s.body_black, s.body_red, s.checks
    FROM calendar_items c JOIN scripts s ON s.id = c.script_id AND s.user_id = c.user_id
    WHERE c.user_id = ${userId} AND c.id = ANY(${ids}::int[]) ORDER BY c.date, c.id`;
  if (rows.length === 0) return NextResponse.json({ error: "Nothing to export: tick scripted cards that link to a script." }, { status: 404 });

  const h = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
  const p = (text: string, opts: { mono?: boolean; bold?: boolean } = {}) =>
    new Paragraph({ children: [new TextRun({ text, bold: opts.bold, font: opts.mono ? "Courier New" : undefined, size: opts.mono ? 22 : undefined })], spacing: { after: 100 } });

  const children: Paragraph[] = [h(`Shoot sheet · ${new Date().toISOString().slice(0, 10)}`, HeadingLevel.TITLE), h("Recording basics", HeadingLevel.HEADING_2), ...RECORDING_BASICS.map((t) => p(`• ${t}`))];
  rows.forEach((r) => {
    const beats = Array.isArray(r.beats) && r.beats.length ? r.beats : r.body_black.split("\n").filter(Boolean).map((say, i) => ({ beat: i ? `Beat ${i + 1}` : "Hook", say, board: i ? "" : r.body_red, screen: "", drawing: false, locked: false, fact_ids: [] }));
    const delivery = r.checks?.meta?.delivery?.trim() ?? "";
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(h(r.title, HeadingLevel.HEADING_1));
    children.push(p(`${r.date} · ${durationLabel(r.duration_s)} · ${typeLabel(r.type)} · ${PRODUCTION_STYLE[r.type ?? ""] ?? ""}`));
    children.push(h("Whiteboard preparation", HeadingLevel.HEADING_2));
    const board = beats.filter((b) => b.board.trim());
    if (board.length) board.forEach((b) => children.push(p(`${b.beat}: ${b.board}`)));
    else children.push(p("No board directions in this script."));
    children.push(h("Teleprompter", HeadingLevel.HEADING_2));
    const tele = delivery.includes("=== TELEPROMPTER ===") ? delivery.split("=== TELEPROMPTER ===")[1].trim() : beats.map((b) => b.say).join("\n");
    tele.split("\n").filter(Boolean).forEach((line) => children.push(p(line, { mono: true })));
    children.push(h("Delivery-marked script", HeadingLevel.HEADING_2));
    if (delivery) (delivery.split("=== TELEPROMPTER ===")[0].trim()).split("\n").filter(Boolean).forEach((line) => children.push(p(line, { mono: true })));
    else children.push(p("Not marked yet. Run step 7 (Delivery) in Studio."));
  });

  const buf = await Packer.toBuffer(new Document({ sections: [{ children }] }));
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="shoot-sheet-${new Date().toISOString().slice(0, 10)}.docx"`,
    },
  });
}
