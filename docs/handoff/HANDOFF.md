# Upcreate — Handoff (state as of 14 Nov 2026)

**Repo:** `tjcodeiimb/smm-for-shardul` · **Snapshot commit:** `9497df7` (7 Oct 2026, last code change)
**Companion files in this folder:**

| File | What's in it |
|---|---|
| [`REEL_CATALOG.md`](./REEL_CATALOG.md) | All 1,000 scripted reels, grouped by topic: date slot, title, angle, format, funnel, effort, series |
| [`reel-catalog.csv`](./reel-catalog.csv) | The same 1,000 reels with full metadata: hook line, CTA line, source reference, word count, estimated seconds, duplicate flag, source file |
| [`CAROUSEL_CATALOG.md`](./CAROUSEL_CATALOG.md) / [`carousel-catalog.csv`](./carousel-catalog.csv) | All 100 carousels (768 slides): archetype, CTA, funnel, topic, background, slide count, hook slide |

Every number in this document was computed directly from `lib/seed-data/*.ts`. None of it is estimated.

---

## 1. Brief

**What it is.** Upcreate (earlier names: chillchai, then Upforge Content OS) is a Next.js web app that works as a personal content operating system for Shardul / Upforge's Instagram. Upforge is a market-entry and business consulting practice for MSMEs. The app turns the growth-blueprint playbook (hooks, 5x-outlier research, the 70/20/10 ratio system, storytelling frameworks, funnel CTAs) into tools for planning, researching, scripting, producing and tracking short-form video. It also ships with a ready-made library of content.

**Where it stands.**
- **Content.** 1,000 reel scripts and 100 carousels are written and stored as seed data. One click on the Calendar page imports them per user. At the default cadence of one reel a week starting 7 Oct 2026, the reels fill weekly slots through 29 Nov 2045.
- **App.** 20 authenticated pages, 7 API routes and a public landing page. It has multi-user accounts, works with any AI provider, and exports to Word. The frontend was fully redesigned on 6–7 Oct, based on the `samarnasir/upcreate_fork` design.
- **Build.** Green. `next build` compiles all 33 routes, `tsc` is clean after build type generation, and lint has 0 errors and 3 warnings. There have been no commits since 7 Oct.
- **Not real yet.** Publish, Media Bank, Version History, the Settings modal (team, plans, platforms) and the ⌘K command palette all show **sample data** from `lib/mock-data.ts`. Password reset is a placeholder. Background images for carousels are deferred.

**Highest-value next steps** (details in §7):
1. Fix the 42 duplicated reel titles and the "5 vs 7 mistakes" carousel.
2. Label or remove the remaining mock-data UI. The Publish page currently claims it posts to connected accounts, and it doesn't.
3. Encrypt stored AI API keys.
4. Bring the library into line with the 70/20/10 concept ratio. It is currently 98.7% "proven", with no "double-down" items.

---

## 2. Content inventory — reels

### 2.1 Headline numbers

| Metric | Value |
|---|---|
| Scripted reels | **1,000**, in 15 batch arrays across 14 seed files |
| Spoken words (black/"say" layer) | 69,846 in total. Per script: min 35, median 63, max 164 |
| Estimated runtime at 2.5 words/s | median ~25 s, range ~14–66 s |
| Topics / sub-categories | 53 tagged topics, plus 95 untagged (Oct batch and commentary) |
| Signature series | 4 series, 18 episodes |
| Weekly slots used | weeks 0–999 with no collisions (7 Oct 2026 → 29 Nov 2045) |
| Funnel↔CTA alignment | 100% (TOFU→follow, MOFU→engagement, BOFU→ManyChat) |
| Duplicate titles | **42 pairs**, see §7 |

Each script has three layers:
- `bodyBlack`: what to say
- `bodyRed`: filming and camera direction
- `bodyGreen`: on-screen text and edit notes

Each also has a `ctaLine` and the metadata pillar, content type, angle, format, funnel stage, CTA type, concept bucket, effort, and (where relevant) series, topic, segment and source.

### 2.2 Batches (chronological build order)

