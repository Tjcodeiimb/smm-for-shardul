# Snoball OS — Final Brief (v3, cut-down)

**For:** Claude Code (this file lives at the repo root as `BRIEF.md`)
**Owner:** Crew by OWLED — Snoball's talent division
**Version:** 3.0 · 19 Oct 2026 · merges *Snoball OS Brief v2.0* (Crew's side) with the *Upcreate* codebase in this repo (the creator's side), with features cut hard
**Status:** Build-ready for v1. §15 lists changes from v2.0 that Shardul/Ayush must confirm before Milestone 2.

---

## 0. What this is

One app, one database, two sides:

| Side | Who uses it | What it does |
|---|---|---|
| **Crew Desk** (our side) | Ayush, Shardul, interns | System of record for Crew. Creators from first sighting to roster, the Filter, tiers, brand deals, the ladder, money, brand inbound, check-ins. |
| **Creator Studio** (creator side) | Roster and Tier 0 creators | The creator's own content workspace: 8-week calendar, hooks and scripts, outlier research, results. It also shows their Crew deals, payouts and brand inbound. Built from the existing Upcreate app in this repo. |

The two sides share the creator's calendar, deliverables, payouts and inbox threads. Crew sees what it needs to sell and protect the creator. The creator sees their own work and their own money, never Crew's internals.

**The one sentence:** *Snoball OS makes the right thing the default and the wrong thing impossible — for Crew when it sells, and for the creator when they make.*

**The v1 target (90 days):** 12 creators in pilots, 30 brand deals, all run through the OS. Anything that doesn't serve that target is cut or deferred (§1).

---

## 1. The cut

v2.0 described about 8 weeks of build across 10 modules and 10 roles. Upcreate has 20 screens, 4 of them mock-ups. v1 keeps what a lean team (Shardul + interns) needs to sign and deliver 30 deals and keep 12 creators producing.

### 1.1 Crew Desk

| v2.0 module | v1 decision | Why |
|---|---|---|
| Today | **Keep** | The daily driver. |
| Creators (5 stages, 9 tabs) | **Keep, slimmed** to 4 stages + a revisit date, 5 tabs | Watchlist merges into Scout: a Scout with Filter ≥ 12 is "ready". |
| Filter, tiers, roster gate | **Keep** | Core thesis. Cheap to enforce. |
| Deals (14 stages, 9-step stepper) | **Keep, slimmed** to 7 stages | Advance and PO become gates on deliverables, not separate deal stages. |
| Ladder calculator, commission, shares | **Keep** | This is the product. |
| Campaigns module | **Merge into Deals** | A deal holds its deliverables. One less screen and one less table. |
| Brands CRM | **Slim**: a brand is a small record (contacts, owner team, risk flags), opened from deals | No separate CRM screen. |
| Inbox + Gmail integration | **Keep Inbox, manual capture** (paste or forward-and-paste) with 24h SLA. **Gmail → v2** | The SLA and convert-to-deal are what matter. |
| Money (invoices, payouts, ledger view) | **Keep**, as a tab on each deal plus one Money list | No materialised ledger: a query is enough at 30 deals. |
| Owled Creator Program (cohorts, masked challenges, Sunday shoots, interns, counterpart view, report) | **→ v2.** v1 keeps `source = program` and a bulk **Score mode** on the Creators list | 60 entrants a quarter can be scored in Score mode. The rest is workflow we can run by hand. |
| Retention (check-in scheduling, roadmap, metrics dashboard) | **Keep check-ins** (auto-scheduled, template notes, roadmap as markdown). **Metrics dashboard → v2** | Check-ins are a promise to creators. Dashboards are not needed yet. |
| Brand portal (accounts) | **Replace with a brand link**: one signed URL per deal for claims approval, report and one 1–5 rating + comment | Brands don't need logins to approve two rounds of claims. |
| Creator portal | **Becomes Creator Studio** (§1.2) | The creator side. |
| 5-question survey + quarterly NPS | **→ v2.** v1 = one rating + comment on the brand link | |
| Month-end one-pager | **Keep**, one generated page, on demand | Ayush's view. |
| Roles: Ops, Strategist, Sales viewer, Finance viewer, Program counterpart | **→ v2.** Finance gets a CSV export | Lean team. |
| ⌘K palette, Calendar sync, PDF exports, light theme | **→ v2.** v1 prints quotes/SOWs from HTML; dark theme only | Polish after deals flow. |
| Frontseat amplification tracking | **Flag only** on the deal | |
| Kill fee, late fee, retainer pause | **Text in the SOW template**, not computed | Rare events. Handle by hand until they happen. |

### 1.2 Creator Studio (from Upcreate)

