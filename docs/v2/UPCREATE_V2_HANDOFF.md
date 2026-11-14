# Upcreate v2: handoff brief for the rebuild

**For:** the Claude session that maintains the Upcreate repo (`tjcodeiimb/smm-for-shardul`).
**From:** Shardul's scripting project, written by Claude on 14 Nov 2026.
**Owner:** Shardul Singh, Upforge Consulting.

## 0. How to read this brief

Shardul wants Upcreate rebuilt into a much simpler app that helps him write better short videos and learn from how they perform. This brief tells you what to build, why, and what knowledge the app has to carry.

Three things to know before you start:

1. **What I could and could not see.** I read the full project export (`UPCREATE_COMPLETE.md`, generated from commit `9497df7`), Shardul's production system and identity sheet, his script briefs, and the research and skills that govern topic choice, fact-checking, structure, hooks and delivery. I read his editing skills (grading, captions, cutting, sound) in summary only, because the app stops at the finished script. I have not seen the code. Where I name a table, column or file, check it against the repo and adapt the name. Where I state a rule about content, treat it as fixed unless it carries a label below.
2. **Labels.** **[Decided]** means Shardul said it. **[Proposed]** means it is my design for something he asked for; change the detail if the code suggests a simpler way, but keep the intent. **[Hypothesis]** means a starting value he will tune from his own numbers; make it editable, never hard-coded.
3. **Simplify the existing app. Do not start a new one.** The stack, the auth, the database and the "show the prompt, then Generate or Copy prompt" pattern all stay.

Section 1 is the whole brief on one page. Sections 2 to 13 are the specification. Appendix A is the knowledge to load into the app. Appendix B is the starting content. Appendix C lists older rules that newer decisions replaced.

---

## 1. The brief on one page

**The problem.** Upcreate has about 20 destinations in its sidebar, 1,000 pre-written scripts scheduled one a week until 2045, and classification fields that do not match how Shardul thinks. He finds it hard to use. Meanwhile his account has about 800 followers, his Newton Reel runs about 78 seconds, and he believes that is too long for an account this size. His focus now is **retention** and **finding the right audience**.

**What to build.** An app with four areas and nothing else in the navigation:

| Area | One-line job |
|---|---|
| **Research** | Collect ideas, verify facts, and keep the playbook: what kinds of script he makes, how they are produced, how they look. |
| **Studio** | The single place where a hook, a script or a carousel gets written, from idea to finished script. |
| **Content** | Every script and carousel he has, filtered by duration, type and funnel stage. |
| **Calendar** | Plan what gets posted when, track each piece to "posted", log how it performed, and write notes. |

**The loop the app must close.** Research feeds Studio. Studio saves to Content. Content goes on the Calendar. After posting, Shardul logs the numbers and writes what he noticed. Those notes become short **lessons**, and every future Studio prompt includes them. Today the app has no such loop: analytics exist, but nothing he learns reaches the script generator.

**The four requests that are not negotiable. [Decided]**

1. **Four areas at most** when he opens the app. Everything else is removed or folded into one of the four.
2. **Scripts are classified in three layers:** duration (20 s, 30 s, 35 s, 45 s, 60 s, over 60 s), type (whiteboard explainer, history story, authority, build), and funnel stage (top, middle, bottom). Storytelling is not a type. It applies to every script.
3. **A delete function** that removes all the scripts in the app today, plus ordinary delete for single and selected items.
4. **Generated scripts must follow his feedback closely.** His standing rules and his lessons from past posts go into every prompt.

**Build order.** Phase 1: new navigation, Content with the new filters, delete, removal of dead pages. Phase 2: Studio. Phase 3: performance log, lessons and review. Details and acceptance checks are in section 12.

---

## 2. Context: who this is for and what changed

**Shardul and his setup.** Shardul runs Upforge Consulting (market entry and business consulting for small and mid-sized firms). He makes Instagram Reels on productivity, psychology, science, technology, history and knowledge work, in English with occasional Hinglish. He records on a phone, talking to camera, with a whiteboard beside him. He has no second camera, no outdoor footage and no b-roll. Every visual in a script must be one of: his face, the whiteboard, a hand-drawn overlay, a full-screen text card, a caption, or a sound.

**Positioning.** "The whiteboard guy who checks the receipts." Each video explains one idea about how people think, work or learn. He draws it by hand and shows the source on screen.

**The app and the videos drifted apart.** Upcreate was built around a consulting-content playbook (authority and journey pillars, outlier research, 70/20/10 concept ratio). Since then Shardul built a separate, research-led production system in Claude for his knowledge videos: verified research briefs, story templates, a 15-formula hook bank, delivery marking, and a visual identity. The Newton script, "Was Newton financially dumb?", came from that system and not from the app. Upcreate v2 has to carry that system.

**The Newton Reel and the change of plan.** The Newton Reel runs about 78 seconds (183 spoken words). Its structure is the one he wants to keep: a question hook, a 2008 chess eye-tracking study, a twist, Newton's 1720 South Sea loss, a Buffett quote, and a last line that answers the hook. Shardul's judgement is that an account with about 800 followers has not earned 78 seconds from a stranger. On 12 Nov he had the same structure rewritten as a 20-second Reel on the planning fallacy (Appendix B). That is the model for most of what the app should now produce: **the same story engine at 20 to 35 seconds**, with longer versions earned later.

**Why short first is reasonable.** According to the research in his project (checked 7 Nov 2026): Instagram shows a Reel from a small account to a small test audience first and widens it if it performs; its head has named watch time, likes and sends as the top ranking signals, with sends weighing most for reaching non-followers; and Reels Insights now reports a skip rate for the first three seconds. My reading: a short video that people finish is the cheapest way to earn that first widening. I have not re-checked these platform facts today, so treat them as his project's findings and not as something to print in the app as current fact.

**What "retention" and "right audience" mean in the app. [Proposed]**

| Focus | Measures the app tracks per post |
|---|---|
| Retention | Skip rate in the first 3 seconds; average watch time; **watch-through**, which the app calculates as average watch time divided by video length. |
| Right audience | Share of reach from non-followers; follows per 1,000 accounts reached; sends per 1,000 accounts reached; and which audience group the piece was written for. |

---

## 3. What is wrong with the current app

Each point below is a reason for a decision in sections 4 to 10. The numbers come from the export.

1. **Too many places.** The export lists about 20 destinations (Dashboard, Brand, Onboarding, Calendar, Pipeline, Research, Hook Lab, Scripts Write, Improve, Library, Carousels Create, Carousel Library, Production Planner, Media Bank, Prompt Library, Publish, CTA and Funnel, Performance, Insights, Settings) across 33 routes. Five surfaces show sample data only: Publish, Media Bank, Version History, the command palette and the Settings modal.
2. **The library is volume, not fit.** There are 1,000 scripts in 15 batches, placed in weekly slots from 7 Oct 2026 to 29 Nov 2045. The export itself notes 42 duplicate titles and a concept mix of 987 "proven", 0 "double-down" and 13 "experimental" against a 70/20/10 target. No script has a source field, and some state first-person statistics (script 2: "87% of the MSMEs I've audited") that would have to be true and checkable before he says them on camera.
3. **Most scripts ask for production he does not do.** Only 295 of the 1,000 use the Whiteboard format. The rest call for reaction clips (182), camera-angle changes (151), an off-camera interviewer (101), voiceover on b-roll (99), green screen (28), location changes (25), clones (12) and similar. All 46 journey scripts are voiceover on b-roll.
4. **The fields do not match his three layers.** Scripts carry pillar, content type, angle, filming format, funnel, CTA type, effort, concept bucket, topic (53 values), segment (20 values), series and commentary source. There is no duration field at all. By my count of the spoken text, the median script is 63 words, and about three-quarters would run 30 seconds or less, but nothing in the app lets him ask for "a 20-second script".
5. **Scripts are thin.** A script is four blocks: Say, Film, On screen, CTA. There is no hook title, no one-sentence idea, no beats, no word budget, no sources and no delivery marks. Many are tip lists ("Level 1, Level 2, Level 3"), which his story rules reject.
6. **Almost every top-of-funnel script ends "Follow for..."** (506 of 515). His research prefers an ending that answers the hook and then stops, or one specific "send this to..." line.
7. **Nothing he learns reaches the generator.** Performance logging and "double-down" variants exist, but notes and results never change a prompt. The metrics also miss the ones he now cares about (skip rate, watch time, sends per reach, non-follower share).

**What is good and must stay.**