| # | Batch | Seed file | Reels | Weeks | Slot dates | TOFU/MOFU/BOFU | Effort L/D/H | What it is |
|---|---|---|---|---|---|---|---|---|
| 1 | Oct 2026 | `octBatch.ts` (`OCT_2026_BATCH`) | 30 | 0–29 | 2026-10-07 → 2027-04-28 | 15/10/5 | 10/10/10 | First batch, built on SCRIPT_CRAFT_RULES after a research pass on high-engagement scripting. Covers all 12 filming formats and includes the "How to Enter an Industry" series |
| 2 | Oct 2026 ext. | `octBatch.ts` (`OCT_2026_BATCH_EXT`) | 15 | 30–44 | 2027-05-05 → 2027-08-11 | 7/5/3 | 5/5/5 | Added after the first 30 passed the quality gate |
| 3 | Growth | `growthBatch.ts` | 100 | 45–144 | 2027-08-18 → 2029-07-11 | 52/34/14 | 38/35/27 | 10 per sub-niche across the 9 brand sub-niches plus the core niche. 3 new series. Educational 75 / authority 25 / storytelling 0 (deliberately, because Shardul was writing storytelling himself) |
| 4 | Commentary | `commentaryBatch.ts` | 50 | 145–194 | 2029-07-18 → 2030-06-26 | 28/18/4 | 6/32/12 | "X said this, here's my take", across 11 source types (§2.6) |
| 5 | Segments | `segmentsBatch.ts` | 200 | 195–394 | 2030-07-03 → 2034-04-26 | 106/86/8 | 43/151/6 | 20 new format "segments" × 10 each (§2.5) |
| 6–11 | New categories P1–P6 | `newCategoriesBatch{,2..6}.ts` | 6 × 28 = 168 | 395–562 | 2034-05-03 → 2037-07-15 | 81/45/42 | 83/43/42 | 42 new sub-categories × 4 scripts |
| 12 | Journey gap-fill | `journeyBatch.ts` | 41 | 563–603 | 2037-07-22 → 2038-04-28 | 16/19/6 | 0/35/6 | Fixes the storytelling gap: journey went from 5 to 46, and all 7 story types now have at least 5 |
| 13 | Top-up P7 | `categoriesBatch7.ts` | 140 | 604–743 | 2038-05-05 → 2041-01-02 | 70/42/28 | 70/42/28 | 14 categories × +10 |
| 14 | Top-up P8 | `categoriesBatch8.ts` | 130 | 744–873 | 2041-01-09 → 2043-07-01 | 70/32/28 | 70/32/28 | 4 categories × +10, 10 × +9 |
| 15 | Top-up P9 | `categoriesBatch9.ts` | 126 | 874–999 | 2043-07-08 → 2045-11-29 | 70/28/28 | 70/28/28 | 14 categories × +9. Brings the total to exactly 1,000 |

### 2.3 Distribution across all 1,000

| Dimension | Breakdown |
|---|---|
| **Pillar** | authority 954 · journey 46 |
| **Content type** | educational 646 · authority (case-study) 308 · storytelling 46 |
| **Funnel / CTA** | TOFU/follow 515 · MOFU/engagement 319 · BOFU/ManyChat 166 |
| **Effort** | low 395 · default 413 · high 192 |
| **Concept bucket** | proven 987 · experimental 13 · double-down **0** |
| **Filming format** | Whiteboard 295 · Reaction 182 · Shot/Angle Changes 151 · Q&A 101 · Voiceover 99 · Rapid-Fire Myth vs Reality 42 · Green Screen 28 · Setting Changes 25 · Talking Back & Forth 23 · Visual 19 · Audio B-Roll + Text 16 · Clone 12 · Multitasking 7 |
| **Angle (authority)** | Educational Tip/Hack 380 · Myth Bust/Common Mistake 145 · Framework/Formula/Acronym 135 · Comparison 90 · Transformation 90 · Do vs Don't 71 · Challenge 43 |
| **Story type (journey)** | Loss 9 · Lesson 9 · My Story 7 · Win 6 · Transformation 5 · Challenge 5 · Big Goal/Dream Journey 5. All 46 use Voiceover format |

### 2.4 Topics (coverage per sub-category)

**Core brand sub-niches.** Growth batch and segments batch, 29–31 each: Building a business (founder lessons) 31 · Economic psychology 30 · People psychology 30 · Finance in business 30 · Young student founder journeys 30 · Consulting industry insider takes 30 · Marketing 30 · Product building 30 · Market Entry & Business Consulting 30 · Consumer psychology 29.

