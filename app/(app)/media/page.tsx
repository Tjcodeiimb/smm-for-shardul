import { sql } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { SectionHeader } from "@/app/components/ui";
import MediaClient from "./MediaClient";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const userId = await requireUserId();
  // Illustrative only: MediaClient's items come from lib/mock-data.ts (no real
  // media/file-storage backend exists). We cross-reference each mock item's
  // `script` field against real saved script titles just to show, as a loose
  // illustrative touch, which mock media items happen to name a real script.
  const scripts = await sql<{ title: string }[]>`SELECT title FROM scripts WHERE user_id = ${userId}`;
  const realScriptTitles = scripts.map((s) => s.title);

  return (
    <div>
      <SectionHeader
        num="MB"
        title="Media Bank"
        description="Your footage and images in one place. Tag clips, link them to scripts, and pull them into posts."
      />
      <MediaClient realScriptTitles={realScriptTitles} />
    </div>
  );
}