| Upcreate screen | v1 decision | Why |
|---|---|---|
| Brand Foundation + Onboarding | **Keep as Profile** (first-run onboarding fills it) | It also seeds the Crew creator record. |
| Calendar & Batching | **Keep**, as the 8-week calendar, with Crew's sponsored slots, blackout weeks and the 1-in-4 meter | The shared surface between both sides. |
| Pipeline (mock) | **Merge into Calendar** as a board view of the same items | Same data, a second view. Drop the mock data. |
| Hook Lab | **Merge into Write** | |
| Script Studio + Improve + Script Library | **Merge into Write** (Write · Library tabs). Improve becomes an action on a script | |
| Carousel builder | **Cut** | |
| Carousel Library (100 seeded carousels) | **Fold into Library** as `format = carousel` (read-only templates) | The content already exists. Keeping it costs nothing. |
| Outlier Research + CSV import + keyword bank | **Keep as Research** | The creator's own craft tool. Follower/view numbers stay inside Studio (§2 rule 1). |
| Analytics + Insights + double-down | **Merge into Results.** Credibility metrics first, views second | Same metrics Crew reports to brands. |
| Dashboard with follower-count "levels" | **Cut. Replaced by Studio Today** (next posts, deliverables due, payouts, inbox) | Follower-count levels contradict "signal, not counts". |
| Publish (schedule + auto-post, mock) | **Cut permanently** | Crew never posts, never schedules to a platform, never touches accounts. This feature must not exist. |
| Media Bank (mock, no storage) | **Cut** | No backend. Not needed for deals. |
| Production Planner (formats, equipment, shot list, folder namer) | **Cut.** The shot list becomes a section of a script's export | |
| CTA & Funnel Mapper, ManyChat checklist, DM writer | **Cut the screen.** CTA and funnel stage stay as fields on a script | |
| Master Prompt Library screen + Word export of it | **Cut the screen.** Prompts run inline where they're used | |
| Multi-provider AI settings (Gemini/OpenAI/Anthropic/custom, per-user keys) | **Cut to one server-side key** (env). "Copy prompt" fallback stays | No per-user secrets to store. |
| Word export | **Keep for one script and the calendar.** Cut the rest | |
| 20 one-click "seed batch" buttons (`lib/actions.ts`, 1,300+ lines) | **Replace with one seed script** run once per creator from Desk | |
| Tour, Quickstart, Help bubble, Version history, landing page + hero video | **Cut.** The root URL is the login page | Internal tool. Text-minimal design needs no tour. |

**Result:** Desk has 7 screens (Today, Inbox, Creators, Deals, Money, Reports, Settings). Studio has 6 (Today, Calendar, Write, Research, Results, Deals). Before the cut, the two specs together had about 30.

---

## 2. Non-negotiables the software enforces

| # | Rule | How the OS enforces it |
|---|---|---|
| 1 | **Creators are paid for credibility, not reach.** | The calculator has no follower, view, CPV or CPM input. Follower and view numbers exist only in Studio (Research, Results) and as grey metadata on the creator record. They never feed pricing, tier or any gate. |
| 2 | **The Filter is the first gate and the last word.** | Three 1–5 scores (aesthetics, taste, personality) + one sentence. No creator leaves Scout without Filter ≥ 12. No rule or score overrides a Filter fail. |
| 3 | **Crew is a growth and partnerships partner. It handles brand inbound but never posts.** | No posting, platform scheduling, comment or account-access feature on either side. UI words: *partner, partnership, roster*. Never *manage*. |
| 4 | **Crew is the exclusive seller for roster creators.** | Every deal on a roster creator is a Crew deal. `represented_elsewhere` must be false to enter the roster. OWLED Social brands still route through Crew. |
| 5 | **No roster cap. Quality-gated.** | No cap setting. Sub-category mix is reported, never enforced. |
| 6 | **Tier is internal and set by signal.** | T0–T3 with signal evidence. Crew lead proposes, Owner approves. Tier never appears in Studio, the brand link, exports or emails. |
| 7 | **The ladder: five rungs, negotiate toward the top.** | Each creator has their own Standard per deliverable. Rungs −30 / −15 / 0 / +20 / +50. Below Lucrative needs an Owner override. |
| 8 | **Commission 20% (Crew brings) / 15% (creator brings). 3% upsell share. 1.5% referral share on the first 10 deals.** | Computed from deal origin, never typed. Shares are payout lines paid from Crew's commission. |
| 9 | **Retainers preferred. "3-month pilot minimum". Avoid "one post and see".** | Deal types: Pilot, Retainer, Quarterly, Annual, One-off (reason required, Pitch rung). |
| 10 | **NO list + blocklist.** | Checked at Lead → Qualified. A flag blocks unless the Owner records an override with a reason. Declined deals are logged with value. |
| 11 | **Creator owns cadence. Max 1 in 4 sponsored. Claims-only approvals, 2 rounds.** | Creator sets blackout weeks in Studio (warning to Crew, not a block). Sponsored ratio and topic filters are hard blocks. A third revision round opens a priced line on the deal. |
| 12 | **50% advance. Nothing live without signed SOW + PO/email confirmation + advance. Creator paid 50% of their share within 5 business days of the advance, balance within 7 days of completion.** | Deliverables can't go *Approved → Live* without all three (or a logged Owner override). Payouts are generated from receipts, never ahead of them. |
| 13 | **Retention over acquisition.** | Quarterly 60-minute check-ins auto-scheduled from roster entry. The creator sees notes and roadmap in Studio. |
| 14 | **The visibility wall.** | Studio never shows: tier, Filter scores, rungs, commission, other creators' data or fees. The only shares a creator sees are their own upsell and referral shares. The brand link never shows: tier, rung, Standard, other creators, commission. Desk never sees a creator's drafts, scripts or research unless the creator attaches them to a deliverable. |

---

## 3. Users and roles (v1)