- Every generator shows its full prompt and offers **Generate** (with his AI key) and **Copy prompt** (for any chatbot). Shardul writes his best scripts in a Claude project, so this matters more in v2, not less.
- The prompt scaffold: retention plan, first draft, self-critique as a ruthless editor, final script, with five or fewer hard constraints kept apart from softer style guidance.
- The Improve flow: diagnose, protect strong lines, fix by severity.
- The three colour-coded script layers (what to say; filming direction; on-screen text and edit notes).
- The calendar month grid, the funnel-matched CTA rules, the carousel archetypes and craft rules, Word export, per-user data scoping, and the AI provider settings.

---

## 4. The new shape

### 4.1 Navigation [Decided: four areas. Proposed: the names and the home screen]

- A top bar with four tabs on desktop and a bottom tab bar on mobile: **Research · Studio · Content · Calendar**. Settings sits behind the account avatar. No sidebar, no groups, and at most one level of sub-tabs inside an area.
- **Home** (what he sees on opening the app) is four large doors, one per area, each showing one live number (ideas waiting, drafts in progress, pieces in Content, posts this week). Below them, one strip called "This week": the next scheduled pieces with their status, and any posted piece still waiting for its numbers. Nothing else. No level progress, no ratio meters, no trending panel.
- Shardul mentioned a "planner" as a possible fourth item. In this design the planner is the **Week view inside Calendar** (section 7), so the count stays at four.

### 4.2 Where every current page goes

| Current page | In v2 |
|---|---|
| Dashboard | Replaced by Home (four doors and "This week"). |
| Brand Foundation | Settings > Profile, cut down to the fields prompts use (section 10.3). |
| Onboarding survey and tour | Remove the tour. Keep the survey only if the app stays multi-user (open decision 4). |
| Calendar | Calendar > Month. Remove the 14 batch-import buttons. |
| Pipeline | Calendar > Week (status columns). |
| Outlier Research | Research > References. Keep the 5x rule and the CSV import. |
| Hook Lab | Studio step 3 (hooks). The hook formulas live in Research > Playbook. |
| Scripts > Write | Studio. |
| Scripts > Improve | Studio, "Improve" mode on any saved script. |
| Scripts > Library | Content. |
| Bulk script import | Content > Import (also accepts a script pasted back from Claude). |
| Carousels > Create | Studio with format set to Carousel. |
| Carousels > Library | Content with format filter set to Carousel. |
| Production Planner | Calendar > Week > Shoot sheet. The 12 filming formats are replaced by four production styles (Appendix A13). |
| Media Bank | Remove. |
| Prompt Library | Remove as a page. Each Studio step keeps "Show prompt" and "Copy prompt". |
| Publish | Remove. |
| CTA and Funnel | Funnel picker in Studio; the rules become a Playbook card. |
| Analytics > Performance | Calendar > post log (section 7.3). |
| Analytics > Insights | Calendar > Review (section 7.4). |
| Settings, Accounts | Keep. Add the danger zone (section 6.3). |
| Command palette, Version History (sample data) | Remove the palette. Make version history real for scripts (section 5.6). |
| Word export | Keep for a script, a shoot sheet and the teleprompter text. |

---

## 5. Studio

Studio is the only place where content is created. Shardul enters, sets four choices, and works down one page.

### 5.1 The brief bar [Decided: the layers. Proposed: the control]

A sticky bar at the top of Studio with four controls. Changing any of them updates the word budget, the beat template and the prompt.

| Control | Values |
|---|---|
| Format | Reel · Carousel |
| Duration (Reels only) | 20 s · 30 s · 35 s · 45 s · 60 s · 60 s+ |
| Type | Whiteboard explainer · History story · Authority · Build |
| Funnel | Top · Middle · Bottom |

Section 9 defines every value and what it changes.

### 5.2 Modes

| Mode | Starts from | What it does |
|---|---|---|
| **New** | An idea from Research, or a blank | Runs the steps in 5.3. |
| **Improve** | Any saved script | The existing diagnose, protect, rewrite flow. Locked lines are never rewritten. |
| **Resize** | Any saved script | Writes the same idea at another duration and saves it as a linked variant. Rule: remove whole beats in a stated order and narrow the idea; never squeeze the same content into fewer words. |
| **Paste from Claude** | Text pasted from a chat | Parses a finished script into the script structure (section 11) and classifies it into the three layers. |

Resize matters because the Newton script already exists at about 78 s and Shardul now wants 20 to 35 s versions of ideas like it.

### 5.3 The steps [Proposed]

One page, steps as collapsible sections. Each step can be done by hand, generated, or skipped. Each generated step has **Show prompt**, **Generate** and **Copy prompt**.

| # | Step | Output | Rules the app enforces |
|---|---|---|---|
| 1 | **Idea** | One sentence the viewer could repeat to a friend | 15 words or fewer. If it needs "and", it is two videos. Optionally attach a research brief; without one, any number in the script is flagged as unsourced. |
| 2 | **Angle** | One chosen angle | Generate seven angles with the lens named (Appendix A6). Mark the strongest two by relatable, novel, simple. |
| 3 | **Hook** | The hook (the first sentence he says, also shown as text on his face) and the line that follows it | Generate five from the formula bank (A4). Score each on the five-point pick test; a hook needs 7 of 10. Banned phrases are rejected. |
| 4 | **Skeleton** | Beats with a time budget, written as a causal paragraph | Template chosen from Type and Duration (section 9). Every sentence starts with But, So, Because, Which means, or a date. |
| 5 | **Script** | The script in beats, three layers per beat | Live word count and estimated seconds against the budget. Line tools in 5.4. |
| 6 | **Check** | A pass or fail list | Section 5.5. |
| 7 | **Delivery** (optional) | The script marked for how to say it; teleprompter text | Notation in A10. Words and facts cannot change at this step. |
| 8 | **Save** | A Content item | "Save" and "Save and schedule" (opens a date picker; creates the Calendar entry). |

For carousels the steps are Idea, Hook slide, Slides, Check, Save, using the existing archetypes and carousel rules (A15). Add one shortcut: **Make a carousel from this Reel**, which turns a script's whiteboard idea into a saveable cheat-sheet carousel.

### 5.4 Line tools [Proposed, from how Shardul actually works]

Shardul usually writes his own lines and asks for alternatives to specific ones. On the Newton script he kept eight lines exactly as written and asked for options on three. The editor must support that.

| Tool | What it does |
|---|---|
| **Options** | For the selected line, return five or six alternatives, the recommended one first, each with a one-line reason. Other lines are not touched. |
| **Correct only** | Fix facts and grammar across the script and change nothing else. List every change with its reason. |
| **Tighten** | Cut words to reach the budget without changing meaning or facts. |
| **Lock** | Mark a line as his. No tool or regeneration may change a locked line. |
| **Swap bank** | For the hook, the joints between sections, and the ending: show a small bank of alternatives to drop in. These three places are where viewers leave. |

### 5.5 Checks at step 6 [Proposed]

Automatic where the app can compute it; a tick box where it needs judgement (the AI may pre-fill the ticks with a reason).

| Check | Rule |
|---|---|
| Length | Word count within 5% of the budget for the chosen duration. |
| Hook | 8 words or fewer, so it can be said in 3 seconds. No banned phrase. Pick-test score 7 or more. |
| One idea | The idea sentence appears, nearly word for word, in the mechanism or the last beat. |
| Sentences | Average 12 words or fewer; none over 20. |
| Concrete | At least one name and one year or number. |
| The turn | For 30 s and longer, a "but" lands between 30% and 50% of the script. |
| Facts | Every number, name, date and quote links to a fact in the attached brief with status Verified. Unlinked ones are listed as "unsourced". |
| Misquotes | Scan for the guardrail phrases in A11 and show the correction. |
| Kit | No b-roll, stock footage, green screen, second camera or AI visuals in the direction layers. |
| Ending | Two sentences or fewer after the payoff. The last line answers the hook. The call to action matches the funnel stage (A9). |
| Story | The 12-question "is this a lecture?" test (A7), all yes. |
| Duplicate | Warn if the title or idea closely matches something in Content. |

A failed check never blocks saving. It shows as a warning on the Content item.

### 5.6 Versions and references

- Every save of a script creates a version. Show the list and allow restore. This replaces the sample-data Version History panel.
- Any script can be marked **Reference**. Reference scripts are the worked examples placed in prompts (section 10.2). Start with the two in Appendix B.

### 5.7 Working with Claude outside the app [Proposed]

Two buttons make the app and Shardul's Claude project work together:

- **Copy brief for Claude**, available at any step: copies one block of text holding the brief-bar choices and budgets, the idea, the attached research facts, the playbook cards that apply, his rules and lessons, and the output template.
- **Paste from Claude** (the mode in 5.2): brings the finished script back without retyping.