**Founder Journey** (journey batch): 41.

**42 expansion sub-categories.** Phases 1–6 plus top-ups 7–9 bring each to 13 or 14. The 18 categories at 14 are:
- Client Relationship Management
- Data-Driven Decision Making
- Competitive Strategy & Positioning
- Cross-Cultural Business Communication
- Financial Modeling & Unit Economics
- Crisis Management & Pivoting
- Brand Positioning & Messaging Strategy
- Customer Onboarding & Retention Systems
- Email & Outreach Copywriting
- Exit Planning & Business Valuation
- Board & Advisor Management
- Cash Flow Management for Founders
- Content Marketing for B2B
- Customer Segmentation & Targeting
- Founder Time Audits & Delegation
- Building Case Studies & Social Proof
- Automating Repetitive Business Tasks
- Founder Wellbeing & Sustainable Pace

The 24 categories at 13 are:
- Negotiation & Deal-Making
- Leadership & Team Management
- Personal Branding for Consultants
- Sales & Closing Technique
- Time Management & Productivity Systems
- Networking & Relationship Building
- Public Speaking & Presentation Skills
- Legal & Contract Fundamentals
- Fundraising & Investor Relations
- Operations & Process Systems
- Mental Resilience & Performance
- Pricing Strategy & Value-Based Fees
- Market Entry Risk Assessment
- Hiring & Team Building for Founders
- Vendor & Supplier Negotiation
- Product-Market Fit Validation
- Go-to-Market Strategy Design
- Referral & Word-of-Mouth Systems
- Regulatory & Compliance Navigation
- Remote Team Culture & Communication
- Strategic Partnerships & Joint Ventures
- Managing Scope Creep
- Investor Updates & Reporting
- Long-Term Strategic Planning

**Untagged:** the Oct 2026 batch (45) and the commentary batch (50), which are categorised by source type instead.

### 2.5 The 20 format segments (segments batch, 10 reels each)

Rank & Tier List · Rapid-Fire Myth vs Reality · Behind-the-Scenes Process Reveal · Anonymized Client Story Breakdown · Surprising Stat Reveal · Objection Roleplay · Checklist / Audit Walkthrough · Prediction / Trend Call · Unpopular Opinion · Explain Like I'm 5 · Day-in-the-Life POV · Before You Do This, Watch This · Reacting to AI Tool Output · Client Q&A Rapid Fire · Resource-Tier Thought Experiment · Red-Flag Spotting · One Chart Explained · Founder Voice-Memo Reflection · Compare 3 Options Live · The Math Behind It.

### 2.6 Researched reels: the commentary batch (50)

These are the reels built on outside research. Each cites a real book, study, letter, case or public position. The sources are **paraphrased**, not presented as invented verbatim quotes. The full `source_reference` for each reel is in `reel-catalog.csv`.

| Source type | n | Sources used |
|---|---|---|
| Book concept + opinion | 5 | Kahneman *Thinking, Fast and Slow*; Cialdini *Influence*; Housel *Psychology of Money*; Christensen *Innovator's Dilemma*; Collins *Good to Great* |
| Public interview theme | 5 | Naval (specific knowledge); Buffett & Munger (Berkshire Q&As); Reid Hoffman (blitzscaling); N.R. Narayana Murthy (trust); tech CEOs on staying "paranoid" |
| Research study breakdown | 5 | Kahneman & Tversky (prospect theory / loss aversion); anchoring research; Ericsson (deliberate practice vs "10,000 hours"); Asch conformity; Dunning–Kruger |
| Historical business case | 5 | Kodak digital camera (1975); Blockbuster passing on Netflix (2000); IBM–Microsoft DOS deal (1980); Nokia's decline; Indian IT's shift from body-shopping to platforms |
| Contrarian take on popular advice | 5 | Newport vs "follow your passion"; "fake it till you make it"; "customer is always right"; "move fast and break things"; "never say no to a client" |
| Old proverb vs modern data | 5 | slow & steady vs compounding; customer is king vs segmentation; fortune favours the bold vs loss aversion; eggs in one basket vs Buffett's concentration; first impressions vs halo effect |
| Two thinkers disagree | 4 | Kahneman vs Gladwell *Blink*; Ries *Lean Startup* vs Thiel *Zero to One*; Collins vs Hoffman; Taleb (avoid ruin) vs "swing big" |
| Concept through my own deal | 4 | Reciprocity → client win; anchoring → fee negotiation; circle of competence → a declined client; Hedgehog Concept → choosing Upforge's niche |
| Quote deconstruction | 4 | "Culture eats strategy for breakfast"; Munger "invert, always invert"; Bezos "your margin is my opportunity"; Godin *Purple Cow* |
| Shareholder/public letter | 4 | Bezos 1997 letter; Buffett letters (circle of competence); Dalio *Principles*; Bezos one-way/two-way doors |
| Podcast/documentary theme | 4 | Premature scaling; Chris Voss tactical empathy; Godin smallest viable market; sustainable pace vs burnout |