| Role | Who | Side | Can |
|---|---|---|---|
| **Owner** | Ayush | Desk | Everything. Approves overrides, tier changes, roster promotions, pilot → partnership. |
| **Crew lead** | Shardul | Desk | Full CRUD on creators, deals, brands, inbox, money. Proposes tiers and overrides. Runs check-ins. |
| **Intern** | LIT interns | Desk | Scout records, Score mode as scribe, inbox capture. No money fields, no tier. |
| **Creator** | T0 and roster creators | Studio | Their own content workspace plus their deals, payouts, inbox and check-ins. |
| **Brand contact** | No account | Brand link | Claims approval, report, rating. Scoped by a signed token per deal. |

Ops, Strategist, Sales viewer, Finance viewer and Program counterpart roles move to v2 (§1.1).

---

## 4. The seam — what crosses between the two sides

| Object | Created by | Desk sees | Studio sees |
|---|---|---|---|
| Creator profile | Creator (onboarding) and Crew | All fields | Their own profile, minus tier, Filter and internal notes |
| Calendar items | Creator (organic); deals (sponsored) | Read-only view of the creator's calendar | Full edit of organic items; sponsored items read-only except status and live URL |
| Blackout weeks | Creator | Shown as warnings when scheduling deliverables | Edit |
| Topic filters, anchor plan | Crew with the creator | Edit | Read |
| Deliverables | Deal (from quote lines) | Full | Their own: brief, due date, claims status, "submit draft", "mark live + URL", metrics |
| Inbox threads | Crew (capture) | Full | Threads forwarded to them, with Crew's reply. They never answer a brand themselves |
| Payouts | Generated from invoice receipts | Full | Their own lines: amount, due date, status |
| Check-ins | Crew | Full | Notes, roadmap, next date |
| Results (post metrics) | Creator | Metrics on sponsored deliverables only, for the deal report | All their posts |
| Scripts, hooks, research | Creator | **Hidden** unless attached to a deliverable | Full |

---

## 5. Information architecture

```
Snoball OS
├── Crew Desk  (/desk)
│   ├── Today      blocked deliverables · awaiting advance/PO · inbox past SLA · check-ins due · payouts due · revisits
│   ├── Inbox      brand inbound, by SLA
│   ├── Creators   Scout · Incubation (T0) · Roster · Alumni  (+ Score mode)
│   │   └── record: Overview · Filter & Tier · Rates · Deals · Check-ins
│   ├── Deals      board · list · calculator
│   │   └── record: Qualify · Proposal · Terms · Delivery · Money · Report
│   ├── Money      invoices and payouts across deals; finance CSV
│   ├── Reports    month-end one-pager · declined log
│   └── Settings   ladder · deliverables · add-ons · Filter rubric · NO list & blocklist · commission · numbers · users
│
├── Creator Studio  (/studio)
│   ├── Today      next posts · deliverables due · payouts · forwarded inbox · next check-in
│   ├── Calendar   8-week month grid | board · pillar meter · sponsored meter · blackouts
│   ├── Write      Hooks · Scripts (authority / storytelling / series) · Improve · Library
│   ├── Research   outlier log (5x rule) · CSV import · keyword bank
│   ├── Results    post log · credibility metrics · double-down
│   └── Deals      my deliverables · my payouts · inbox · check-ins · profile
│
└── Brand link  (/b/[token])   claims approval (2 rounds) · report · one rating
```

Global: a search field per list and a right-hand Inspector on Desk lists. ⌘K is v2.

---

## 6. Data model

Postgres. Money in integer paise with `currency` (INR default, USD supported; the brand bears FX). `created_at`, `updated_at`, `created_by` on every table. Soft delete via `archived_at`. Dates stored in UTC, shown in Asia/Kolkata.

### 6.1 People

```
users          id, email, password_hash, role enum: owner | crew_lead | intern | creator, creator_id (nullable)
creators       id, display_name, legal_name, email, phone, city, timezone
               stage enum: scout | incubation | roster | alumni | declined
               stage_changed_at, stage_reason, revisit_on (nullable)
               tier enum: T0 | T1 | T2 | T3 | null          -- internal only
               tier_approved_by, tier_reviewed_at
               sub_category enum: ai_educator | builder_engineer | founder_operator | vc_analyst | enterprise_tech
               primary_platform enum: instagram | youtube | x | linkedin | newsletter | other
               languages text[], source enum: program | frontseat | ayush_network | referral | inbound | outbound | event
               referred_by_creator_id, consent_status enum: none | opted_in | withdrawn
               is_employed_elsewhere, employer_disclosure_url, is_founder, own_product_content_pct
               represented_elsewhere bool, first_look_until, notes
               profile jsonb      -- Upcreate BrandConfig: niche, sub-niches, founder story, visual identity,
                                  -- pillar ratio, cadence, hook/format prefs (edited in Studio)
creator_platforms     creator_id, platform, handle, url, followers (grey), followers_as_of, is_primary
creator_filter_scores creator_id, scored_at, scored_by, aesthetics 1-5, taste 1-5, personality 1-5,
                      total (computed), sentence (required, ≤200), context enum: scout | program | roster_review | quarterly
creator_tier_signals  creator_id, kind enum: inbound_founder | inbound_brand | speaking | podcast | press | community
                      | prior_enterprise_deal | prior_vc_deal | advisory_role | shipped_product | other, description, url, date
creator_standard_rates creator_id, deliverable_key, standard_paise, currency, set_at, set_by
creator_agreement     creator_id, pilot_started_on, pilot_ends_on (+90d), partnership_started_on, partnership_ends_on (+24m),
                      exit_window_at (+12m), exclusive bool, agreement_url, status enum: pilot | active | exit_window_open | exited
creator_topic_filters creator_id, kind enum: category | competitor | claim | brand, value, reason
creator_anchor_plan   creator_id, anchor_format, cadence_note, sponsored_ratio_max (default 0.25)
creator_blackouts     creator_id, starts_on, ends_on, note
creator_checkins      creator_id, type enum: quarterly | pilot_end | exit_window | adhoc, due_on, held_on, held_by, notes_md, roadmap_md
```