---

## 6. Content

### 6.1 The list

One list for scripts and carousels. Each row shows: title, format, duration, type, funnel, status, and, once posted, watch-through and sends per 1,000 reached.

- **Filters, in this order:** Format · Duration · Type · Funnel · Status. One search box. A "More" control holds the optional tags (topic pillar, audience group, series, reference).
- The old filters (effort, segment, content type, pillar as authority or journey, concept bucket, filming format, angle, commentary source) leave the interface. Keep the columns in the database if dropping them is risky; just stop showing them.
- Keep lazy loading of script bodies and paging, as now.

### 6.2 An item

Opening an item shows the script in its beats and three layers, its checks, its versions, its calendar entry, and its performance and notes once posted. Actions: Open in Studio, Improve, Resize, Make carousel, Schedule, Duplicate, Mark as reference, Delete.

### 6.3 Delete [Decided: he wants it. Proposed: the mechanics]

| Where | Action |
|---|---|
| An item | Delete, with a confirm. |
| The list | Select several, then "Delete selected". When a filter is on, "Delete all N shown". |
| Settings > Danger zone | **Delete all scripts**, **Delete all carousels**, **Clear the calendar**. Three separate buttons, each showing its count. |

Rules:

1. Before a bulk delete, offer a JSON backup download, ticked by default. (The export file `UPCREATE_COMPLETE.md` already holds the full text of all 1,000 scripts and 100 carousels, so nothing is lost for good.)
2. A bulk delete needs the count typed in to confirm.
3. Deleting a script also deletes its calendar entries, versions and any hook rows tied only to it. Logged posts in the performance table are Shardul's real history: keep them and clear the link.
4. Everything is scoped to his user id.
5. **Deleted seed content must not come back.** Remove the batch-import buttons and the seed actions. Once the delete ships, remove `lib/seed-data/*` and the roughly 1,400 lines of seed functions from the build. Check that no "is seeded" flag can trigger a re-import, and note that the export lists "reset leaves imports locked" as a known issue in the same area.
6. On first load after the release, show a one-time banner in Content: "1,000 starter scripts and 100 starter carousels from the old library are still here", with **Download backup**, **Delete all** and **Keep for now**.

After the wipe, Content holds only the two reference scripts in Appendix B and whatever he writes next.

---

## 7. Calendar

### 7.1 Month [keep, simplified]

The existing month grid. Click a day to schedule any Content item; drag an item to move it. Each entry shows title, the three layer tags and a status dot.

- Remove the 14 one-click batch imports and the quick-stat row except "this week" and "overdue".
- Nothing is scheduled automatically. The calendar starts empty after the reset.
- Gentle warnings, never blocks **[Hypothesis, from his research]**: two pieces of the same type in a row; a duration marked "not yet earned" (section 9.2); more than the weekly target. The starting cadence is three Reels a week (Monday, Wednesday, Saturday, about 7:30 pm IST), editable in Settings.

### 7.2 Week (the planner) [Proposed]

Columns by status: **Idea · Researched · Scripted · Shot · Edited · Posted · Reviewed**. This is the old pipeline with one new last step. Drag a card to change status.

**Shoot sheet:** select the scripted cards for one recording session and export one document with, per script, the whiteboard preparation, the teleprompter text and the delivery-marked script. This is what remains of the Production Planner.

### 7.3 The post log [Decided: numbers and free notes. Proposed: the fields]

When a piece moves to Posted, ask for the Reel link and date. The app then asks for numbers twice: about 48 hours after posting and again at 7 days. All fields are optional and typed in by hand (there is no Instagram API for this).

| Group | Fields |
|---|---|
| Reach | Views · accounts reached · share from non-followers |
| Retention | Average watch time (seconds) · skip rate in the first 3 s · where most people left (free text, for example "at 0:07, when the study starts") |
| Response | Likes · comments · sends · saves · follows gained |
| Calculated by the app | Watch-through · sends, saves and follows per 1,000 reached |
| His notes | What worked · what did not · questions people asked in comments · anything else |

Recurring comment questions are worth keeping: his strategy notes treat them as the seed for a future lead magnet or product.

### 7.4 Review [Proposed]

A table of posted pieces grouped by any one of: duration, type, funnel, hook formula, audience group, topic pillar. For each group: number of posts, median watch-through, median skip rate, median sends per 1,000 reached, median follows per 1,000 reached.

- With fewer than three posts in a group, show the numbers greyed with "too few posts to compare".
- From any post or group: **Save a lesson** (section 10.1) and **Make another like this**, which opens Studio with the same layers and hook formula and tags the new piece as a follow-up.
- No invented recommendations. The current Insights page already removed fabricated advice; keep that standard.

---

## 8. Research

Research answers the four questions Shardul listed: what kinds of script he wants, what whiteboard scripts are, what types of production he wants, and what his videos should look and feel like. It also holds ideas and verified facts. Four sub-tabs.

### 8.1 Ideas [Proposed]

- A capture box at the top, always visible: one line of text, an optional link, Enter to save.
- Two boards, following the method in his strategy notes: **Proven elsewhere** (an idea backed by a post that performed well for someone else) and **My favourites** (an idea he simply loves). His notes say a strong piece combines the two through his own point of view.
- Each idea can be scored with the 10-point shareability test (A12): film at 7 or more, rework at 5 or 6, drop at 4 or less.
- **Send to Studio** opens Studio with the idea in step 1.
- Seed this list with the ideas in Appendix B4.

### 8.2 Briefs [Proposed]

A brief is the verified research for one topic. Studio may only state facts that are in a brief.

| Field | Content |
|---|---|
| Question | The topic as one testable question. |
| One-line answer | The honest answer in 20 words or fewer. |
| Facts (5 to 8) | Each with: the fact in plain words, the number, the on-screen citation line (`Author, Year, Journal`), sample and design, replication status, a one-line caveat, a link, the date checked, and a **status**. |
| Story anchors (2) | A dated scene with a person and a place, each with its source. |
| Twist (1) | The finding that reverses the common belief. |
| Do not say | The myth versions and over-claims to avoid. |

Fact status has three values: **Verified** (Shardul opened the original source), **Known** (believed true, not yet re-checked), **Unverified**. Only Verified facts pass the Studio fact check. Known facts must be upgraded before filming. Unverified facts are cut.

A "Draft a brief" generator may propose facts and sources, but everything it returns starts as Unverified. Only Shardul can mark a fact Verified. An AI answer is never a source.

### 8.3 References [keep, reduced]

The existing outlier log: posts from small and mid-sized creators with views divided by followers, the 5x rule, and the CSV import. Add a field for "what principle to borrow". Move the transcript-to-template tool here as **Break down this Reel**: it returns the structure of a reference video, never its wording. An entry can be promoted to an idea on the "Proven elsewhere" board.

### 8.4 Playbook [Proposed]

Editable cards that hold the knowledge in Appendix A. Each card has a title, a body, a group, and a switch "use in prompts".

| Group | Cards (seeded from) |
|---|---|
| Kinds of script | The three layers; templates per type; duration budgets (section 9, A5) |
| Whiteboard scripts | What they are; rules for the board (A5, A13) |
| Production | The four production styles; recording settings (A13) |
| Look and feel | The visual identity; what stays out (A13) |
| Writing | Hook bank; angles; story rules; writing checklist; endings; notation (A4, A6 to A10) |
| Research standard | Source tiers; claims to be careful with (A11) |
| Platform | Notes on how Instagram ranks Reels, each with its date (A14) |

Shardul can add cards and edit any of them. This is where he keeps researching the questions above, and what he writes here flows into prompts.

---

## 9. The classification layers

### 9.1 Format

Reel or Carousel. Carousels keep their existing eight archetypes and rules (A15) and use Type and Funnel but not Duration.

### 9.2 Duration [Decided: the six values. Budgets from his scripting rules]

Plan at 2.5 spoken words per second. Use 2.3 for a line said while drawing and 2.7 for plain talk. The editor lets him mark a line as "drawing", and the time estimate uses the slower rate for it.

| Duration | Word budget | Beats | Board images | Re-hooks | Planned silences |
|---|---|---|---|---|---|
| 20 s | 45 to 55 | 4 or 5 | 1 | 0 | One long hold on the key number |
| 30 s | 70 to 80 | 5 | 1 | 1 | One long hold |
| 35 s | 80 to 95 | 5 or 6 | 1 | 1 | One long hold |
| 45 s | 105 to 120 | 7 | 1 or 2 | 1 or 2 | 1 breath of 1.5 to 4 s |
| 60 s | 140 to 160 | 7 | 2 or 3 | 2 or 3 | 2 breaths |
| 60 s+ (plan as 90 s) | 210 to 240 | 7, with an optional second turn | 3 or 4 | 4 | 3 breaths |