**Other research behind the content.** These are recorded in the commit history and baked into the code:
- **SCRIPT_CRAFT_RULES** (`lib/reference.ts`): hook timing and specificity, pattern-interrupt cadence, funnel-matched CTAs, format-based length targets. Every batch was self-audited against these rules, including a hedge-word scan and a CTA/funnel match.
- **Agentic single-prompt scaffolding** (`buildScriptPrompt` in `lib/prompts.ts`), from 2025–26 prompt-engineering practice. The prompt runs a retention plan, then draft v1, then a self-critique (with a role switch to "ruthless editor"), then the final script. Constraints are split into hard and soft.
- **Carousel craft rules** (`lib/carousel-reference.ts`): 8 archetypes, hook patterns, CTA guidance, and a background taxonomy.
- **Gap analysis before the journey batch.** Combination counts across all 563 scripts at that point showed the journey pillar at 5 scripts, with 4 of 7 story types at zero.

### 2.7 Signature series (18 episodes, all high effort)

| Series | Eps | Reel # / slot dates |
|---|---|---|
| How to Enter an Industry | 5 | #6–10, 2026-11-11 → 2026-12-09. Covers D2C & FMCG, SaaS, Healthcare & MedTech, Fashion & Retail, Renewable Energy & CleanTech |
| Psychology of Buying | 5 | #54–55, #63–65, 2027-10-13 → 2027-12-29. Covers anchoring, loss aversion in B2B, social-proof hierarchy, paradox of choice, turning psychology into a pitch |
| Founder Finance 101 | 4 | #92–95, 2028-07-05 → 2028-07-26. Covers runway, pricing for margin, the cash-flow mistake, the first financial model |
| Consulting Insider | 4 | #112–115, 2028-11-22 → 2028-12-13. Covers what big firms sell, how consultants price, red flags, getting the most from a consultant |

### 2.8 Where the schedule is today (14 Nov 2026)

At the default weekly cadence, slots #1–6 are already in the past (7 Oct – 11 Nov). Whether they were actually filmed or posted lives in each user's database (the `status` column on `calendar_items`, and `own_posts`), not in the repo. Next up:
- **Ep. 2/5 SaaS** (18 Nov)
- Healthcare & MedTech (25 Nov)
- Fashion & Retail (2 Dec)
- CleanTech finale (9 Dec)
- *Old Me vs New Me: Pricing a Consulting Project* (16 Dec)
- *What Big Firms Won't Tell Small Founders* (23 Dec)
- *If I Reset Upforge to Zero Clients Today* (30 Dec)

> One reel a week means the library runs to 2045. At a realistic 3–5 posts a week it covers roughly 4–6 years. The Calendar's **Reset** plus per-script **Add to calendar** controls let you re-plan at a denser cadence.

---

## 3. Content inventory — carousels

**100 carousels, 768 slides** across `carouselBatch1.ts` (34), `carouselBatch2.ts` (33) and `carouselBatch3.ts` (33). Every carousel starts with a `hook` slide and ends with a `cta` slide.