### 6.2 Studio content (from Upcreate, re-keyed from `user_id` to `creator_id`)

```
calendar_items   id, creator_id, date, pillar, concept_bucket, content_type, topic, angle, format, cta_type, funnel_stage,
                 status enum: idea | scripted | filmed | edited | posted, kind enum: organic | sponsored | anchor,
                 deliverable_id (nullable), script_id (nullable), notes
scripts          (as today) + creator_id
script_templates (as today) + creator_id, is_global bool       -- seeded library rows are global, read-only
hook_stacks      (as today) + creator_id
outlier_research (as today) + creator_id                        -- follower_count and views never leave Studio
posts            id, creator_id, title, posted_on, platform, url, pillar, deliverable_id (nullable),
                 saves, shares, comments_decision_maker, inbound, tracked_signups, views (secondary), notes
                 -- replaces own_posts; drops followers_at_post
library_carousels  global read-only rows from the existing 100-carousel seed (title, archetype, slides jsonb)
```

Removed tables: `brand_config` (moves into `creators.profile`), `ai_settings` (one env key), `own_posts` (→ `posts`), `carousels`/`carousel_slides` as editable tables.

### 6.3 Brands, inbox, deals, deliverables, money

```
brands           id, name, website, category, owner_team enum: crew | owled_social | snoball | shared, is_house_client,
                 risk_flags text[], risk_reviewed_at, risk_reviewed_by
brand_contacts   brand_id, name, role, email, phone, is_primary
inbox_threads    id, creator_id (nullable), brand_id (nullable), channel enum: email | instagram_dm | linkedin | x | whatsapp,
                 subject, body_md, received_at, sla_due_at (+24h), status enum: new | replied | converted | declined | spam,
                 forwarded_to_creator bool, reply_md, deal_id, handled_by
deals            id, brand_id, title, owner_user_id
                 stage enum: lead | qualified | proposal | signed | live | reported | paid | declined | lost
                 type enum: pilot | retainer | quarterly | annual | one_off, one_off_reason
                 origin enum: crew_originated | creator_inbound | frontseat_lead | snoball_referral | owled_referral
                 originating_creator_id, commission_pct (computed)
                 currency, quoted_total_paise, signed_total_paise, term_starts_on, term_ends_on, pieces_per_month
                 exclusivity jsonb { scope: none|product|category, days }, usage jsonb [{ kind, days ≤ 365 }]
                 frontseat_amplification bool, sow_url, po_reference, confirmation_url
                 no_list_check jsonb { rev_share_only, no_budget_educational, barter, lifetime_rights, shady_tool,
                                       blocklist_category, passed, checked_by, checked_at }
                 brand_link_token, brand_rating 1-5, brand_comment
                 ladder_version, declined_reason, declined_value_paise, lost_reason
deal_creators    deal_id, creator_id, role enum: primary | upsell, status enum: proposed | accepted | declined_by_creator
quote_lines      deal_id, creator_id, deliverable_key, qty, standard_paise, standard_is_default bool,
                 rung enum: lucrative | semi | standard | pitch | premium, addons text[], line_total_paise (computed), note
deliverables     id, deal_id, creator_id, deliverable_key, platform, title, brief_md, due_on, scheduled_for, live_at, live_url
                 status enum: briefed | in_review | approved | live | cancelled
                 revision_round, disclosure_checked, claims_approved_at, warnings jsonb
overrides        deal_id, kind enum: no_list | below_lucrative | tier0_in_deal | live_without_advance | live_without_po
                 | min_deal | other, requested_by, approved_by (Owner only), approved_at, reason
activity         entity, entity_id, at, by, kind enum: note | stage_change | override | file, body_md   -- also the audit log
invoices         id, deal_id, kind enum: advance | balance | other, number, issued_on, due_on, amount_paise, gst_pct, tds_pct,
                 status enum: draft | sent | paid | overdue | void, paid_on, paid_amount_paise, reference
payouts          id, deal_id, creator_id, kind enum: fee_advance | fee_balance | upsell_share | referral_share,
                 invoice_id, due_on, amount_paise, tds_pct, status enum: due | paid | held, paid_on, reference
settings         key → value (all numbers in §11.6, ladder, deliverables, add-ons, NO list, blocklist, commission rules)
```

---

## 7. Creator lifecycle

```
scout ──► incubation (T0) ──► roster (pilot → partnership) ──► alumni
  └─ revisit_on date can be set at any stage; Today reminds on the date
```