His scripting rules give budgets for 30, 45, 60 and 90 s. The 20 s and 35 s rows are calculated here from the same speaking rates.

Rules that apply at every duration:

- The main question opens in the first 3 seconds and is answered in the last 10 to 25% of the runtime.
- A second open question is allowed only from 45 s up. Never more than two open at once.
- To make a piece shorter, narrow the idea and remove whole beats. The first beat to go is the second proof (in the planning-fallacy script, the Sydney Opera House line).

**Short first [Hypothesis].** Settings holds a list of "earned" durations. Start with 20 s, 30 s, 35 s and 45 s earned, and 60 s and 60 s+ not yet earned. Choosing an unearned duration shows a one-line reminder and nothing more. Shardul ticks a duration as earned when the Review table shows the shorter ones are holding viewers. No published benchmark exists for what "holding" means, so the app must not invent a threshold; he sets it from his own first ten posts. A reasonable starting week is three Reels: two at 20 to 35 s and one at 45 to 60 s.

### 9.3 Type [Decided: the four types and "storytelling everywhere"]

| Type | What it is | Templates (A5) | Production style (A13) |
|---|---|---|---|
| **Whiteboard explainer** | He explains one idea and the board carries it: one drawing, at most three labels, the name written last. | Framework reveal · The study · Misconception to correction | Board-led |
| **History story** | A story with historical context, like the Newton script. A dated scene carries the idea. | Newton engine · A historical figure's system · Origin of an everyday thing · Then and now | Cards-led |
| **Authority** | His own position on a question, backed by his own work or a strong source. | Authority take | Face-led |
| **Build** | He is building something and shows where it stands. | Build log, and the series formats | Show-and-tell |

**Storytelling is a gate, not a type.** Every script of every type must have at least three story atoms (a person, a date, a place, an object, a number pair, a misconception, a cost), must join its beats with "but" or "so" and never "and then", and must bring its opening image back at the end. Step 4 and the checks in step 6 enforce this.

The first two types rest on templates Shardul has already used. The Authority and Build templates are drafted in this brief from the old app's playbook and his story rules. They have not been tested on a real Reel, so show them to him before treating them as settled (open decision 3).

### 9.4 Funnel [keep the existing rules, change the endings]

| Stage | Viewer | What the script does | How it ends |
|---|---|---|---|
| **Top** | A stranger | The broadest, strongest hook. No mention of his business. | The last line answers the hook, then the video stops. At most one specific "send this to..." line. Never "follow for more". |
| **Middle** | Someone who has seen him before | One layer deeper, more specific or more personal. | One specific question, or one value exchange ("comment X and I'll send the checklist"). |
| **Bottom** | Someone close to a decision | Speaks to a person who already trusts him. | One explicit next step, said once, near the end (a DM keyword or the link). |

Never reuse the same closing words across stages. While the focus is retention and audience, expect most pieces to be Top **[Hypothesis]**.

### 9.5 Optional tags

Kept out of the main filters and shown under "More": topic pillar (the seven in A3, plus "Upforge and consulting"), audience group (the three in A2), send target (free text: who this gets sent to), series name, hook formula (filled in by step 3), and reference.

---

## 10. The learning loop and the prompts

### 10.1 Rules and lessons [Decided: feedback must shape future scripts. Proposed: the mechanism]

Two short lists, both editable in Settings and both visible in Studio.

| | **Rules** | **Lessons** |
|---|---|---|
| What | A standing instruction from Shardul about how his scripts or videos should be. | Something learned from a posted piece. |
| Example | "Keep my wording. Offer options for a line; do not rewrite it unasked." | "A 78-second Reel is too long for this account at about 800 followers." |
| Fields | Text · category · on or off | Text · scope (hook, structure, length, topic, delivery, edit, audience) · applies to (any duration, type or funnel, or all) · evidence (linked posts) · status (testing, confirmed, retired) |
| Created | By Shardul. Also offered whenever he rewrites or rejects generated text: "Remember this as a rule?" | By Shardul from a post or the Review table. A "Suggest lessons" button may draft candidates from recent numbers and notes, but nothing is saved until he approves it. |
| Seed | Appendix B2 | Appendix B3 |

Every Studio prompt includes all active rules and every lesson that is not retired and whose "applies to" matches the brief bar. If the list grows past about 15 lessons, keep the most recent and the confirmed ones.

### 10.2 How a prompt is assembled [Proposed]

Keep the existing scaffold (retention plan, draft, self-critique, final). Build each prompt from these blocks in this order, and keep the full prompt visible through "Show prompt":

1. **Task.** One paragraph: what to produce and for which step.
2. **Hard constraints.** Exactly the five below.
3. **The brief.** Format, duration, word budget, beat template with time shares, type, funnel and its ending rule, audience group, the idea sentence, the chosen angle and hook.
4. **Facts.** The Verified facts from the attached brief, with citation lines, and the do-not-say list.
5. **Shardul's rules, then his lessons.** Introduced with: "These come from Shardul's own feedback and results. They override the general guidance below."
6. **Playbook cards for this step.** For example the hook bank at step 3, the story rules at step 4, the writing checklist at step 5.
7. **Reference scripts.** Up to two, the nearest in type and duration.
8. **Output template** for the step.

The five hard constraints:

1. Use only facts from the attached brief that are marked Verified. Never invent a number, study, quote, date or client result. Where a fact is missing, write `[FACT NEEDED: what]`.
2. Stay within the word budget.
3. Use only visuals his setup can make: his face, the whiteboard, a hand-drawn overlay, a full-screen text card, a caption, a sound.
4. One idea. The hook is 8 words or fewer, and the body pays off exactly what the hook promises.
5. Return locked lines unchanged, and follow Shardul's rules and lessons over anything else in this prompt.

### 10.3 Profile (what remains of Brand Foundation)

Keep only what prompts read: name and handle; the positioning line; the three audience groups; language (English first, Hinglish as seasoning); the setup constraints; topic pillars; founder story (used by Authority and Build); call-to-action assets (DM keyword, link); weekly cadence; earned durations. Remove from the interface: level progress, ratio targets, equipment list, AI stack, profile checklist, brand colours and fonts for the old video look.

---

## 11. Data model [Proposed: adapt to the real schema]

The export says `ensureSchema()` creates and alters tables on first query, and every table has a `user_id`. Extend what exists.

| Table | Change |
|---|---|
| `scripts` | Add: `duration_s` (20, 30, 35, 45, 60, 90) · `type` (whiteboard, history, authority, build) · `template` · `one_idea` · `hook_text` · `hook_formula` · `word_count` · `est_seconds` · `beats` (JSON, below) · `checks` (JSON) · `brief_id` · `parent_id` and `variant_kind` (resize, follow_up) · `is_reference` · `source` (seed, studio, import) · `topic_pillar` · `audience_group` · `send_target` · `series`. Keep `funnel`. Stop showing the old classification columns. |
| `script_versions` (new) | `script_id` · version number · snapshot (JSON) · created at. |
| `carousels` | Add: `type` · `topic_pillar` · `audience_group` · `parent_script_id` · `is_reference` · `source`. Keep `funnel`. |
| `ideas` (new) | Text · board (proven, favourite) · link · note · score (JSON) · status (new, researching, ready, used, dropped) · `brief_id` · `reference_id`. |
| `briefs` (new) | Question · one-line answer · facts (JSON list; each fact as in 8.2) · anchors · twist · do-not-say · checked on. |
| `own_posts` | Add: link to script or carousel · Reel URL · video length · snapshots (JSON list of the 48-hour and 7-day numbers in 7.3) · where people left · notes (worked, did not, comment questions). |
| `lessons` (new) | As in 10.1. |
| `rules` (new) | As in 10.1. |
| `playbook_cards` (new) | Key · title · body (Markdown) · group · use in prompts · which Studio steps it applies to. |
| `calendar_items` | Allow a carousel link if missing. Add the status "reviewed". The existing status "filmed" can stay in the database and be labelled "Shot". |
| `outlier_research` | Keep; add "principle to borrow". |
| `hook_stacks`, `script_templates` | Fold into Studio and References, or leave unused. Your call from the code. |

One beat in `scripts.beats`:

```json
{
  "beat": "hook",
  "say": "Why isn't your worst case bad enough?",
  "board": "Open palm on \"enough\".",
  "screen": "Hook text on face, yellow bold, one word per line.",
  "drawing": false,
  "locked": true,
  "fact_ids": []
}
```