| Dimension | Breakdown |
|---|---|
| Archetype | listicle 13 · myth_bust 13 · tutorial 13 · story_arc 13 · single_concept 12 · comparison 12 · before_after 12 · quote_chain 12 |
| Slides per carousel | 6 (1) · 7 (48) · 8 (36) · 9 (13) · 10 (1) · 11 (1) |
| CTA | save 47 · follow 21 · link 12 · comment 11 · share 9 |
| Funnel | TOFU 52 · MOFU 31 · BOFU 17 |
| Pillar / type | authority 69 / journey 31; educational 62 · storytelling 31 · authority 7 |
| Background | solid 32 · gradient 20 · photo 17 · whiteboard 13 · minimalist 10 · screenshot 8 |
| Top topics | Founder Mindset 8 · Founder Journey 7 · Pricing Strategy 4 · Proposal Writing 4. The topic tags are free-text: 67 distinct tags, mostly used once each |

Photo backgrounds only record a `backgroundCategory` (for example `desk_laptop` or `skyline`). Actual stock-photo sourcing was **deferred** because Shardul wants real photos, not AI-generated ones.

---

## 4. Feature inventory (every page)

Status key: ✅ real and backed by the database · 🟡 partly real · 🧪 sample data only (`lib/mock-data.ts`)

| Area | Route | Status | What it does |
|---|---|---|---|
| Landing | `/` | ✅ | Public marketing page with a hero video and Sign in / Create account buttons |
| Auth | `/signup`, `/login` | ✅ | Per-user accounts (scrypt password hashing, signed 30-day httpOnly cookie, `proxy.ts` gate). The first account to sign up claims any pre-existing data that has no owner |
| | `/forgot-password` | 🧪 | Honest placeholder. No email infrastructure exists, so a reset has to be done in the database |
| Onboarding | `/onboarding` | ✅ | Skippable survey that seeds the user's brand config. A skippable first-run tour (`Tour.tsx`) follows |
| Dashboard | `/dashboard` | ✅ | Level progress, ratio meters, upcoming batch, a Quickstart panel, and "Trending in your niche" built from real outlier rows |
| Brand Foundation | `/brand` | ✅ | Niche, sub-niches, founder story, colours and fonts, pillar and concept ratios, cadence, hook and format preferences, equipment, AI stack, profile checklist |
| Calendar | `/calendar` | ✅ | Month-grid calendar. Click a day to schedule any script. Quick stats, filters (status, pillar, funnel, effort, topic, segment, search), **14 one-click batch imports** (the Oct base and extension import together), Word export, and a Danger-zone reset |
| Pipeline | `/pipeline` | ✅ | Kanban view of `calendar_items` by status. Changes are saved to the database |
| Outlier Research | `/research` | ✅ + 🧪 | Log of 5x outliers with an automatic multiple calculation, a CSV/TSV bulk import (Sort Feed export), and a keyword-bank generator. The "Auto-discovery preview" panel is sample data, but it is labelled "example" |
| Hook Lab | `/hooks` | ✅ | Hook-stack generator and library, the 7 hook angles, universal templates. The angle examples come from mock-data, but they are static teaching examples |
| Scripts → Write | `/scripts` | ✅ | Authority and storytelling generators with a reach-vs-conversion depth control, transcript→template, the "How to Enter an Industry" series builder, a script bank, bulk import, and Word export (single script or all) |
| Scripts → Improve | `/improve` | ✅ + 🧪 | Diagnose → prioritise → targeted-rewrite prompt, with script search and the full reference guide inline. **The Version History panel is unlabelled sample data** |
| Scripts → Library | `/library` | ✅ | All scripts with filters (funnel, effort, topic, segment, type, pillar), search, lazy-loaded bodies, 40-per-page "load more", add to calendar, and bulk import |
| Carousels → Create | `/carousels` | ✅ | Slide-by-slide carousel builder and generator. Saves to the `carousels` and `carousel_slides` tables |
| Carousels → Library | `/carousel-library` | ✅ | Filterable browse with lazy-loaded slides and 3 batch-import buttons |
| Production → Planner | `/production` | ✅ | 12 filming formats, equipment checklist, a shot list built from a saved script, batch folder namer |
| Production → Media Bank | `/media` | 🧪 | Sample footage and images. There is no file-storage backend |
| Prompt Library | `/prompts` | ✅ | Every generator can be run inline: bio, keyword bank, topic and problem research, raw-idea developer, outlier deconstruction, hooks, captions, ManyChat DM, calendar ideation, double-down. Includes the static reference library, and the whole thing exports to Word |
| Publish | `/publish` | 🧪 | **Unlabelled mockup.** Its description says it "post[s] straight to your connected accounts", but no posting backend exists |
| CTA & Funnel | `/funnel` | ✅ | TOFU/MOFU/BOFU distribution, CTA decision guide, ManyChat checklist, caption generator |
| Analytics → Performance | `/analytics` | ✅ | Log posted videos, see the top and bottom 5, and generate double-down variants |
| Analytics → Insights | `/insights` | ✅ | Built from real `hook_stacks` and `own_posts` data |
| Settings | `/settings` | ✅ | Choose an AI provider (Gemini, OpenAI, Anthropic, or a custom OpenAI-compatible endpoint), paste a key, and optionally override the model. The key is shown masked |
| Topbar chrome | — | 🧪 | The **⌘K command palette** lists sample pipeline cards, hooks and outliers. The **Settings modal** shows sample team, plans and platforms. Neither is labelled |

