import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

// JSON backup offered (ticked by default) before every bulk delete.
//   ?what=scripts | carousels | calendar | starter | all
//   ?scripts=1,2,3&carousels=4,5   (a specific selection; overrides `what`)
export async function GET(req: NextRequest) {
  await ensureSchema();
  const userId = await getCurrentUserId();
  if (userId === null) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams;
  const parseIds = (v: string | null) => (v ? v.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0) : null);
  const scriptIds = parseIds(q.get("scripts"));
  const carouselIds = parseIds(q.get("carousels"));
  const what = q.get("what") ?? "all";
  const selection = scriptIds !== null || carouselIds !== null;

  const wantScripts = selection ? scriptIds !== null : ["scripts", "starter", "all"].includes(what);
  const wantCarousels = selection ? carouselIds !== null : ["carousels", "starter", "all"].includes(what);
  const wantCalendar = !selection && ["calendar", "all"].includes(what);
  const starter = what === "starter";

  const scripts = !wantScripts
    ? []
    : selection
    ? await sql`SELECT * FROM scripts WHERE user_id = ${userId} AND id = ANY(${scriptIds ?? []}::int[]) ORDER BY id`
    : starter
    ? await sql`SELECT * FROM scripts WHERE user_id = ${userId} AND source = 'seed' ORDER BY id`
    : await sql`SELECT * FROM scripts WHERE user_id = ${userId} ORDER BY id`;

  const carousels = !wantCarousels
    ? []
    : selection
    ? await sql`SELECT * FROM carousels WHERE user_id = ${userId} AND id = ANY(${carouselIds ?? []}::int[]) ORDER BY id`
    : starter
    ? await sql`SELECT * FROM carousels WHERE user_id = ${userId} AND source = 'seed' ORDER BY id`
    : await sql`SELECT * FROM carousels WHERE user_id = ${userId} ORDER BY id`;

  const carouselIdList = carousels.map((c) => c.id as number);
  const slides = carouselIdList.length
    ? await sql`SELECT carousel_id, slide_number, slide_role, headline, supporting_text FROM carousel_slides
        WHERE user_id = ${userId} AND carousel_id = ANY(${carouselIdList}::int[]) ORDER BY carousel_id, slide_number`
    : [];
  const slidesBy = new Map<number, unknown[]>();
  for (const s of slides) {
    const list = slidesBy.get(s.carousel_id as number) ?? [];
    list.push(s);
    slidesBy.set(s.carousel_id as number, list);
  }

  const calendar = wantCalendar ? await sql`SELECT * FROM calendar_items WHERE user_id = ${userId} ORDER BY date, id` : [];

  const body = {
    exportedAt: new Date().toISOString(),
    app: "upcreate",
    scope: selection ? "selection" : what,
    scripts,
    carousels: carousels.map((c) => ({ ...c, slides: slidesBy.get(c.id as number) ?? [] })),
    calendar,
  };
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="upcreate-backup-${selection ? "selection" : what}-${stamp}.json"`,
    },
  });
}