`say`, `board` and `screen` are the three existing colour layers under clearer names: what to say; what his hands and the whiteboard do; what the edit adds on screen and in sound.

---

## 12. Build order and acceptance checks

### Phase 1: simplify and clear

1. New navigation and Home (section 4).
2. Content with the five filters and the new columns (sections 6 and 11).
3. Delete: single, selected, filtered, and the three danger-zone buttons, with backup and typed confirmation; seed imports removed (section 6.3).
4. Remove Media Bank, Publish, Prompt Library, the command palette, the tour and the dashboard widgets.
5. Seed the Playbook cards, rules, lesson, ideas and the two reference scripts (Appendices A and B).

Done when:

- Opening the app shows four doors and "This week", and the navigation has four tabs.
- "Delete all scripts" takes the count from 1,000 to 0, removes their calendar entries, and a page reload or redeploy does not bring any back.
- Content can show "Reels · 20 s · History story · Top" in three clicks.
- No page shows sample data.

### Phase 2: Studio

1. The brief bar, the steps and the modes (section 5).
2. The prompt builder with rules, lessons, playbook cards and reference scripts (section 10.2).
3. Line tools, checks, versions.
4. "Copy brief for Claude" and "Paste from Claude".
5. Briefs and fact linking (section 8.2).

Done when:

- With no AI key set, Shardul can still complete every step by hand or with "Copy prompt".
- A 20 s script over 58 words shows as over budget, and the estimate changes when a line is marked "drawing".
- "Options" on one line returns alternatives for that line only and leaves locked lines untouched.
- A number with no Verified fact behind it appears in the check list as unsourced.
- Pasting the planning-fallacy script from Appendix B fills the beats, classifies it as Reel, 20 s, History story, Top, and shows it a few words over budget.
- Resizing the Newton script to 30 s produces a linked variant within 70 to 80 words.

### Phase 3: the loop

1. Post log with the two snapshots and notes (section 7.3).
2. Lessons and rules in Settings and in prompts (section 10.1).
3. Review table and "Make another like this" (section 7.4).
4. Week view and the shoot sheet (section 7.2).

Done when:

- A lesson saved from a post appears, word for word, in the next Studio prompt whose layers match.
- Retiring a lesson removes it from prompts.
- Review shows medians by duration and greys out any group with fewer than three posts.

### Phase 4: housekeeping, from the export's own issue list

Store AI keys encrypted (they are plain text in `ai_settings`). Decide on open signup (open decision 4). Give the Vercel preview environment a `DATABASE_URL`. Update the README and `.env.example`. Add tests for bulk delete, the word-budget calculation and prompt assembly.

### Interface

Keep the current design system (the lime accent on parchment, Geist, rounded cards). It is the app's look and is separate from the look of his videos. Use one primary action per screen. Drop the mock Reel cards and decorative motion. Write interface text in plain words: "Top of funnel", not "TOFU", on first use.

---

## 13. Open decisions for Shardul

Each has a default so you are not blocked. Confirm them with him when convenient.

| # | Question | Default in this brief |
|---|---|---|
| 1 | Should "delete all" also clear the carousels and the calendar in one action? | Three separate buttons. Deleting scripts removes their own calendar entries. |
| 2 | Is the planner a fifth area or part of Calendar? | Part of Calendar, as the Week view. |
| 3 | Are the Authority and Build templates (A5) right? | Use the drafts; mark both "draft" in the Playbook until he edits them. |
| 4 | Is the app for him alone? | Yes. Close public signup; keep per-user scoping. |
| 5 | Should the app itself get a new visual style? | No. Keep the design system and simplify the layout. |
| 6 | Should carousels follow the video identity (dark paper, yellow accent, plain bold type) or keep photo backgrounds? | Default new carousels to the video identity on a solid background; keep the background options. |
| 7 | What watch-through makes a duration "earned"? | Unset until he has ten posts logged. |
| 8 | Do consulting topics stay? | Yes, as the topic pillar "Upforge and consulting", mainly under Authority and Build. |

---

# Appendix A: the knowledge the app must carry

Load this into the Playbook cards (section 8.4) and use it in prompts (section 10.2). It is condensed from Shardul's production system, his identity sheet, his research briefs and his scripting skills. Where two of his documents disagree, this appendix follows the newer one; Appendix C lists what was replaced.

## A1. Setup, language and limits