**APIs:**
- `/api/generate`: provider-agnostic generation
- `/api/scripts/[id]/body`: lazy-loads a script body
- `/api/carousels/[id]/slides`
- `/api/export/{script/[id], scripts, calendar, prompt-library}`: `.docx` exports

**How generation works.** Every generator builds its prompt from `lib/prompts.ts` plus the user's brand config, shows the prompt, and offers both **Generate** (through the configured provider) and **Copy prompt**. Nothing requires an API key.

---

## 5. Architecture and operations

- **Stack.** Next.js **16.3.6** (App Router, Turbopack, `proxy.ts` instead of middleware), React 19.2, TypeScript, Tailwind v4, Postgres through `postgres` (postgres.js) on Supabase, the `docx` package, and Vercel hosting. Per `AGENTS.md`, read `node_modules/next/dist/docs/` before changing Next-specific code, because this version breaks some conventions.
- **Data.** `lib/db.ts` exposes `ensureSchema()`, which creates or alters these tables idempotently on first query: `users`, `brand_config`, `calendar_items`, `outlier_research`, `hook_stacks`, `scripts`, `script_templates`, `ai_settings`, `own_posts`, `carousels`, `carousel_slides`. There is no migration tool. Every data table has a `user_id`, and every query is scoped to it.
- **Seeding.** Each batch has a `seedXBatch()` / `isXBatchSeeded()` / `seedXBatchAction()` trio in `lib/actions.ts`. Seeding inserts both `scripts` and `calendar_items` rows, then writes a `brand_config` marker row (the batch tag) so it can't run twice.
- **Key files:**
  - `lib/actions.ts`: all server actions (~60 KB)
  - `lib/prompts.ts`: prompt builders
  - `lib/reference.ts`: playbook reference content and SCRIPT_CRAFT_RULES
  - `lib/carousel-*.ts`: carousel prompts, reference and actions
  - `lib/ai-providers.ts`
  - `lib/auth.ts`
  - `lib/brand.ts`
  - `lib/docx-export.ts`
  - `lib/bulk-import*.ts`
  - `app/components/nav-config.ts`: the sidebar map
- **Environment variables:**
  - `DATABASE_URL`: required. Use the Supabase transaction pooler on port 6543 for Vercel.
  - `SESSION_SECRET`: recommended.
  - `GEMINI_API_KEY` / `GEMINI_MODEL`: optional. Used as a fallback when a user hasn't saved a provider key.
  - `APP_PASSWORD`: legacy. Now only a fallback signing secret.
- **Default models:**
  - `gemini-3.8-flash`. `gemini-2.5-flash` was retired server-side; `.env.example` still lists it.
  - `gpt-4o-mini`
  - `claude-sonnet-5-5`
- **Build check (run 14 Nov).** `npm ci` succeeds. `next build` succeeds (33 routes) **but only with `DATABASE_URL` set**, because `lib/db.ts` throws at import time; any placeholder value works. Run plain `tsc --noEmit` *after* `next build` or `next typegen`, because `RouteContext` is a generated global. Lint has 0 errors and 3 unused-variable warnings.

---

## 6. History in one paragraph

