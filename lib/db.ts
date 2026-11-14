import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

declare global {
  var __chillchaiSql: ReturnType<typeof postgres> | undefined;
}

const MISSING_URL =
  "DATABASE_URL is not set. Add your Supabase/Postgres connection string to .env.local, or to the Vercel project's environment variables for every environment (see .env.example).";

// Without DATABASE_URL, importing this module must not throw: `next build`
// imports every route to collect page data, and a throw here fails the whole
// build (this is what broke Vercel preview builds). Instead the client throws
// a clear error the first time a query actually runs.
function missingClient(): ReturnType<typeof postgres> {
  const fail = () => {
    throw new Error(MISSING_URL);
  };
  return new Proxy(fail, { apply: fail, get: fail }) as unknown as ReturnType<typeof postgres>;
}

export const sql =
  globalThis.__chillchaiSql ??
  (connectionString
    ? postgres(connectionString, {
        ssl: isLocal ? false : "require",
        // Supabase's pooled connection (pgbouncer, transaction mode) doesn't
        // support server-side prepared statements.
        prepare: false,
      })
    : missingClient());

if (process.env.NODE_ENV !== "production" && connectionString) globalThis.__chillchaiSql = sql;

let schemaReady: Promise<void> | null = null;

// Cheap to call repeatedly -- memoized after the first successful run, so
// every query helper can safely call this before doing real work.
export function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = initSchema();
  return schemaReady;
}