| Transition | Gate (`lib/rules/creators.ts`) | Who |
|---|---|---|
| → scout | Source and sub-category. | Anyone, incl. Intern |
| scout → incubation | Filter total ≥ 12. `consent_status = opted_in`. Anchor plan set. ≥ 3 topic filters. Sets `tier = T0`, `first_look_until` +18 months, **invites the creator to Studio**. | Crew lead |
| incubation → roster | Filter re-scored ≥ 12 within 90 days. ≥ 2 tier signals. `represented_elsewhere = false`. Employer disclosure if employed. `own_product_content_pct ≤ 70` if founder. Owner approval. Creates the agreement in `pilot` (90 days). Schedules 4 quarterly check-ins + a pilot-end review. | Crew lead proposes, Owner approves |
| pilot → partnership | At pilot end: Filter re-score + Owner approval → 24-month agreement, exit window at +12 months. | Owner |
| set revisit | `revisit_on` (+6 months default). The default for Program entrants instead of declining. | Crew lead |
| roster → alumni | Reason. Open deals closed or reassigned. Payouts settled. Exclusivity ends. Studio stays open; the Deals tab goes read-only. | Crew lead |
| alumni → roster | Owner approval. | Owner |

**Score mode** (Creators list, filter `src:program` or any selection): one row per creator, three 1–5 cells + sentence, arrow keys between cells, totals rank live. Top 7 → "Move to incubation" in one click (gates still apply). 10–11 → revisit +1 quarter.

Follower counts are an input to none of these rules.

---

## 8. Deal pipeline

### 8.1 Stages and gates (`lib/rules/deals.ts`)

`lead → qualified → proposal → signed → live → reported → paid`; exits `declined`, `lost`.

