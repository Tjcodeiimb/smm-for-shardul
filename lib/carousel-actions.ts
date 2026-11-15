"use server";

import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "./db";
import { requireUserId } from "./auth";
import { parseCarouselSlides } from "./carousel-text";

function val(fd: FormData, key: string, fallback = "") {
  const v = fd.get(key);
  return v === null || v === "" ? fallback : String(v);
}
function numVal(fd: FormData, key: string, fallback = 0) {
  const v = fd.get(key);
  const n = Number(v);
  return v === null || Number.isNaN(n) ? fallback : n;
}

export async function saveCarouselAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();

  const slidesText = String(fd.get("slides_text") || "");
  const slides = parseCarouselSlides(slidesText);
  if (slides.length === 0) return;

  const [carousel] = await sql<{ id: number }[]>`
    INSERT INTO carousels (
      title, pillar, content_type, archetype, cta_type, funnel_stage, status,
      topic_tag, segment, slide_count, background_style, background_category, design_notes, user_id
    ) VALUES (
      ${val(fd, "title", "Untitled carousel")}, ${val(fd, "pillar", "authority")}, ${val(fd, "content_type", "educational")},
      ${val(fd, "archetype", "listicle")}, ${val(fd, "cta_type", "save")}, ${val(fd, "funnel_stage", "tofu")}, 'draft',
      ${val(fd, "topic_tag")}, ${val(fd, "segment")}, ${slides.length}, ${val(fd, "background_style", "solid")},
      ${val(fd, "background_category")}, ${val(fd, "design_notes")}, ${userId}
    ) RETURNING id
  `;

  const slideRows = slides.map((s, i) => ({
    carousel_id: carousel.id,
    slide_number: i + 1,
    slide_role: s.role,
    headline: s.headline,
    supporting_text: s.supportingText,
    user_id: userId,
  }));
  await sql`
    INSERT INTO carousel_slides ${sql(slideRows, "carousel_id", "slide_number", "slide_role", "headline", "supporting_text", "user_id")}
  `;

  revalidatePath("/content");
  revalidatePath("/content");
}

export async function deleteCarouselAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`DELETE FROM carousels WHERE id = ${numVal(fd, "id")} AND user_id = ${userId}`;
  revalidatePath("/content");
  revalidatePath("/content");
}

export async function updateCarouselStatusAction(fd: FormData) {
  await ensureSchema();
  const userId = await requireUserId();
  await sql`UPDATE carousels SET status = ${val(fd, "status", "draft")} WHERE id = ${numVal(fd, "id")} AND user_id = ${userId}`;
  revalidatePath("/content");
}