// One round trip for the whole schema instead of 7 sequential ones -- this
// runs on every cold start, so it matters for perceived latency. `.simple()`
// allows multiple statements in a single query since there are no dynamic
// parameters here.
async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS brand_config (
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
    ALTER TABLE brand_config ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE brand_config DROP CONSTRAINT IF EXISTS brand_config_pkey;
    CREATE UNIQUE INDEX IF NOT EXISTS brand_config_user_key_idx ON brand_config (COALESCE(user_id, 0), key);

    CREATE TABLE IF NOT EXISTS calendar_items (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      pillar TEXT NOT NULL DEFAULT 'authority',
      concept_bucket TEXT NOT NULL DEFAULT 'proven',
      content_type TEXT NOT NULL DEFAULT 'educational',
      topic TEXT NOT NULL DEFAULT '',
      angle TEXT DEFAULT '',
      format TEXT DEFAULT '',
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'idea',
      notes TEXT DEFAULT '',
      effort TEXT NOT NULL DEFAULT 'default',
      topic_tag TEXT NOT NULL DEFAULT '',
      segment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS effort TEXT NOT NULL DEFAULT 'default';
    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS topic_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT '';
    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS script_id INTEGER;
    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS calendar_items_date_idx ON calendar_items (date);
    CREATE INDEX IF NOT EXISTS calendar_items_user_idx ON calendar_items (user_id);

    CREATE TABLE IF NOT EXISTS outlier_research (
      id SERIAL PRIMARY KEY,
      source_type TEXT NOT NULL DEFAULT 'keyword',
      creator_handle TEXT DEFAULT '',
      link TEXT DEFAULT '',
      niche_keyword TEXT DEFAULT '',
      follower_count INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      hook_written TEXT DEFAULT '',
      hook_verbal TEXT DEFAULT '',
      hook_visual TEXT DEFAULT '',
      angle TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE outlier_research ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS hook_stacks (
      id SERIAL PRIMARY KEY,
      written TEXT DEFAULT '',
      verbal TEXT DEFAULT '',
      visual TEXT DEFAULT '',
      angle TEXT DEFAULT '',
      topic TEXT DEFAULT '',
      saved BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE hook_stacks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS scripts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled script',
      pillar TEXT NOT NULL DEFAULT 'authority',
      content_type TEXT NOT NULL DEFAULT 'educational',
      angle_or_story_type TEXT DEFAULT '',
      format TEXT DEFAULT '',
      body_black TEXT DEFAULT '',
      body_red TEXT DEFAULT '',
      body_green TEXT DEFAULT '',
      cta_type TEXT DEFAULT 'follow',
      funnel_stage TEXT DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'draft',
      series_name TEXT DEFAULT '',
      effort TEXT NOT NULL DEFAULT 'default',
      topic_tag TEXT NOT NULL DEFAULT '',
      segment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS effort TEXT NOT NULL DEFAULT 'default';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS topic_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS scripts_user_idx ON scripts (user_id);

    CREATE TABLE IF NOT EXISTS script_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'Untitled template',
      pillar TEXT NOT NULL DEFAULT 'authority',
      angle TEXT DEFAULT '',
      source_note TEXT DEFAULT '',
      template_text TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE script_templates ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS ai_settings (
      id SERIAL PRIMARY KEY,
      provider TEXT NOT NULL DEFAULT 'gemini',
      api_key TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      custom_endpoint TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
    ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS own_posts (
      id SERIAL PRIMARY KEY,
      title TEXT DEFAULT '',
      posted_date TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      followers_at_post INTEGER DEFAULT 0,
      pillar TEXT DEFAULT 'authority',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    CREATE TABLE IF NOT EXISTS carousels (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled carousel',
      pillar TEXT NOT NULL DEFAULT 'authority',
      content_type TEXT NOT NULL DEFAULT 'educational',
      archetype TEXT NOT NULL DEFAULT 'listicle',
      cta_type TEXT NOT NULL DEFAULT 'save',
      funnel_stage TEXT NOT NULL DEFAULT 'tofu',
      status TEXT NOT NULL DEFAULT 'draft',
      topic_tag TEXT NOT NULL DEFAULT '',
      segment TEXT NOT NULL DEFAULT '',
      slide_count INTEGER NOT NULL DEFAULT 0,
      background_style TEXT NOT NULL DEFAULT 'solid',
      background_category TEXT NOT NULL DEFAULT '',
      design_notes TEXT NOT NULL DEFAULT '',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS carousels_user_idx ON carousels (user_id);

    CREATE TABLE IF NOT EXISTS carousel_slides (
      id SERIAL PRIMARY KEY,
      carousel_id INTEGER NOT NULL REFERENCES carousels(id) ON DELETE CASCADE,
      slide_number INTEGER NOT NULL,
      slide_role TEXT NOT NULL DEFAULT 'body',
      headline TEXT NOT NULL DEFAULT '',
      supporting_text TEXT NOT NULL DEFAULT '',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS carousel_slides_carousel_idx ON carousel_slides (carousel_id);
    CREATE INDEX IF NOT EXISTS carousel_slides_user_idx ON carousel_slides (user_id);

    -- ---------- v2 (see docs/v2/UPCREATE_V2_HANDOFF.md, section 11) ----------
    -- Three classification layers: duration, type, funnel (funnel_stage already exists).
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS duration_s INTEGER;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS one_idea TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS hook_text TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS hook_formula TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS word_count INTEGER;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS est_seconds INTEGER;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS beats JSONB;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS checks JSONB;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS brief_id INTEGER;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS parent_id INTEGER;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS variant_kind TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS is_reference BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS source TEXT;
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS topic_pillar TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS audience_group TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS send_target TEXT NOT NULL DEFAULT '';
    ALTER TABLE scripts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS type TEXT;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS topic_pillar TEXT NOT NULL DEFAULT '';
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS audience_group TEXT NOT NULL DEFAULT '';
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS parent_script_id INTEGER;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS is_reference BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE carousels ADD COLUMN IF NOT EXISTS source TEXT;

    ALTER TABLE calendar_items ADD COLUMN IF NOT EXISTS carousel_id INTEGER;
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS script_id INTEGER;
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS carousel_id INTEGER;
    ALTER TABLE outlier_research ADD COLUMN IF NOT EXISTS principle TEXT NOT NULL DEFAULT '';

    -- v2 Phase 3: the post log (section 7.3)
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS calendar_item_id INTEGER;
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS reel_url TEXT NOT NULL DEFAULT '';
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS video_length NUMERIC;
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS snapshots JSONB NOT NULL DEFAULT '[]';
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS where_left TEXT NOT NULL DEFAULT '';
    ALTER TABLE own_posts ADD COLUMN IF NOT EXISTS log_notes JSONB NOT NULL DEFAULT '{}';

    CREATE TABLE IF NOT EXISTS script_versions (
      id SERIAL PRIMARY KEY,
      script_id INTEGER NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      snapshot JSONB NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS script_versions_script_idx ON script_versions (script_id);

    CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      board TEXT NOT NULL DEFAULT 'favourite',
      link TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      suggested_type TEXT NOT NULL DEFAULT '',
      score JSONB,
      status TEXT NOT NULL DEFAULT 'new',
      brief_id INTEGER,
      reference_id INTEGER,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS ideas_user_idx ON ideas (user_id);

    CREATE TABLE IF NOT EXISTS briefs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT '',
      facts JSONB NOT NULL DEFAULT '[]',
      anchors JSONB NOT NULL DEFAULT '[]',
      twist TEXT NOT NULL DEFAULT '',
      do_not_say TEXT NOT NULL DEFAULT '',
      checked_on TEXT NOT NULL DEFAULT '',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS rules (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'writing',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      position INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'length',
      applies_to JSONB NOT NULL DEFAULT '{}',
      evidence TEXT NOT NULL DEFAULT '',
      evidence_post_ids JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'testing',
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS playbook_cards (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      grp TEXT NOT NULL DEFAULT 'writing',
      use_in_prompts BOOLEAN NOT NULL DEFAULT TRUE,
      steps JSONB NOT NULL DEFAULT '[]',
      position INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS playbook_cards_user_idx ON playbook_cards (user_id);
  `.simple();
  await migrateV2();
}

// One-time, idempotent backfill for rows that existed before v2:
// - `source`: "seed" for the old 1,000-script / 100-carousel starter library
//   (matched by title), "studio" for everything else. Only touches NULL rows,
//   then sets the default so new inserts are "studio" unless they say otherwise.
// - `word_count` / `est_seconds` / `duration_s` from the spoken (body_black)
//   text at 2.5 words per second, bucketed into the six v2 durations.
async function migrateV2() {
  const { LEGACY_SEED_SCRIPT_TITLES, LEGACY_SEED_CAROUSEL_TITLES } = await import("./legacy-seed-titles");
  await sql`
    UPDATE scripts SET source = CASE WHEN title = ANY(${LEGACY_SEED_SCRIPT_TITLES}::text[]) THEN 'seed' ELSE 'studio' END
    WHERE source IS NULL
  `;
  await sql`
    UPDATE carousels SET source = CASE WHEN title = ANY(${LEGACY_SEED_CAROUSEL_TITLES}::text[]) THEN 'seed' ELSE 'studio' END
    WHERE source IS NULL
  `;
  await sql`
    ALTER TABLE scripts ALTER COLUMN source SET DEFAULT 'studio';
    ALTER TABLE carousels ALTER COLUMN source SET DEFAULT 'studio';
    UPDATE scripts SET word_count = COALESCE(array_length(regexp_split_to_array(btrim(COALESCE(body_black, '')), '\\s+'), 1), 0)
      WHERE word_count IS NULL;
    UPDATE scripts SET est_seconds = ROUND(word_count / 2.5) WHERE est_seconds IS NULL;
    -- Repair JSON values that were stored double-encoded (as a JSON string).
    UPDATE playbook_cards SET steps = (steps #>> '{}')::jsonb WHERE jsonb_typeof(steps) = 'string';
    UPDATE lessons SET applies_to = (applies_to #>> '{}')::jsonb WHERE jsonb_typeof(applies_to) = 'string';
    UPDATE scripts SET beats = (beats #>> '{}')::jsonb WHERE jsonb_typeof(beats) = 'string';
    UPDATE scripts SET checks = (checks #>> '{}')::jsonb WHERE jsonb_typeof(checks) = 'string';
    UPDATE script_versions SET snapshot = (snapshot #>> '{}')::jsonb WHERE jsonb_typeof(snapshot) = 'string';
    UPDATE ideas SET score = (score #>> '{}')::jsonb WHERE jsonb_typeof(score) = 'string';
    UPDATE briefs SET facts = (facts #>> '{}')::jsonb WHERE jsonb_typeof(facts) = 'string';
    UPDATE briefs SET anchors = (anchors #>> '{}')::jsonb WHERE jsonb_typeof(anchors) = 'string';
    UPDATE scripts SET duration_s = CASE
        WHEN word_count <= 55 THEN 20 WHEN word_count <= 80 THEN 30 WHEN word_count <= 95 THEN 35
        WHEN word_count <= 120 THEN 45 WHEN word_count <= 160 THEN 60 ELSE 90 END
      WHERE duration_s IS NULL;
  `.simple();
}