| Transition | Gate |
|---|---|
| lead → qualified | NO-list and blocklist check passed, or Owner override with reason. Brand risk reviewed in the last 180 days. `type` set (`one_off_reason` if one-off). Expected value ≥ ₹25K, or a `min_deal` override. Below ₹25K the OS offers "send the creator the self-serve template" instead. If the brand's `owner_team = owled_social`, a referral note is required. |
| qualified → proposal | ≥ 1 creator `accepted`, each `stage = roster` (T0 only with a `tier0_in_deal` override). Topic-filter conflict blocks, naming the filter. Quote has ≥ 1 line, each with a rung. No line below Lucrative without a `below_lucrative` override. Exclusivity → Premium on affected lines. Usage → add-on with `days ≤ 365`. If `origin = creator_inbound`, prompt: "Upsell other roster creators?" Extras get `role = upsell`. |
| proposal → signed | Signed total, term, pieces/month, exclusivity, usage set. SOW generated from the template. Deliverables created from quote lines; sponsored items appear on each creator's Studio calendar. |
| signed → live | Advance invoice `paid` (≥ 50%) or `live_without_advance` override. PO reference or confirmation email, or `live_without_po` override. Generates `fee_advance` payouts (50% of each creator's share) due in 5 business days. Brand link issued. |
| live → reported | All deliverables `live` or `cancelled`. Report generated (§8.4). Balance invoice issued, due in 7 days. |
| reported → paid | Balance invoice paid → `fee_balance`, `upsell_share` and `referral_share` payouts generated. Stage closes when every payout is `paid`. |
| any → declined | `declined_reason` + `declined_value_paise`. Appears in the declined log and the one-pager. |

### 8.2 Ladder calculator (`lib/rules/ladder.ts`)

```
line_total = standard × qty × (1 + rung_pct) × (1 + Σ addon_pct)
standard   = creator's own Standard for the deliverable
             ?? (Tier 1 Reel placeholder × deliverable multiple × tier scale), flagged "default"
```

- Default rung by deal type: pilot/retainer → Standard · one-off → Pitch · annual or bulk → Lucrative · quarterly → one rung below the creator's usual close · exclusivity → Premium on affected lines.
- Add-ons: usage organic 90d +20% · whitelisting 90d +40% · web/print 12m +30% · rush < 7 days +15% · rush < 2 days +25%. Lifetime usage renders as "Not offered" and can't be selected. A third revision round is a free-text priced line, never automatic.
- No bundle discount: each creator at their own rung.
- Commission: 15% if `origin = creator_inbound`, else 20%. Upsell share: 3% of upsell creators' fees to the originating creator. Referral share: 1.5% of a referred creator's first 10 deals to the referrer. Both come out of Crew's commission.
- No follower, view, CPV or CPM field. The quote print includes the one-page CPV reframe.
- Every quote stores the ladder version.

### 8.3 Deliverables (`lib/rules/deliverables.ts`)

Statuses: `briefed → in_review → approved → live` (+ `cancelled`).

- **Studio actions:** the creator submits a draft (→ `in_review`), marks it live with a URL (→ `live`), and logs metrics.
- **Brand link actions:** approve claims, or request changes (round 1, round 2). A round-3 request opens a "Revision — case by case" line on the deal for Crew to price or waive.
- **Hard blocks on `approved → live`:** deal not past `signed → live` gate (advance + PO, or overrides) · `disclosure_checked = false` · claims not approved · creator's sponsored share this month would exceed 25% · brief tags hit a topic filter.
- **Warning only:** `scheduled_for` inside a creator blackout. Shown to Crew and the creator, because no-post weeks are the creator's choice and not contractual.
- The UI shows the first blocking reason as one grey line under the status control.

### 8.4 Report

Generated from deliverables + Studio `posts` linked to them. Credibility first: decision-maker comments, saves and shares, inbound to the brand, tracked sign-ups. Views last and smaller. Shown on the brand link; the brand leaves one 1–5 rating + comment, shared with the creator by default.

---

## 9. Inbox

1. Crew pastes a brand DM or email (or forwards to a shared mailbox and pastes). Gmail capture is v2.
2. Each thread gets `sla_due_at` = +24h and sits in Today until `replied`.
3. Actions: **Identify brand** (create/link) · **Pre-screen** (the five NO-list toggles) · **Convert** (creates a `lead`, `origin = creator_inbound`, `originating_creator_id` set) · **Decline** (template) · **Forward to creator**.
4. The creator sees forwarded threads and Crew's reply in Studio → Deals. They never answer a brand themselves.
5. Communication only. Nothing in the Inbox touches a creator's account.

---

## 10. Screens

Every screen: one title, one primary action, one list or one record.

### 10.1 Crew Desk

- **Today** — Blocked · Awaiting money · Inbox due · Check-ins · Payouts due · Revisits. One row = one line + one action. Empty: "Nothing needs you today."
- **Inbox** — list by SLA; Inspector shows the thread; buttons: Identify · Pre-screen · Convert · Decline · Forward.
- **Creators** — segmented: All · Scout · Incubation · Roster · Alumni. Tokens `sub:` `tier:` `src:` `lang:`. Columns: Name · Sub-category · Filter · Tier · Next check-in · Open deals. No follower column. Primary action: New creator. Secondary: Score mode.
- **Creator record** — Overview (profile, platforms, agreement dates, Studio calendar read-only, topic filters, blackouts) · Filter & Tier (scores + sentence + history; signals; gate line: "Roster gate: 3 of 4 met · missing: Filter re-score") · Rates (Standard per deliverable, ladder preview) · Deals (deals, deliverables, payouts) · Check-ins (notes, roadmap, next date).
- **Deals** — Board (column per stage; card: brand · title · total · days in stage · one-line blocker) and List. Footer: "Pipeline ₹… · Signed this quarter ₹… · Declined ₹… (n)". Calculator for scratch quotes.
- **Deal record** — left stepper: Qualify (NO-list toggles, blocklist, brand risk, referral note) → Proposal (match creators, upsell prompt, calculator: five-segment rung control per line, add-on toggles) → Terms (signed fields, SOW) → Delivery (deliverables table with blockers/warnings, brand link) → Money (both legs of the 50/50, payouts) → Report.
- **Money** — invoices and payouts across deals; overdue in pink; CSV export for finance.
- **Reports** — month-end one-pager: roster by stage/tier/sub-category; pipeline by stage; signed, collected, outstanding, overdue; payouts and shares; declined log with values; overrides count; check-in adherence.
- **Settings** — ladder, deliverables, add-ons, Filter rubric, NO list and blocklist, commission rules, numbers (§11.6), users.

### 10.2 Creator Studio

- **Today** — next three posts · deliverables due (with claims status) · payouts due/paid · new forwarded threads · next check-in. Empty: "Nothing due. Make something."
- **Calendar** — 8-week month grid (anchors bold, sponsored dotted, blackouts shaded) and a board view (idea → scripted → filmed → edited → posted). Meters: pillar ratio (authority/journey, from Profile) and sponsored share (≤ 1 in 4). Primary action: Add post. AI batch ideation fills a week from Profile + Library.
- **Write** — tabs Write · Library. Write: hook stack generator (written/verbal/visual), script generator (authority/educational, storytelling, signature series) with reach-vs-conversion depth control, transcript → template. Each generator shows the assembled prompt with Generate and Copy prompt. Improve and "Schedule to calendar" are actions on a saved script. Library: script bank, global templates, 100 carousel templates; filters by pillar, funnel stage, format, topic.
- **Research** — outlier log with auto views/follower multiple (5x rule), CSV import, keyword bank. Private to the creator.
- **Results** — log a post (credibility metrics first, views secondary); top and bottom five; double-down generator on any post. Posts linked to a deliverable feed that deal's report.
- **Deals** — my deliverables (brief, due, status, submit draft, mark live), my payouts, forwarded inbox threads with Crew's reply, check-in notes and roadmap, my profile. No tier, rung, commission or other creators.

### 10.3 Brand link

One page per deal: deliverables awaiting claims approval (approve / request changes, with the round shown), the report once live, one 1–5 rating + comment. No login, no tier, no rung, no other creators.

---

## 11. Seed data

### 11.1 Ladder v1
| Rung | vs Standard | Default use |
|---|---|---|
| Lucrative | −30% | Bulk, annual close |
| Semi-lucrative | −15% | Quarterly close |
| Standard | 0 | Pilot and retainer |
| Pitch | +20% | Opening number; one-off |
| Premium | +50% | Exclusivity, category lock, special asks |

Tier scale (only when a creator has no own Standard): T0 ×0.5 · T1 ×1 · T2 ×2.5 · T3 ×6, on a Tier 1 Reel placeholder of ₹50,000 (open item).

### 11.2 Deliverables v1 (multiple of a dedicated Reel)
Instagram Reel dedicated 1.0 · Reel integrated 0.7 · carousel/static 0.6 · story set (3–5) + link 0.25 · YouTube integration 1.5 · YouTube dedicated 3.0 · X thread 0.5 · LinkedIn post 0.6.

### 11.3 Add-ons v1
usage_organic_90 +20 · usage_whitelist_90 +40 · usage_web_365 +30 · rush_7d +15 · rush_2d +25 · revisions_r3 (case by case) · exclusivity (forces Premium) · lifetime (blocked).

### 11.4 Commission v1
creator_inbound 15 · every other origin 20 · upsell_share 3 · referral_share 1.5 on the first 10 deals. Shares come from Crew's commission.

### 11.5 Filter, NO list, blocklist
Filter: aesthetics, taste, personality, 1–5 each + one sentence. Incubation ≥ 12, roster ≥ 12 (re-scored within 90 days), Score-mode top-N 7, revisit band 10–11.
NO list: rev_share_only · no_budget_educational · barter · lifetime_rights · shady_tool.
Blocklist: gambling / real-money gaming · crypto exchanges and tokens · unregulated lending · political and religious.
Exceptions: Owner only, logged, none by default in year one, house clients included.

### 11.6 Numbers (settings, never constants)
advance 50% due in 7 days · balance due 7 days after completion · payouts 5 business days after receipt · pilot 90 days · partnership 24 months · exit window 12 months · sponsored max 0.25 · min deal ₹25,000 · inbox SLA 24h · check-in every 90 days · usage max 365 days · first look 18 months · revisit 6 months.

### 11.7 Studio content
The existing Upcreate seed (script batches in `lib/seed-data/`, 100 carousels) becomes **global read-only Library rows**, loaded by one seed script. Reference content in `lib/reference.ts` and `lib/carousel-reference.ts` stays as code. Prompts in `lib/prompts.ts` stay, fed by `creators.profile`.

### 11.8 Templates (day one)
SOW · representation agreement · usage addendum · exclusivity addendum (these four are the legal templates) · quarterly check-in · pilot-end review · inbox decline · CPV reframe page · month-end one-pager.

---

## 12. Design

One design system for both sides: Crew brand, Apple HIG principles, text-minimal.

```
--ink     #0B0B0B   background (dark is the only v1 theme)
--ink-2   #1A1917   raised surface
--ink-3   #262421   blocks, separators
--beige   #F6E8CD   primary text, beige blocks
--beige-2 #CFC2A9   secondary text
--beige-3 #8C8370   captions
--pink    #FF409B   emphasis only: the primary action, one number per screen, overdue/blocked words, the active rung
```

- The repo already centralises tokens in `app/globals.css` (`--background`, `--foreground`, `--accent`, …). Map them to the Crew tokens above. That is the whole reskin. Replace Instrument Serif / Geist with a heavy condensed headline face (`"Archivo Black", "Inter Tight", Impact, sans-serif`, uppercase) and a system sans body with tabular numerals.
- Square corners, flat blocks, no shadows, hairline separators. 8-pt grid. Sidebar · content · Inspector (Desk); sidebar · content (Studio). Stacks on phone width.
- Pink is a scalpel: never a background larger than a button, never body text.
- Text-minimal: 1–3-word titles, verb buttons, one-word statuses, one-sentence blockers, captions ≤ 12 words, no helper paragraphs, no tours. Indian number format (₹1,20,000; ₹ L / ₹ Cr in summaries).
- Keyboard: `J/K` rows, `Enter` open, `Esc` close, arrow keys in Score mode. Contrast ≥ 4.5:1; pink text only at ≥ 15 pt semibold.
- Light theme and ⌘K are v2. Keep the tokens ready for them.

---

## 13. Tech — build on this repo

v2.0 named Next.js 15 + Drizzle + Auth.js + Radix + TanStack. v1 instead **extends the existing Upcreate stack** to avoid a rewrite:

- **Next.js 16** (as installed; read `node_modules/next/dist/docs/` before writing code — see `AGENTS.md`), App Router, Server Actions, `proxy.ts` for auth.
- **Postgres via `postgres` (postgres.js)**, Supabase pooler, as in `lib/db.ts`. Replace `ensureSchema()` with numbered SQL migration files in `lib/db/migrations/` and a migrate script. The current inline schema is migration `0001`.
- **Auth:** keep the existing email/password + signed cookie (`lib/auth.ts`). Add `role` and `creator_id` to `users`. `proxy.ts` routes `/desk/*` to Desk roles and `/studio/*` to creators. The brand link uses the same HMAC signing for its token.
- **Zod** for every server action input. **Vitest** for `lib/rules/*`. Playwright for the three acceptance paths in §14.
- One AI key via env (`GEMINI_API_KEY` today; provider is a v2 setting). Copy-prompt fallback always works.
- `docx` export kept for one script and the calendar.

```
app/(auth)/login
app/desk/       today/ inbox/ creators/ deals/ money/ reports/ settings/
app/studio/     today/ calendar/ write/ research/ results/ deals/
app/b/[token]/  brand link
components/ui/  shared closed component set
lib/db/         index.ts (was lib/db.ts) · migrations/ · seed.ts
lib/rules/      creators.ts · deals.ts · ladder.ts · deliverables.ts · inbox.ts · money.ts · checkins.ts · visibility.ts
lib/studio/     prompts.ts · reference.ts · carousel-reference.ts · docx-export.ts   (moved from lib/)
tests/rules/    one test per gate row in §7 and §8
```

**Delete:** `app/(landing)`, `public/hero.mp4`, `app/(app)/{publish,media,production,funnel,prompts,carousels,dashboard,insights,improve,pipeline,hooks,onboarding}` (their useful parts move into the Studio screens above), `lib/mock-data.ts`, `lib/ai-settings-actions.ts`, per-user AI provider code, the 20 seed actions in `lib/actions.ts`, `Tour`, `Quickstart`, `HelpBubble`, `HelpMenu`, `VersionHistory`, `OutlierDiscovery` (mock feed), `SettingsModal`.

---

## 14. Build plan (5 weeks)

**M1 — Foundation and Studio (weeks 1–2).** Migrations, roles, `/desk` and `/studio` shells, reskin, deletions from §13. Studio: Profile/onboarding, Calendar (grid + board, meters, blackouts), Write, Research, Results, all keyed by `creator_id`. Desk: Creators list and record, Filter scoring, Score mode, tier signals, stage machine, agreement dates, Studio invite.
*Accept:* no creator leaves Scout without Filter ≥ 12 and consent; roster needs Owner approval and `represented_elsewhere = false`; Studio shows no tier or Filter; no Publish, posting or account-connection code exists; no follower column on Desk lists.

**M2 — Deals, ladder, money, inbox (weeks 3–4).** Board/list, stepper, NO-list and blocklist gate, matching with upsell prompt, calculator, commission and shares, SOW, deliverables, invoices, payouts, overrides, declined log, Inbox with SLA and forwarding.
*Accept:* barter on cannot pass Qualify without an Owner override; no line below Lucrative without an override; lifetime can't be selected; no follower/CPV input on the calculator; one-off defaults to Pitch; creator_inbound → 15% and generates the upsell payout line; advance paid → fee_advance payouts due in 5 business days; every override records the approver.

**M3 — Seam, Today, brand link, reports, check-ins (week 5).** Sponsored items on Studio calendars, Studio Deals tab, brand link (claims rounds, report, rating), both Todays, check-in scheduling and notes, month-end one-pager, finance CSV.
*Accept:* a deliverable can't go live without advance + PO + disclosure + claims approval; a blackout overlap warns but doesn't block; the brand link shows no tier, rung or other creators; Studio shows the creator's fee and own shares only; inbox threads past 24h appear in Desk Today; roster entry schedules four check-ins and the pilot-end review.

Definition of done per screen: one title, one primary action, no helper paragraphs, rules unit-tested, AA contrast.

---

## 15. Changes from v2.0 that need a yes (before M2)

1. **Brand portal → brand link** (no brand accounts in v1). v2.0 §18 said "both portals in v1".
2. **Owled Creator Program module → v2.** v1 keeps `source = program` + Score mode. Masked 48-hour challenges, Sunday shoots, interns and the LIT counterpart view are run by hand until then.
3. **Campaigns merge into Deals.** **Watchlist merges into Scout.** **Deal stages 14 → 7.**
4. **Gmail/Calendar integration → v2.** Inbox is paste-in.
5. **Roles cut to Owner, Crew lead, Intern, Creator.** Finance gets a CSV.
6. **Dark theme only, no ⌘K, no PDF engine** in v1.
7. **Stack:** extend this repo (Next 16, postgres.js, existing auth) instead of Drizzle/Auth.js/Radix/TanStack.
8. **Creator side cuts:** Publish (permanent), Media Bank, carousel builder, Production planner, Funnel screen, Prompt Library screen, follower-count levels, per-user AI keys.

## 16. Open items (from v2.0, still open)

1. Tier 1 Reel Standard (₹50K placeholder), and whether every creator has their own Standard from day one (assumed yes).
2. International payment rails (with OWLED finance).
3. Named Filter panel for roster decisions (Crew under Ayush).
4. The current pipeline document, to import as the first Scout records (CSV import on Creators — M1).
5. Which AI provider Studio uses by default (Gemini today).

---

## 17. Working rules for Claude Code

Read this file before any change. It is the spec.

**Never weaken**
- Pricing never takes followers, views, impressions, CPV or CPM. Follower/view data never leaves Studio Research/Results except as grey metadata. If a task asks for it, stop and flag it.
- No score or rule overrides a Filter fail.
- Tier, Filter scores, rungs and commission never reach Studio, the brand link, exports or emails. All visibility checks live in `lib/rules/visibility.ts` and are enforced at the query layer.
- Five rungs (−30/−15/0/+20/+50). Below Lucrative needs an Owner override. Lifetime usage is never selectable; usage ≤ 365 days.
- Commission and shares are computed, never typed.
- NO list and blocklist block deals. Only an Owner override with a reason passes, and it is logged.
- Nothing goes live without SOW + PO/confirmation + advance (or a logged override). Payouts come from receipts, never ahead.
- No posting, platform scheduling or account access, on either side. Do not rebuild Publish.
- No roster cap, no minimum guarantee.
- Thresholds, percentages and cadences are settings. Every gate lives in `lib/rules/*`; the UI never re-implements a rule.

**Engineering**
- TypeScript strict. Zod for every action input. Every write: server action → `lib/rules` → db.
- Studio queries are scoped by `creator_id` from the session; Desk queries check role.
- Every gate row in §7 and §8 has a test in `tests/rules`. Changing a rule changes its test.
- Money is integer paise + currency; format with `lib/format`. Dates in UTC, shown in Asia/Kolkata.
- Seed values match §11 exactly.
- Run `npm run lint`, the rule tests and the build before calling a milestone done.

**When unsure:** take the more restrictive reading, implement it, leave a `// BRIEF: clarify` comment. Never silently relax a gate.
