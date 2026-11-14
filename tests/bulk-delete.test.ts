import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Integration test for the delete cascade (section 6.3). Runs only when
// TEST_DATABASE_URL points at a throwaway Postgres database.
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("bulk delete", () => {
  let sql: typeof import("@/lib/db").sql;
  let del: typeof import("@/lib/content-delete");
  let me: number;
  let other: number;

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    ({ sql } = await import("@/lib/db"));
    del = await import("@/lib/content-delete");
    await (await import("@/lib/db")).ensureSchema();
    [{ id: me }] = await sql<{ id: number }[]>`INSERT INTO users (email, password_hash) VALUES (${`a${Date.now()}@t.test`}, 'x') RETURNING id`;
    [{ id: other }] = await sql<{ id: number }[]>`INSERT INTO users (email, password_hash) VALUES (${`b${Date.now()}@t.test`}, 'x') RETURNING id`;
  });

  afterAll(async () => {
    await sql`DELETE FROM users WHERE id IN (${me}, ${other})`;
    await sql.end();
  });

  it("deletes the scripts, their calendar entries and versions, keeps logged posts, and touches no one else's rows", async () => {
    const ids: number[] = [];
    for (let i = 0; i < 3; i++) {
      const [{ id }] = await sql<{ id: number }[]>`INSERT INTO scripts (title, user_id) VALUES (${`s${i}`}, ${me}) RETURNING id`;
      ids.push(id);
      await sql`INSERT INTO calendar_items (date, script_id, user_id) VALUES ('2026-12-01', ${id}, ${me})`;
      await sql`INSERT INTO script_versions (script_id, version, snapshot, user_id) VALUES (${id}, 1, '{}'::jsonb, ${me})`;
    }
    await sql`INSERT INTO own_posts (title, posted_date, script_id, user_id) VALUES ('real post', '2026-11-01', ${ids[0]}, ${me})`;
    const [{ id: theirs }] = await sql<{ id: number }[]>`INSERT INTO scripts (title, user_id) VALUES ('theirs', ${other}) RETURNING id`;

    // Another user's id in the list must be ignored.
    const res = await del.deleteScriptIds(me, [...ids, theirs]);
    expect(res).toEqual({ scripts: 3, calendar: 3 });
    expect((await sql`SELECT 1 FROM scripts WHERE user_id = ${me}`).length).toBe(0);
    expect((await sql`SELECT 1 FROM calendar_items WHERE user_id = ${me}`).length).toBe(0);
    expect((await sql`SELECT 1 FROM script_versions WHERE user_id = ${me}`).length).toBe(0);
    const [post] = await sql<{ script_id: number | null }[]>`SELECT script_id FROM own_posts WHERE user_id = ${me}`;
    expect(post.script_id).toBeNull();
    expect((await sql`SELECT 1 FROM scripts WHERE id = ${theirs}`).length).toBe(1);
  });
});