- **Setup:** phone camera, indoors, talking to the lens, microphone in frame, whiteboard beside him. No b-roll, no outdoor shots, no second camera, no stock footage, no AI-generated visuals.
- **Allowed visuals:** his face; the whiteboard; a hand-drawn overlay; a full-screen text card; a caption; a sound. A third-party chart or document may appear only with his own annotation and spoken explanation.
- **Language:** English first. Hinglish is seasoning, about one phrase in five at most, for warmth or an aside. The core claim and all numbers stay in English.
- **Tone:** evidence over outrage; never makes the viewer feel lazy; says "one study", "contested" or "company data" when that is the truth.
- **Reference creator:** Vyom Bhatia, for pacing and for turning history into story. Borrow the structure. Never copy his sign-off lines, series card or topics (Indian economy and geopolitics are his lane; Shardul's lane is the inner life of knowledge work).

## A2. Audience

| Group | Who | What they send to others |
|---|---|---|
| Salaried knowledge worker, 22 to 35 | IT services, capability centres, consulting, startups. Teams, Outlook, Excel, office WhatsApp groups. | "Send to my manager" content; evidence on meetings, hours and AI at work. |
| Student or exam aspirant | UPSC, CAT, GATE, CA. Long study days, guilt about the phone. | Evidence-based study methods; myth-busts of study advice. |
| Global English-speaking viewer | Includes Indians abroad. Already reads the well-known productivity authors and is tired of hustle content. | A sharp angle they have not seen elsewhere. |

They value autonomy and evidence. They dislike hustle sermons, tool tours, fake statistics and AI-voiced stock montages.

## A3. Topic pillars

1. Named effects, tested (always with replication status)
2. Origin stories of everyday things
3. How great minds worked (from primary sources)
4. Learn smarter (evidence-based studying)
5. Systems and frameworks on the whiteboard
6. Work in the age of AI, with an India lens
7. India's knowledge institutions
8. Upforge and consulting (added in this brief for Authority and Build pieces)

## A4. Hooks

**What a hook is now.** The first sentence he says: 8 words or fewer, a question or a sharp claim, starting on the first frame with no greeting. It appears as text on his face, word by word, as he says it. The next line opens the story.

**Formula bank.** Step 3 generates one hook from each of five formulas.

| # | Formula | Example hook | Line that follows |
|---|---|---|---|
| 1 | Big question | Why can't you forget unfinished work? | You forget ten finished tasks. But the one you left halfway follows you to bed. |
| 2 | Contrarian snapback | Learn less. Seriously. | Everyone says widen your skills. Warren Buffett did the opposite. |
| 3 | Specific number | 90,000 index cards. | One sociologist wrote them over 45 years, and called the box his conversation partner. |
| 4 | In the middle of the scene | 1767. A botanist runs out of paper. | Uppsala. Carl Linnaeus has too many plants and not enough pages. |
| 5 | You and your pain | Your to-do list is lying to you. | Your list says twelve tasks. Your brain is tracking the three you started. |
| 6 | Myth-bust | The index card wasn't a librarian's idea. | Before libraries ran on cards, a botanist was cutting paper into slips. |
| 7 | Famous-name anchor | Why Buffett said no to Google. | He has admitted he missed it. The reason is one circle. |
| 8 | Mistake or confession (only if true) | I learned the wrong things for two years. | One drawing fixed it. |
| 9 | Versus | Size versus edge. | What matters more: how much you know, or knowing where it ends? |
| 10 | What X gets wrong | Productivity advice gets memory backwards. | Most advice says finish everything. A 1920s lab suggests leaving one thing open. |
| 11 | Whiteboard reveal | One circle. | (He draws it in silence.) This circle explains most of your bad decisions. |
| 12 | Old study, new life | A 1927 experiment about waiters. | The story goes: a waiter remembered every unpaid order, and forgot it once the bill was paid. |
| 13 | Stakes | Do this before you close your laptop. | One odd thing tonight, and tomorrow starts itself. |
| 14 | Hinglish tag | Kabhi notice kiya? | The song you didn't finish humming is the one stuck in your head. |
| 15 | Series slot | The hook, then a one-second series card | Only once he has named a series. |

**Pick test.** Score 0 to 2 on each; a hook needs 7 of 10.

1. Understandable with the sound off.
2. Has a concrete noun, number or name.
3. Opens a gap that only this video closes.
4. True: the body delivers exactly what it promises.
5. Can be said in 3 seconds.

**Banned:** "In this video I'll", "Hey guys", "Did you know" without a specific, "You won't believe", "game-changer", "secret", "hack", "stay till the end", and any claim the body does not pay off.

## A5. Structures

**The seven beats** (45 s and longer), with their share of the runtime:

| # | Beat | Job | Share |
|---|---|---|---|
| 1 | Hook | Open a question the viewer needs closed. | first 3 s |
| 2 | Lean-in | Why the viewer should care: a pain, a scene, a stake. A concrete noun in the first 8 s. | about 10% |
| 3 | Setup | Who, when, what happened: a name, a year, a place. | about 20% |
| 4 | Turn | "But": the surprise or failed expectation. | about 10% |
| 5 | Mechanism | The idea itself, drawn. One picture, three labels at most. | about 25% |
| 6 | Apply | One thing to do today, said as a specific action. | about 15% |
| 7 | Payoff and exit | Close the hook's question with a callback. Stop. | 10 to 15% |

**At 30 to 35 s:** five beats. Merge Lean-in with Setup, and Mechanism with Apply.

**At 20 s:** four or five beats: Hook, one fact or scene, the twist, an optional second proof, the landing.

**Templates by type.** Each line is the beat order.

*Whiteboard explainer*

- **Framework reveal.** A decision the viewer gets wrong daily. Who drew the framework first and why. Draw the shape unlabelled and fill one cell with a live example. Name it last, at the turn. But: the trap or misuse. The viewer places one of their own tasks on it. Step back; one line.
- **The study.** The everyday feeling the study explains. The researcher, year and odd observation. What they did (two boxes or one graph). Ask the viewer to guess, and pause one second. The result as a number pair. But: the honest twist (replication, limits). What still holds, as one action. Callback to the opening feeling.
- **Misconception to correction.** State the belief as if true. Say fairly why it feels right. But: the evidence (study, year, number pair). Why the myth survives. The correct model, drawn beside the crossed-out myth. One test the viewer can run on themselves.

*History story*

- **Newton engine.** A question about a famous person or about the viewer. A dated study with a surprising result. The twist: what the result really showed. The idea, named and drawn. A dated historical case in which the idea costs someone something. A landing that answers the hook in words. At 20 s it compresses to: question, study with its numbers, the number that breaks the expectation, one line of history, landing.
- **A historical figure's system.** The output that sounds impossible, as a number. Who they were and the problem they had. What they tried that failed. The system, drawn in two or three parts. What it cost them. The viewer's version today, as one step. Return to the opening number.
- **Origin of an everyday thing.** Point at the object and ask who or why. Date, place and the inventor's problem. The failure or accident that forced the invention. How it spread, and one surprising consequence. What it really solves. Back to the viewer's own object. Callback.
- **Then and now.** A present-day question. Then: a date, a scarcity or disaster, a concrete object. The fix people found. But: the price of the fix. A number pair, then against now. The turn: the hook question reframed. A values line and a close of three words or fewer.

*Authority* **[draft, untested]**

- **Authority take.** A position stated plainly against a common view. The common view, said fairly. But: what he has seen, as one specific case from his own work, or one strong source. The principle, in one drawing or one sentence. One move the viewer can make. The position again, in fewer words.
- Rules: a claim from his own experience carries a "true for me" tick in place of a citation. Client details are anonymised. No percentage about his clients unless he has the count behind it.

*Build* **[draft, untested]**

- **Build log.** What is being built and what is at stake, or the number where it stands. Where it stood. What he tried. What broke, or what it cost. What changed. What comes next, left open for the next episode.
- Series formats kept from the old playbook: daily series, progress update, one lesson per episode, step by step, numbers and metrics, cost breakdown, what I would do differently.

## A6. Finding the angle

Step 2 generates seven angles, each one or two sentences with its lens named: at least two from thinkers who shaped him, two from other fields, one from his own life, one redefinition, one contrarian. First name the universal pain or desire under the idea. Mark the strongest two by relatable, novel and simple. Say plainly when an angle is weak.

The five questions behind it: How would a thinker I admire say this? How would I say it to my past self? How can I redefine the idea? What is the common view, and where do I disagree? Why does this matter to an ordinary person?

Nine ready shapes: myth to study; number shock; origin story; attribution twist ("X never said this"); it's not you, it's the system; the Indian translation of a Western idea; the expert who contradicts the popular claim; a then-and-now timeline; the cost of a habit (only with a source).

## A7. Story rules (apply to every script)

- Join beats with "but", "so" or "which means". One "and then" is allowed, to land an event.
- Open on a date, a place and a concrete thing within 5 seconds. Never open on a definition.
- Hold back the name, never the point. Describe the effect first; say and write its name at the turn.
- Numbers come in pairs and before the explanation. A number with no comparison is noise.
- One new idea every 7 to 10 seconds.
- Plant and pay off: whatever opens the video returns in the last 15%.
- Cut any side fact, joke or drawing that does not carry the idea.
- Keep the screen quiet during a human moment or a quote: face and caption only.
- An honest ending is an ending. "Nobody knows" or "it didn't replicate" closes a question, and often makes the best twist.
- Never use teasers ("wait for it"). The middle is held by cause and effect.

**Stakes: at least five of seven.** A named person. A date and a place. A physical object. A number pair. A cost. A link to something the viewer does this week. A counterfactual ("if this hadn't happened, you would...").

**"Is this a lecture?" All twelve must be yes.**

1. Is something happening in the first 5 seconds?
2. Can every beat be joined to the one before with "but" or "so"?
3. Is there a person who wants or loses something?
4. Does the viewer get a moment to guess before a reveal?
5. Is the name held back until the idea is felt?
6. Is there a "but" between 30% and 60% of the runtime?
7. Does every number have a comparison?
8. Is there a breath every 25 to 40 seconds (45 s and longer)?
9. Does the opening image return in the last 15%?
10. Would a friend who knows nothing follow every step?
11. Is every interesting-but-irrelevant fact cut?
12. Does the ending land a change, and not a summary?

## A8. Writing checklist

- Sentences average 12 words or fewer; none over 20; some of two to four words.
- Contractions everywhere.
- Every sentence passes "would I say this to a friend over chai?"
- At least one name, one year or number, one physical object.
- No jargon without an instant translation.
- Numbers written the way people say them.
- Every board or screen cue sits on the word it illustrates.
- A timed read within 5% of the budget. A line he stumbles on is rewritten, not practised.
- No generic AI phrasing ("delve", "unlock", "in today's fast-paced world"). No list of seven tips in 45 seconds. No definition before the stakes.

## A9. Endings and calls to action

Use one ending, then stop on the last meaningful word. No outro, no "that's it for today".

| Ending | When |
|---|---|
| Callback: the hook's image, now understood | Default at every stage. Example: "So no, Newton wasn't dumb. He just didn't know where his circle ended." |
| One send line for a named person | Top of funnel, when the topic has an obvious recipient. "Send this to the friend who re-reads notes the night before." |
| One specific question | Middle of funnel. |
| One explicit next step | Bottom of funnel. |

Top of funnel: no "follow for more". Middle: one ask, framed as a value exchange. Bottom: one ask, said once. Never the same closing words at two stages.

## A10. Notation

**Direction cues** go in the Board and Screen layers, in square brackets, before the word they land on.

| Cue | Meaning |
|---|---|
| `[WB: ...]` | He draws live on the whiteboard. Three seconds of strokes or less; three words or fewer per label; letters 8 cm or taller. |
| `[WB-PRE: ...]` | Drawn before recording and revealed. |
| `[WALL: ...]` | A hand-drawn diagram added in the edit on the wall beside his head. |
| `[ABOVE: ...]` | Short text or a small timeline above his head. |
| `[CARD: ...]` | A full-screen text card: a date, a place, the key number, a quote. |
| `[SRC: ...]` | Source line, shown briefly. |
| `[PAUSE 0.5]` `[PAUSE 1.5]` | A silence the edit must keep. |
| `[PUNCH]` | One hard zoom-in of 10 to 12%. |
| `[SFX: ...]` | A sound tied to something visible. |
| `[GFX: ...]` | Any other overlay. |

`[WALL]`, `[ABOVE]` and `[CARD]` are proposed here to match his three screen zones (A13). His older scripts use `[TITLE]`, `[GFX]` and `[EMPH]`; accept them on import.

**Delivery marks** go in the Say layer at step 7. They must work as plain text in any teleprompter; add colour as a second signal.

| Mark | Meaning |
|---|---|
| `(words)` | Slower. Stretch it, let it land. |
| `**word**` | Louder: pitch up, louder and longer. |
| `>words<` | Faster. A throwaway. |
| `°words°` | Softer, confiding. |
| `↑` before a word | Pitch up. |
| `↓` before a word | Pitch down; land it. |
| `/` | Short pause, about 0.3 s. May be trimmed in the edit. |
| `//` | A beat, about 0.8 s. Kept in the edit. |
| `///` | A hold of 1.5 s or more, for the reveal. Two per Reel at most. Kept. |
| `[verb]` at the start of a line | The intent: tease, provoke, explain, confide, warn, challenge, reveal, land, warm, deadpan. |
| `{cue}` | A physical cue on the next word: `{lens}` `{board}` `{draw}` `{tap}` `{point}` `{smile}`. |

Rules: one bold word per phrase and never more than two per sentence. Bold the noun, name, number or contrast word. `↓` on the last word of a statement that ends a beat. Never give the key word or the reveal to the whiteboard: say it to the lens, then turn and draw. If more than a third of a line is marked, remove marks. Because stressed words in Indian English tend to fall in pitch, every bold word gets all three: pitch up, louder, longer.

When the app gives Shardul guidance on a script, it quotes the actual line. It never says "line 3" and gives no timecodes unless he asks.

## A11. Research standard

**Source tiers.** Proof on screen: peer-reviewed papers, meta-analyses, official records, primary historical documents, university archives. With "according to": expert books, major newspapers, institutional reports. Never as proof: Wikipedia (use it to find the primary source), blogs, listicles, other creators, quote sites, social posts, AI output.

**On screen:** `Author, Year, Journal`, shown briefly when the claim is spoken. Say the sample and design in one clause ("thirty-seven students, one study"). A single study is called a single study. A failed or contested replication is said out loud. Numbers keep their unit and year. Every famous quote is checked against the primary text first.

**Claims to be careful with.** If a script contains the left column, show the right.

| Popular claim | Safe wording |
|---|---|
| 10,000 hours to mastery | Practice matters a lot in chess and music, and surprisingly little in most jobs. |
| 21 days to form a habit | Closer to two months on average, and it varies hugely. |
| Multitasking costs 40% | Every switch has a time cost; in some lab conditions it adds up to a lot. |
| An 8-second attention span, less than a goldfish | Myth-bust only. Nobody has measured a goldfish. |
| Our attention span is 47 seconds | We switch screens about every 47 seconds. |
| 23 minutes to refocus | It can take about 25 minutes to return to the original task, usually after doing other things. |
| 93% of communication is non-verbal | Myth-bust only. |
| Left-brained and right-brained people | Functions lateralise; people don't. |
| Learning styles | Match the method to the material, not to a "style". |
| Decision fatigue and the hungry judges | A famous study, now heavily questioned. |
| Willpower is a battery | The idea failed its biggest tests. |
| Unfinished tasks stick in memory (Zeigarnik) | They don't stick better, but they do pull you back. |
| The marshmallow test predicts success | It mostly measured circumstances, not character. |
| Dunning–Kruger | Novices tend to overestimate; how much is debated. Never as an insult. |
| The Eisenhower Matrix, by Eisenhower | Inspired by a line Eisenhower borrowed. |
| Pomodoro is scientifically proven | A structure that helps some people. |

**Findings that hold up** (still cite them): the testing effect, the spacing effect, the forgetting curve, the planning fallacy, the cost of task switching (the direction is robust; the size varies).

**Care rules.** No exaggerated health or money claims. No diagnosis language. Disclose when data comes from a vendor with something to sell. In work-culture debates, quote people accurately with the date and never mock them. Never use a real person's death as a hook, thumbnail or caption.

His project holds two fuller banks that Shardul can paste into Research: 47 topic ideas with hooks, and 30 verified findings with a misquote table (`research/02_knowledge_workers.md` and `research/12_topic_research_framework.md` in his Claude project).

## A12. Scoring an idea: the shareability test

One point each. Film at 7 or more, rework at 5 or 6, drop at 4 or less.

1. The takeaway fits in under 15 words.
2. It contradicts a common belief or reveals a hidden "why".
3. It evokes awe, indignation or mild anxiety. "Interesting" scores zero.
4. He can name who it gets sent to.
5. There is an action for today, or a reference worth saving.
6. A strong source can be shown on screen.
7. It has an Indian example or stake, or is deliberately universal.
8. The hook is paid off before the final 10 seconds.
9. Only Shardul could make it: his drawing, his angle or his story.
10. It is not one of the overdone effects, unless the angle is new.

One further test from his audience rules: one drawing must be able to carry the idea. If it needs footage he cannot shoot, reframe it as a drawing, a document, or something held to camera.

## A13. Production styles and the look

**Four production styles [the names are proposed; the elements are his].** All four share one canvas and one identity.

| Style | What the viewer sees | Used for |
|---|---|---|
| **Board-led** | The physical whiteboard is the second visual. He draws live; the edit traces his real strokes in yellow. | Whiteboard explainer |
| **Cards-led** | His face, plus quick full-screen cards for dates, places, the key number and quotes; drawings on the wall beside him. This is the Newton Reel. | History story |
| **Face-led** | Mostly him to the lens with captions, and one or two short text beats above his head. A quiet screen. | Authority |
| **Show-and-tell** | He shows the thing itself: his own screen recording, a document or object held to camera, the whiteboard as a progress board. Only material he recorded. | Build |

**What whiteboard scripts are.** The board is a picture, not a slide. One drawing per video, three labels at most, each label repeating the spoken noun, drawn on the word and not after it. The name of the idea is the last stroke. Anything that takes more than three seconds to draw is drawn before recording or added in the edit. In his research, freehand drawing held learners' attention 1.5 to 2 times longer than slides in a study of 6.9 million online-course sessions (Guo, Kim and Rubin, 2014).

**The look (identity sheet, version 2, 10 Nov 2026).**

- **Canvas:** 1080 × 1920. His landscape video sits whole in the middle (1080 × 608), never cropped to vertical, on a grained near-black page (`#141210`), never flat black. Keep everything important away from the top 360 px, the bottom 320 px and the right-hand 180 px, where Instagram's own buttons sit.
- **Colour:** one accent, yellow `#FFD60A`. No orange, no underlines, no italics.
- **Type:** few and plain. A Helvetica-class bold for the hook, cards and labels. One sans for captions.
- **Hook:** on his face, yellow, bold, capitals, one word per line as he says it; gone when the hook ends.
- **Three zones:** above his head, for short context text and timelines; the wall beside his head, for hand-drawn diagrams in black ink with yellow fills that he can pass in front of; full-screen cards on dark paper, on a hard cut, while his voice continues.
- **Cards are quick:** about a second for a date or place, up to about 2.5 seconds for a quote, and never two in a row without his face between them.
- **Sources:** small, on the card or flashed briefly. Never left on screen for the whole video.
- **Captions:** phrase by phrase, in sentence case, in the band under the video. Never over his face or the whiteboard. No word-by-word pop, no capitals, no emoji.
- **Drawings:** hand-drawn and slightly unpolished. Where possible they follow his real marker or fingertip.
- **Rhythm:** something changes on screen at least every 7 seconds; one hard zoom-in at the turn; silences trimmed except the marked pauses; the key number gets its own silence.
- **Sound:** a separate design for each section (hook, story, turn, conclusion). Rich, but never over the voice. One sound per visible event. Music changes only at section boundaries.
- **Never:** stock footage, AI b-roll, template lower thirds, neon word-pop captions, glass effects, purple or teal gradients, bounce animation, anything that reads as AI-made or templated.

**Recording basics for the shoot sheet.** Rear camera. Sit far enough back that the whiteboard is in frame. Lock exposure and white balance. Record two seconds of the empty board first. Marker letters 8 cm or taller. Three full takes: as marked; smaller, like telling one friend a secret; deliberately too big.

## A14. Platform notes

These come from his project's research, checked on 7 Nov 2026, and I have not re-checked them today. Store each as a Playbook card with its date so it can be reviewed, and do not present them in the interface as current fact.

- Instagram's head has named watch time, likes and sends as the top ranking signals; sends matter most for reaching non-followers (Jan 2025).
- Reels from smaller accounts are shown to a small audience first and widened if they perform (Apr 2024).
- Reels Insights reports a skip rate for the first 3 seconds (reported Aug 2025). Instagram publishes no benchmark; thresholds quoted by third parties are unverified.
- Trial Reels, which show a Reel only to non-followers, need 1,000 followers (Jul 2025). At about 800 he does not have them yet. When he does, use them to test hooks and the layout.
- Instagram has said content must be three minutes or less to be recommended; longer Reels are reported to reach mainly followers.
- Instagram's guidance prefers full-screen vertical video with no borders. No statement was found that a bordered layout is ranked lower. His landscape-in-vertical layout is a decided choice; the bands must look designed.
- Exaggerated health or money claims and clickbait are excluded from recommendations.
- The starting posting time (about 7:30 pm IST) rests on weak data. Re-pick it from his own Insights after four weeks.

## A15. Carousels

Keep `lib/carousel-reference.ts` as it is: the eight archetypes, the hook patterns, the craft rules (1080 × 1350, two font families at most, one idea per slide, body text never below 28 px, one call to action per carousel). Two additions: carousels take Type and Funnel like scripts, and the default design for a new carousel follows the video identity in A13 (open decision 6). Fix carousel 1 if any seed carousel is kept: its title says five mistakes and its slides say seven.

---

# Appendix B: starting content

## B1. Two reference scripts

Load both into Content, marked Reference. They are the worked examples for prompts.

### "Was Newton financially dumb?"

Reel · 60 s+ (about 78 s, 183 words) · History story · Newton engine · Top of funnel · Cards-led · Status: for Shardul to set.

> Was Newton financially dumb?
>
> In 2008, Oxford researcher Merim Bilalić tracked the eyes of some chess players.
>
> He gave them a position with two ways to win: one familiar, and one faster but unfamiliar.
>
> They all said they tried to find the faster way, but no one could.
>
> Their eyes kept going back to the familiar move.
>
> Then he removed the familiar move, and they all found the faster one.
>
> This pull towards the familiar is your circle of competence.
>
> It's built from everything you've learned or experienced.
>
> For Newton, it was mostly physics.
>
> In 1720, he owned shares in the South Sea Company.
>
> In April, he sold the shares for a big profit.
>
> But the price kept rising.
>
> So in June, he bought back in, with almost everything he had.
>
> In September, it crashed.
>
> He lost a third of his fortune.
>
> Warren Buffett said in 1996: "The size of that circle is not very important."
>
> Newton had one of the biggest in history.
>
> "Knowing its boundaries, however, is vital."
>
> So no, Newton wasn't dumb. He just didn't know where his circle ended.

Sources on screen: Bilalić, McLeod & Gobet, 2008, *Cognition* · Odlyzko, 2019 · Buffett, 1996 Berkshire letter.

Do not say: "Newton lost everything"; "grandmasters"; "Stanford"; the "madness of people" quote as fact; a June purchase price; "outside physics Newton was an ordinary man". Note for a future version: Buffett wrote this in a letter, so "wrote" is more accurate than "said".

Why it is a reference: the hook is a four-word question; every section joins with "but" or "so"; the name of the idea arrives after the viewer has felt it; the last line answers the hook.

### "Why isn't your worst case bad enough?"

Reel · 20 s · History story · Newton engine, compressed · Top of funnel · Board-led with two cards · Status: scripted.

Length: 60 words by my count. His script notes estimate about 55 words and 18 to 21 s. The app will show it a few words over the 20 s budget, which is right: he should time a real take.

> Why isn't your worst case bad enough?
>
> In 1994, psychologists asked students how long their thesis would take.
>
> Their guess: 34 days.
>
> Their worst case, if everything went wrong: 49.
>
> They took 56.
>
> The Sydney Opera House was due in 1963. It opened in 1973.
>
> So don't ask how long this will take. Ask how long the last one took.

Board: one long arrow; a tick at 34; a wall marked WORST CASE at 49; 56 written past the wall. If a take runs long, cut the Sydney line first.

| Fact | Source | Status |
|---|---|---|
| 37 students; predicted 33.9 days; worst case 48.6; actual 55.5; about 30% finished within their own prediction | Buehler, Griffin & Ross, 1994, *JPSP* 67(3), 366–381 | Known. Taken from a summary; confirm against the paper before posting. |
| Sydney Opera House: due December 1963 at $7 million; opened 20 October 1973 at $102 million | National Museum of Australia; Guinness World Records | Verified in his brief |

Do not say: "every student" or "nobody finished on time"; that this study discovered the planning fallacy (Kahneman and Tversky named it in 1979); that the Opera House overran through bad planning alone.

## B2. Rules to seed (Shardul's standing feedback)

Writing

1. Storytelling applies to every script, at every length.
2. Keep my wording. When I have written a line, offer options for it or correct facts and grammar. Do not rewrite it unasked.
3. When you guide me through a script, quote the actual line. No "line 1, line 2", and no timecodes unless I ask.
4. Short first: 20 to 35 seconds by default until my numbers earn longer.
5. The last line answers the hook. Then stop.
6. English first. Hinglish only as seasoning, never for the main claim.
7. Only what my setup can record: me, the whiteboard, drawings, cards, captions, sound.
8. Every number has a source. If something is contested or didn't replicate, say so.
9. Mark scripts for delivery: (brackets) for slower, **bold** for louder, and the other marks in the notation.

Look

10. Nothing that looks AI-generated, stock or templated. Slightly unpolished and hand-drawn is right.
11. One accent colour, yellow. No orange, no underlines, no italics. Few, plain fonts.
12. Hook text goes on my face, in yellow bold.
13. Captions sit under the video, never over my face or the whiteboard.
14. Full-screen documentary cards for dates, the key number and quotes. Keep them quick.
15. Sources appear briefly. They never stay on screen.
16. A separate sound design for each section, rich but never over my voice.
17. Cut anything that costs retention. (The echo card was removed from the Newton Reel for this reason.)

## B3. Lesson to seed

| Lesson | Scope | Applies to | Evidence | Status |
|---|---|---|---|---|
| A 78-second Reel is too long for this account at about 800 followers. Run the same engine at 20 to 35 seconds. | Length | All | The Newton Reel; Shardul's judgement, no numbers logged yet | Testing |

Seed only this one. Lessons must come from his posts, so the app should not ship with invented ones.

## B4. Ideas to seed

Put these on the "My favourites" board with status "new". They are leads from his research. Each needs a verified brief before scripting. The suggested type is a starting point.

| Idea | Suggested type |
|---|---|
| We switch screens about every 47 seconds; in 2004 it was 2.5 minutes | Whiteboard explainer (the study) |
| "21 days to build a habit" is a myth; the study found about 66 | Whiteboard explainer (misconception) |
| Re-reading notes loses to testing yourself after a week | Whiteboard explainer (the study) |
| Willpower isn't a battery: the big replications failed | Whiteboard explainer (misconception) |
| The 10,000-hour rule is half wrong | Whiteboard explainer (misconception) |
| Your first good idea blocks a better one (the chess study on its own) | Whiteboard explainer (the study) |
| Eisenhower never drew the Eisenhower Matrix | History story (origin) |
| Parkinson's law began as a joke in 1955 | History story (origin) |
| One man, 90,000 index cards, 70 books | History story (a figure's system) |
| Drucker's nurses: more time with patients without hiring anyone | History story |
| Why India runs on UTC+5:30 | History story (origin) |
| ISRO's first rocket parts travelled by bicycle | History story |
| The forgetting curve, measured in 1885 and again in 2015 | History story (then and now) |
| The office WhatsApp group is India's hive mind | Authority |
| The 4,000-week grid, drawn on the board | Whiteboard explainer (framework) |
| Rebuilding this content app and what it taught me | Build |

---

# Appendix C: what newer decisions replaced

If Shardul pastes in an older document, these parts of it are out of date.

| Older rule | Replaced by |
|---|---|
| Default length 45 to 75 s or 60 to 90 s; up to 150 s for stories (scripting and strategy skills, 7 Nov) | Short first: 20 to 35 s by default, longer when earned (Shardul, 14 Nov) |
| A 3 to 6 word title typed in the band above the video, with a longer spoken line under it | One spoken hook of 8 words or fewer, shown on his face (identity sheet version 2, 10 Nov) |
| Terracotta accent, one underlined caption word, a serif title, handwriting fonts | Yellow accent, no underlines, plain bold type (identity sheet version 2) |
| A source line under the captions for as long as the fact is on screen | Sources shown briefly, on cards |
| Upcreate: 130 to 145 words per minute with runtime multipliers | 2.5 words per second, 2.3 while drawing |
| Upcreate: 12 filming formats | Four production styles (A13) |
| Upcreate: authority and journey pillars; content type; angle; effort; segment | Type (9.3) and the optional tags (9.5) |
| Upcreate: proven, double-down and experimental buckets at 70/20/10 | "Make another like this" from Review tags a follow-up; no ratio meter |
| Upcreate: "Follow for..." as the default ending | Endings by funnel stage (A9) |
| Upcreate: 1,000 seeded scripts and weekly slots to 2045 | An empty calendar and a library he fills himself |
