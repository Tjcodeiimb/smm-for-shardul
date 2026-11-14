# Upcreate

A small app for writing better short videos and learning from how they perform. It is built for one creator (Shardul, Upforge Consulting). His videos are whiteboard explainers, history stories, authority takes and build logs, made on a phone with a whiteboard and no b-roll.

The full specification is [`docs/v2/UPCREATE_V2_HANDOFF.md`](docs/v2/UPCREATE_V2_HANDOFF.md). The state of the old v1 library is recorded in [`docs/handoff/`](docs/handoff/).

## The four areas

| Area | What it does |
|---|---|
| **Research** | **Ideas:** two boards, plus the 10-point shareability test.<br>**Briefs:** verified facts for one topic, each marked Verified, Known or Unverified.<br>**References:** outliers from other creators, and the principle worth borrowing from each.<br>**Playbook:** editable cards holding the rules scripts follow. |
| **Studio** | The only place a hook, script or carousel is written.<br>**Brief bar:** Format, Duration, Type and Funnel.<br>**Modes:** Write, Improve, Resize and Paste from Claude.<br>**Steps:** Idea → Angle → Hook → Skeleton → Script → Check → Delivery → Save.<br>**Line tools:** Options, Correct only, Tighten, Lock and a swap bank.<br>Also: twelve checks, versions, and "Copy brief for Claude". |
| **Content** | Every script and carousel, filtered by Format · Duration · Type · Funnel · Status.<br>Delete works for a single item, selected items or everything shown, with a JSON backup and a typed count. |
| **Calendar** | **Month:** schedule pieces, with gentle warnings.<br>**Week:** status columns from Idea to Reviewed, plus a shoot sheet export.<br>**Shoot:** the shot list.<br>**Posts:** numbers at 48 hours and 7 days, and notes.<br>**Review:** medians by layer, Save a lesson, and Make another like this. |

Home shows four doors, each with one live number, and a "This week" strip. Settings sits behind the avatar and holds:
- Rules and lessons
- Cadence and earned durations
- The AI provider
- The danger zone: delete all scripts, delete all carousels, clear the calendar

## How the learning loop works

Research feeds Studio, Studio saves to Content, and Content goes on the Calendar. After a piece is posted, you log its numbers and notes. What you learn becomes a **lesson**.

Every Studio prompt is assembled in the same order:
1. The task
2. Five hard constraints
3. The brief
4. Verified facts only
5. Your rules, then your lessons (only those not retired and matching the brief bar)
6. The Playbook cards for that step
7. The two nearest reference scripts
8. The output template

Every prompt is shown in full. You can **Generate** with your own AI key, or **Copy prompt** and paste it into any chatbot, then paste the answer back. No step needs a key.

## Run it locally

```bash
npm ci
cp .env.example .env.local   # set DATABASE_URL and SESSION_SECRET
npm run dev
```

- Tables are created and migrated automatically on the first request.
- The first account you sign up with is the owner. After that, signup is closed unless `SIGNUP_OPEN=true`.

## Environment variables

| Variable | Needed | What it is |
|---|---|---|
| `DATABASE_URL` | Yes, at runtime | The Postgres connection string. On Vercel, use the Supabase **transaction pooler** (port 6543), and set it for **Production and Preview**. The build no longer needs it. |
| `SESSION_SECRET` | Yes | Signs the login cookie. Generate it with `openssl rand -base64 32`. |
| `ENCRYPTION_KEY` | Recommended | Encrypts stored AI keys (AES-256-GCM). It falls back to `SESSION_SECRET`. Changing it makes stored keys unreadable, and they then need re-entering in Settings. |
| `SIGNUP_OPEN` | No | Set it to `true` to allow more than one account. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | No | A fallback AI key used when no key is saved in Settings. |

## Tests

```bash
npm test
```

```bash
TEST_DATABASE_URL=postgres://... npm test
```

The first command runs the unit tests: word budget, prompt assembly, the step-6 checks and Paste from Claude. The second, given a throwaway database, also runs the bulk-delete test.

## Stack

- **App:** Next.js 16 (App Router, `proxy.ts` auth gate), React 19, TypeScript, Tailwind v4.
- **Data:** Postgres through `postgres` (postgres.js). The schema is in `lib/db.ts`.
- **Other:** `docx` for Word exports, Vitest for tests. Hosted on Vercel and Supabase.

Where things live in `lib/`:
- `taxonomy.ts`: the three layers and the budgets
- `script-format.ts`: the beat structure and paste parser
- `checks.ts`: the step-6 checks
- `studio-prompts.ts`: prompt assembly
- `studio-actions.ts`, `content-actions.ts`, `loop-actions.ts`, `research-actions.ts`: the server actions
- `v2-seed-data.ts`: the starting Playbook, rules, lesson, ideas and reference scripts, generated from the brief