All of this was built between 28 Sep and 7 Oct 2026:
- **28 Sep:** first build on SQLite, then auth, Docker and Word export, then the move to Vercel + Supabase. The rest of the day went to the Oct batch, growth batch, commentary batch, segments batch, Script Library, Calendar redesign, prompt scaffolding, Script Improver, and expansion phases 1–6.
- **29 Sep:** month-grid calendar and calendar reset, the journey gap-fill, and top-ups P7–P9, reaching 1,000 scripts.
- **1 Oct:** payload performance fix (lazy script bodies), pluggable AI providers, bulk import, the rename to Upcreate, and multi-tenant auth.
- **2 Oct:** model-id fixes and the Carousel Library with 100 carousels.
- **6–7 Oct:** full port of the fork's UI redesign, the invisible-input-text fix, the landing CTA, and the favicon.

The full reasoning for each batch is in its commit message and in the header comment of its seed file.

---

## 7. Known issues and open items (verified 14 Nov)

**Content quality**
1. **42 duplicated reel titles.** Phases 1–6 and the top-ups P7–P9 reused 42 titles within the same category, for example *"Myth Bust: Lower Prices Don't Win You Better Clients"* appears as both P3#2 and P9#41. The commits claimed "all titles unique", but that was only checked within each batch. They are flagged `duplicate_title=yes` in `reel-catalog.csv`. This also makes `backfillScriptMetadataAction()` ambiguous, because it matches on title.
2. **Carousel #1 says "5" in its title but "7" in its hook.** *"5 Pricing Mistakes Costing You 6-Figure Deals"* has a hook slide reading *"7 pricing mistakes…"* and actually contains 7 body slides (`carouselBatch1.ts`).
3. **Concept ratio doesn't match the playbook.** The brand default is 70/20/10 (proven / double-down / experimental). The library is 987 proven, 0 double-down and 13 experimental. Double-downs are meant to come from Analytics once real performance data exists.
4. **Journey reels are all Voiceover format** (46 of 46). Storytelling-friendly formats from the playbook go unused.
5. Carousel `topicTag` and `segment` values are free-text and inconsistent (for example "Before/After" vs "Before / After"; 16 have an empty segment). That makes filtering weaker.
6. The header comment in `growthBatch.ts` says educational 81 / authority 19. The actual data is 75 / 25, which matches the commit message.

**Product honesty and UX**

7. **Unlabelled sample data:** Publish (whose copy claims real posting), Media Bank, Version History on `/improve`, the ⌘K command palette, and the Settings modal's team, plans and platforms. These should either get an "example" badge like Outlier Discovery has, or be hidden until a backend exists.
8. After **Reset calendar**, the batch-import buttons stay marked as imported because the `brand_config` markers survive. Re-planning has to be done script by script from the Library or Calendar.

**Security and operations**

9. **AI API keys are stored in plaintext** in `ai_settings.api_key`. They are masked in the UI but not encrypted at rest.
10. Signup is open to anyone with the URL, and there is no email verification or password reset.
11. `lib/db.ts` throws at import when `DATABASE_URL` is unset, so CI builds need a placeholder value.
12. `.env.example` and `README.md` are stale. The README still describes single-password auth and Gemini-only generation, and doesn't mention carousels, pipeline, settings or multi-user.

**Technical debt**

13. `lib/actions.ts` contains 15 near-identical ~100-line seed functions. One generic `seedBatch(tag, items, startWeek)` would remove about 1,400 lines.
14. There is no migration system. Schema changes are `ALTER TABLE … IF NOT EXISTS` statements inside `ensureSchema()`.
15. There are no automated tests. All verification so far has been manual, against a local Postgres.

**Deferred by design**
- Stock-photo backgrounds for carousels
- Real social posting and scheduling
- Media storage
- Platform integrations, team roles and billing

---

## 8. Quick start for whoever picks this up

```bash
npm ci
cp .env.example .env.local     # set DATABASE_URL (+ SESSION_SECRET)
npm run dev                    # tables auto-create on first request
```

1. Sign up. The first account claims any existing data that has no owner.
2. Do onboarding, or skip it.
3. Go to Calendar → Import batches to load all 1,000 reels.
4. Go to Carousels → Library → Import to load all 100 carousels.
5. Add an AI provider key in Settings to enable Generate. Without one, use Copy prompt.
