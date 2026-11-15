// v2 starting content, generated from docs/v2/UPCREATE_V2_HANDOFF.md
// (Appendix A -> playbook cards, B1 -> reference scripts, B2 -> rules,
// B3 -> lesson, B4 -> ideas, section 9 -> layer cards). Do not hand-edit:
// once seeded, every item is editable per user in the app.

export type SeedCard = { key: string; title: string; grp: string; steps: string[]; body: string };
export type SeedRule = { text: string; category: string };
export type SeedIdea = { text: string; suggestedType: string };
export type SeedReference = { title: string; duration: number; type: string; template: string; funnel: string; say: string[]; meta: string; sources: string; doNotSay: string; why: string; board: string };

export const PLAYBOOK_CARDS: SeedCard[] = [
 {
  "key": "durations",
  "title": "Duration budgets",
  "grp": "kinds",
  "steps": [
   "skeleton",
   "script",
   "check"
  ],
  "body": "Plan at 2.5 spoken words per second. Use 2.3 for a line said while drawing and 2.7 for plain talk. The editor lets him mark a line as \"drawing\", and the time estimate uses the slower rate for it.\n\n| Duration | Word budget | Beats | Board images | Re-hooks | Planned silences |\n|---|---|---|---|---|---|\n| 20 s | 45 to 55 | 4 or 5 | 1 | 0 | One long hold on the key number |\n| 30 s | 70 to 80 | 5 | 1 | 1 | One long hold |\n| 35 s | 80 to 95 | 5 or 6 | 1 | 1 | One long hold |\n| 45 s | 105 to 120 | 7 | 1 or 2 | 1 or 2 | 1 breath of 1.5 to 4 s |\n| 60 s | 140 to 160 | 7 | 2 or 3 | 2 or 3 | 2 breaths |\n| 60 s+ (plan as 90 s) | 210 to 240 | 7, with an optional second turn | 3 or 4 | 4 | 3 breaths |\n\nHis scripting rules give budgets for 30, 45, 60 and 90 s. The 20 s and 35 s rows are calculated here from the same speaking rates.\n\nRules that apply at every duration:\n\n- The main question opens in the first 3 seconds and is answered in the last 10 to 25% of the runtime.\n- A second open question is allowed only from 45 s up. Never more than two open at once.\n- To make a piece shorter, narrow the idea and remove whole beats. The first beat to go is the second proof (in the planning-fallacy script, the Sydney Opera House line).\n\n**Short first [Hypothesis].** Settings holds a list of \"earned\" durations. Start with 20 s, 30 s, 35 s and 45 s earned, and 60 s and 60 s+ not yet earned. Choosing an unearned duration shows a one-line reminder and nothing more. Shardul ticks a duration as earned when the Review table shows the shorter ones are holding viewers. No published benchmark exists for what \"holding\" means, so the app must not invent a threshold; he sets it from his own first ten posts. A reasonable starting week is three Reels: two at 20 to 35 s and one at 45 to 60 s."
 },
 {
  "key": "types",
  "title": "The four types (storytelling everywhere)",
  "grp": "kinds",
  "steps": [
   "skeleton",
   "script",
   "check"
  ],
  "body": "| Type | What it is | Templates (A5) | Production style (A13) |\n|---|---|---|---|\n| **Whiteboard explainer** | He explains one idea and the board carries it: one drawing, at most three labels, the name written last. | Framework reveal · The study · Misconception to correction | Board-led |\n| **History story** | A story with historical context, like the Newton script. A dated scene carries the idea. | Newton engine · A historical figure's system · Origin of an everyday thing · Then and now | Cards-led |\n| **Authority** | His own position on a question, backed by his own work or a strong source. | Authority take | Face-led |\n| **Build** | He is building something and shows where it stands. | Build log, and the series formats | Show-and-tell |\n\n**Storytelling is a gate, not a type.** Every script of every type must have at least three story atoms (a person, a date, a place, an object, a number pair, a misconception, a cost), must join its beats with \"but\" or \"so\" and never \"and then\", and must bring its opening image back at the end. Step 4 and the checks in step 6 enforce this.\n\nThe first two types rest on templates Shardul has already used. The Authority and Build templates are drafted in this brief from the old app's playbook and his story rules. They have not been tested on a real Reel, so show them to him before treating them as settled (open decision 3)."
 },
 {
  "key": "funnel",
  "title": "Funnel stages and how each ends",
  "grp": "kinds",
  "steps": [
   "script",
   "check"
  ],
  "body": "| Stage | Viewer | What the script does | How it ends |\n|---|---|---|---|\n| **Top** | A stranger | The broadest, strongest hook. No mention of his business. | The last line answers the hook, then the video stops. At most one specific \"send this to...\" line. Never \"follow for more\". |\n| **Middle** | Someone who has seen him before | One layer deeper, more specific or more personal. | One specific question, or one value exchange (\"comment X and I'll send the checklist\"). |\n| **Bottom** | Someone close to a decision | Speaks to a person who already trusts him. | One explicit next step, said once, near the end (a DM keyword or the link). |\n\nNever reuse the same closing words across stages. While the focus is retention and audience, expect most pieces to be Top **[Hypothesis]**."
 },
 {
  "key": "setup",
  "title": "Setup, language and limits",
  "grp": "production",
  "steps": [
   "script",
   "check",
   "delivery"
  ],
  "body": "- **Setup:** phone camera, indoors, talking to the lens, microphone in frame, whiteboard beside him. No b-roll, no outdoor shots, no second camera, no stock footage, no AI-generated visuals.\n- **Allowed visuals:** his face; the whiteboard; a hand-drawn overlay; a full-screen text card; a caption; a sound. A third-party chart or document may appear only with his own annotation and spoken explanation.\n- **Language:** English first. Hinglish is seasoning, about one phrase in five at most, for warmth or an aside. The core claim and all numbers stay in English.\n- **Tone:** evidence over outrage; never makes the viewer feel lazy; says \"one study\", \"contested\" or \"company data\" when that is the truth.\n- **Reference creator:** Vyom Bhatia, for pacing and for turning history into story. Borrow the structure. Never copy his sign-off lines, series card or topics (Indian economy and geopolitics are his lane; Shardul's lane is the inner life of knowledge work)."
 },
 {
  "key": "audience",
  "title": "Audience",
  "grp": "kinds",
  "steps": [
   "idea",
   "angle",
   "hook"
  ],
  "body": "| Group | Who | What they send to others |\n|---|---|---|\n| Salaried knowledge worker, 22 to 35 | IT services, capability centres, consulting, startups. Teams, Outlook, Excel, office WhatsApp groups. | \"Send to my manager\" content; evidence on meetings, hours and AI at work. |\n| Student or exam aspirant | UPSC, CAT, GATE, CA. Long study days, guilt about the phone. | Evidence-based study methods; myth-busts of study advice. |\n| Global English-speaking viewer | Includes Indians abroad. Already reads the well-known productivity authors and is tired of hustle content. | A sharp angle they have not seen elsewhere. |\n\nThey value autonomy and evidence. They dislike hustle sermons, tool tours, fake statistics and AI-voiced stock montages."
 },
 {
  "key": "pillars",
  "title": "Topic pillars",
  "grp": "kinds",
  "steps": [
   "idea"
  ],
  "body": "1. Named effects, tested (always with replication status)\n2. Origin stories of everyday things\n3. How great minds worked (from primary sources)\n4. Learn smarter (evidence-based studying)\n5. Systems and frameworks on the whiteboard\n6. Work in the age of AI, with an India lens\n7. India's knowledge institutions\n8. Upforge and consulting (added in this brief for Authority and Build pieces)"
 },
 {
  "key": "hooks",
  "title": "Hooks: formula bank, pick test, banned phrases",
  "grp": "writing",
  "steps": [
   "hook",
   "check"
  ],
  "body": "**What a hook is now.** The first sentence he says: 8 words or fewer, a question or a sharp claim, starting on the first frame with no greeting. It appears as text on his face, word by word, as he says it. The next line opens the story.\n\n**Formula bank.** Step 3 generates one hook from each of five formulas.\n\n| # | Formula | Example hook | Line that follows |\n|---|---|---|---|\n| 1 | Big question | Why can't you forget unfinished work? | You forget ten finished tasks. But the one you left halfway follows you to bed. |\n| 2 | Contrarian snapback | Learn less. Seriously. | Everyone says widen your skills. Warren Buffett did the opposite. |\n| 3 | Specific number | 90,000 index cards. | One sociologist wrote them over 45 years, and called the box his conversation partner. |\n| 4 | In the middle of the scene | 1767. A botanist runs out of paper. | Uppsala. Carl Linnaeus has too many plants and not enough pages. |\n| 5 | You and your pain | Your to-do list is lying to you. | Your list says twelve tasks. Your brain is tracking the three you started. |\n| 6 | Myth-bust | The index card wasn't a librarian's idea. | Before libraries ran on cards, a botanist was cutting paper into slips. |\n| 7 | Famous-name anchor | Why Buffett said no to Google. | He has admitted he missed it. The reason is one circle. |\n| 8 | Mistake or confession (only if true) | I learned the wrong things for two years. | One drawing fixed it. |\n| 9 | Versus | Size versus edge. | What matters more: how much you know, or knowing where it ends? |\n| 10 | What X gets wrong | Productivity advice gets memory backwards. | Most advice says finish everything. A 1920s lab suggests leaving one thing open. |\n| 11 | Whiteboard reveal | One circle. | (He draws it in silence.) This circle explains most of your bad decisions. |\n| 12 | Old study, new life | A 1927 experiment about waiters. | The story goes: a waiter remembered every unpaid order, and forgot it once the bill was paid. |\n| 13 | Stakes | Do this before you close your laptop. | One odd thing tonight, and tomorrow starts itself. |\n| 14 | Hinglish tag | Kabhi notice kiya? | The song you didn't finish humming is the one stuck in your head. |\n| 15 | Series slot | The hook, then a one-second series card | Only once he has named a series. |\n\n**Pick test.** Score 0 to 2 on each; a hook needs 7 of 10.\n\n1. Understandable with the sound off.\n2. Has a concrete noun, number or name.\n3. Opens a gap that only this video closes.\n4. True: the body delivers exactly what it promises.\n5. Can be said in 3 seconds.\n\n**Banned:** \"In this video I'll\", \"Hey guys\", \"Did you know\" without a specific, \"You won't believe\", \"game-changer\", \"secret\", \"hack\", \"stay till the end\", and any claim the body does not pay off."
 },
 {
  "key": "structures",
  "title": "Structures: the seven beats and templates by type",
  "grp": "kinds",
  "steps": [
   "skeleton",
   "script"
  ],
  "body": "**The seven beats** (45 s and longer), with their share of the runtime:\n\n| # | Beat | Job | Share |\n|---|---|---|---|\n| 1 | Hook | Open a question the viewer needs closed. | first 3 s |\n| 2 | Lean-in | Why the viewer should care: a pain, a scene, a stake. A concrete noun in the first 8 s. | about 10% |\n| 3 | Setup | Who, when, what happened: a name, a year, a place. | about 20% |\n| 4 | Turn | \"But\": the surprise or failed expectation. | about 10% |\n| 5 | Mechanism | The idea itself, drawn. One picture, three labels at most. | about 25% |\n| 6 | Apply | One thing to do today, said as a specific action. | about 15% |\n| 7 | Payoff and exit | Close the hook's question with a callback. Stop. | 10 to 15% |\n\n**At 30 to 35 s:** five beats. Merge Lean-in with Setup, and Mechanism with Apply.\n\n**At 20 s:** four or five beats: Hook, one fact or scene, the twist, an optional second proof, the landing.\n\n**Templates by type.** Each line is the beat order.\n\n*Whiteboard explainer*\n\n- **Framework reveal.** A decision the viewer gets wrong daily. Who drew the framework first and why. Draw the shape unlabelled and fill one cell with a live example. Name it last, at the turn. But: the trap or misuse. The viewer places one of their own tasks on it. Step back; one line.\n- **The study.** The everyday feeling the study explains. The researcher, year and odd observation. What they did (two boxes or one graph). Ask the viewer to guess, and pause one second. The result as a number pair. But: the honest twist (replication, limits). What still holds, as one action. Callback to the opening feeling.\n- **Misconception to correction.** State the belief as if true. Say fairly why it feels right. But: the evidence (study, year, number pair). Why the myth survives. The correct model, drawn beside the crossed-out myth. One test the viewer can run on themselves.\n\n*History story*\n\n- **Newton engine.** A question about a famous person or about the viewer. A dated study with a surprising result. The twist: what the result really showed. The idea, named and drawn. A dated historical case in which the idea costs someone something. A landing that answers the hook in words. At 20 s it compresses to: question, study with its numbers, the number that breaks the expectation, one line of history, landing.\n- **A historical figure's system.** The output that sounds impossible, as a number. Who they were and the problem they had. What they tried that failed. The system, drawn in two or three parts. What it cost them. The viewer's version today, as one step. Return to the opening number.\n- **Origin of an everyday thing.** Point at the object and ask who or why. Date, place and the inventor's problem. The failure or accident that forced the invention. How it spread, and one surprising consequence. What it really solves. Back to the viewer's own object. Callback.\n- **Then and now.** A present-day question. Then: a date, a scarcity or disaster, a concrete object. The fix people found. But: the price of the fix. A number pair, then against now. The turn: the hook question reframed. A values line and a close of three words or fewer.\n\n*Authority* **[draft, untested]**\n\n- **Authority take.** A position stated plainly against a common view. The common view, said fairly. But: what he has seen, as one specific case from his own work, or one strong source. The principle, in one drawing or one sentence. One move the viewer can make. The position again, in fewer words.\n- Rules: a claim from his own experience carries a \"true for me\" tick in place of a citation. Client details are anonymised. No percentage about his clients unless he has the count behind it.\n\n*Build* **[draft, untested]**\n\n- **Build log.** What is being built and what is at stake, or the number where it stands. Where it stood. What he tried. What broke, or what it cost. What changed. What comes next, left open for the next episode.\n- Series formats kept from the old playbook: daily series, progress update, one lesson per episode, step by step, numbers and metrics, cost breakdown, what I would do differently."
 },
 {
  "key": "angles",
  "title": "Finding the angle",
  "grp": "writing",
  "steps": [
   "angle"
  ],
  "body": "Step 2 generates seven angles, each one or two sentences with its lens named: at least two from thinkers who shaped him, two from other fields, one from his own life, one redefinition, one contrarian. First name the universal pain or desire under the idea. Mark the strongest two by relatable, novel and simple. Say plainly when an angle is weak.\n\nThe five questions behind it: How would a thinker I admire say this? How would I say it to my past self? How can I redefine the idea? What is the common view, and where do I disagree? Why does this matter to an ordinary person?\n\nNine ready shapes: myth to study; number shock; origin story; attribution twist (\"X never said this\"); it's not you, it's the system; the Indian translation of a Western idea; the expert who contradicts the popular claim; a then-and-now timeline; the cost of a habit (only with a source)."
 },
 {
  "key": "story",
  "title": "Story rules (every script)",
  "grp": "writing",
  "steps": [
   "skeleton",
   "script",
   "check"
  ],
  "body": "- Join beats with \"but\", \"so\" or \"which means\". One \"and then\" is allowed, to land an event.\n- Open on a date, a place and a concrete thing within 5 seconds. Never open on a definition.\n- Hold back the name, never the point. Describe the effect first; say and write its name at the turn.\n- Numbers come in pairs and before the explanation. A number with no comparison is noise.\n- One new idea every 7 to 10 seconds.\n- Plant and pay off: whatever opens the video returns in the last 15%.\n- Cut any side fact, joke or drawing that does not carry the idea.\n- Keep the screen quiet during a human moment or a quote: face and caption only.\n- An honest ending is an ending. \"Nobody knows\" or \"it didn't replicate\" closes a question, and often makes the best twist.\n- Never use teasers (\"wait for it\"). The middle is held by cause and effect.\n\n**Stakes: at least five of seven.** A named person. A date and a place. A physical object. A number pair. A cost. A link to something the viewer does this week. A counterfactual (\"if this hadn't happened, you would...\").\n\n**\"Is this a lecture?\" All twelve must be yes.**\n\n1. Is something happening in the first 5 seconds?\n2. Can every beat be joined to the one before with \"but\" or \"so\"?\n3. Is there a person who wants or loses something?\n4. Does the viewer get a moment to guess before a reveal?\n5. Is the name held back until the idea is felt?\n6. Is there a \"but\" between 30% and 60% of the runtime?\n7. Does every number have a comparison?\n8. Is there a breath every 25 to 40 seconds (45 s and longer)?\n9. Does the opening image return in the last 15%?\n10. Would a friend who knows nothing follow every step?\n11. Is every interesting-but-irrelevant fact cut?\n12. Does the ending land a change, and not a summary?"
 },
 {
  "key": "checklist",
  "title": "Writing checklist",
  "grp": "writing",
  "steps": [
   "script",
   "check"
  ],
  "body": "- Sentences average 12 words or fewer; none over 20; some of two to four words.\n- Contractions everywhere.\n- Every sentence passes \"would I say this to a friend over chai?\"\n- At least one name, one year or number, one physical object.\n- No jargon without an instant translation.\n- Numbers written the way people say them.\n- Every board or screen cue sits on the word it illustrates.\n- A timed read within 5% of the budget. A line he stumbles on is rewritten, not practised.\n- No generic AI phrasing (\"delve\", \"unlock\", \"in today's fast-paced world\"). No list of seven tips in 45 seconds. No definition before the stakes."
 },
 {
  "key": "endings",
  "title": "Endings and calls to action",
  "grp": "writing",
  "steps": [
   "script",
   "check"
  ],
  "body": "Use one ending, then stop on the last meaningful word. No outro, no \"that's it for today\".\n\n| Ending | When |\n|---|---|\n| Callback: the hook's image, now understood | Default at every stage. Example: \"So no, Newton wasn't dumb. He just didn't know where his circle ended.\" |\n| One send line for a named person | Top of funnel, when the topic has an obvious recipient. \"Send this to the friend who re-reads notes the night before.\" |\n| One specific question | Middle of funnel. |\n| One explicit next step | Bottom of funnel. |\n\nTop of funnel: no \"follow for more\". Middle: one ask, framed as a value exchange. Bottom: one ask, said once. Never the same closing words at two stages."
 },
 {
  "key": "notation",
  "title": "Notation: direction cues and delivery marks",
  "grp": "writing",
  "steps": [
   "script",
   "delivery"
  ],
  "body": "**Direction cues** go in the Board and Screen layers, in square brackets, before the word they land on.\n\n| Cue | Meaning |\n|---|---|\n| `[WB: ...]` | He draws live on the whiteboard. Three seconds of strokes or less; three words or fewer per label; letters 8 cm or taller. |\n| `[WB-PRE: ...]` | Drawn before recording and revealed. |\n| `[WALL: ...]` | A hand-drawn diagram added in the edit on the wall beside his head. |\n| `[ABOVE: ...]` | Short text or a small timeline above his head. |\n| `[CARD: ...]` | A full-screen text card: a date, a place, the key number, a quote. |\n| `[SRC: ...]` | Source line, shown briefly. |\n| `[PAUSE 0.5]` `[PAUSE 1.5]` | A silence the edit must keep. |\n| `[PUNCH]` | One hard zoom-in of 10 to 12%. |\n| `[SFX: ...]` | A sound tied to something visible. |\n| `[GFX: ...]` | Any other overlay. |\n\n`[WALL]`, `[ABOVE]` and `[CARD]` are proposed here to match his three screen zones (A13). His older scripts use `[TITLE]`, `[GFX]` and `[EMPH]`; accept them on import.\n\n**Delivery marks** go in the Say layer at step 7. They must work as plain text in any teleprompter; add colour as a second signal.\n\n| Mark | Meaning |\n|---|---|\n| `(words)` | Slower. Stretch it, let it land. |\n| `**word**` | Louder: pitch up, louder and longer. |\n| `>words<` | Faster. A throwaway. |\n| `°words°` | Softer, confiding. |\n| `↑` before a word | Pitch up. |\n| `↓` before a word | Pitch down; land it. |\n| `/` | Short pause, about 0.3 s. May be trimmed in the edit. |\n| `//` | A beat, about 0.8 s. Kept in the edit. |\n| `///` | A hold of 1.5 s or more, for the reveal. Two per Reel at most. Kept. |\n| `[verb]` at the start of a line | The intent: tease, provoke, explain, confide, warn, challenge, reveal, land, warm, deadpan. |\n| `{cue}` | A physical cue on the next word: `{lens}` `{board}` `{draw}` `{tap}` `{point}` `{smile}`. |\n\nRules: one bold word per phrase and never more than two per sentence. Bold the noun, name, number or contrast word. `↓` on the last word of a statement that ends a beat. Never give the key word or the reveal to the whiteboard: say it to the lens, then turn and draw. If more than a third of a line is marked, remove marks. Because stressed words in Indian English tend to fall in pitch, every bold word gets all three: pitch up, louder, longer.\n\nWhen the app gives Shardul guidance on a script, it quotes the actual line. It never says \"line 3\" and gives no timecodes unless he asks."
 },
 {
  "key": "research",
  "title": "Research standard and claims to be careful with",
  "grp": "research",
  "steps": [
   "idea",
   "script",
   "check"
  ],
  "body": "**Source tiers.** Proof on screen: peer-reviewed papers, meta-analyses, official records, primary historical documents, university archives. With \"according to\": expert books, major newspapers, institutional reports. Never as proof: Wikipedia (use it to find the primary source), blogs, listicles, other creators, quote sites, social posts, AI output.\n\n**On screen:** `Author, Year, Journal`, shown briefly when the claim is spoken. Say the sample and design in one clause (\"thirty-seven students, one study\"). A single study is called a single study. A failed or contested replication is said out loud. Numbers keep their unit and year. Every famous quote is checked against the primary text first.\n\n**Claims to be careful with.** If a script contains the left column, show the right.\n\n| Popular claim | Safe wording |\n|---|---|\n| 10,000 hours to mastery | Practice matters a lot in chess and music, and surprisingly little in most jobs. |\n| 21 days to form a habit | Closer to two months on average, and it varies hugely. |\n| Multitasking costs 40% | Every switch has a time cost; in some lab conditions it adds up to a lot. |\n| An 8-second attention span, less than a goldfish | Myth-bust only. Nobody has measured a goldfish. |\n| Our attention span is 47 seconds | We switch screens about every 47 seconds. |\n| 23 minutes to refocus | It can take about 25 minutes to return to the original task, usually after doing other things. |\n| 93% of communication is non-verbal | Myth-bust only. |\n| Left-brained and right-brained people | Functions lateralise; people don't. |\n| Learning styles | Match the method to the material, not to a \"style\". |\n| Decision fatigue and the hungry judges | A famous study, now heavily questioned. |\n| Willpower is a battery | The idea failed its biggest tests. |\n| Unfinished tasks stick in memory (Zeigarnik) | They don't stick better, but they do pull you back. |\n| The marshmallow test predicts success | It mostly measured circumstances, not character. |\n| Dunning–Kruger | Novices tend to overestimate; how much is debated. Never as an insult. |\n| The Eisenhower Matrix, by Eisenhower | Inspired by a line Eisenhower borrowed. |\n| Pomodoro is scientifically proven | A structure that helps some people. |\n\n**Findings that hold up** (still cite them): the testing effect, the spacing effect, the forgetting curve, the planning fallacy, the cost of task switching (the direction is robust; the size varies).\n\n**Care rules.** No exaggerated health or money claims. No diagnosis language. Disclose when data comes from a vendor with something to sell. In work-culture debates, quote people accurately with the date and never mock them. Never use a real person's death as a hook, thumbnail or caption.\n\nHis project holds two fuller banks that Shardul can paste into Research: 47 topic ideas with hooks, and 30 verified findings with a misquote table (`research/02_knowledge_workers.md` and `research/12_topic_research_framework.md` in his Claude project)."
 },
 {
  "key": "shareability",
  "title": "Scoring an idea: the shareability test",
  "grp": "research",
  "steps": [
   "idea"
  ],
  "body": "One point each. Film at 7 or more, rework at 5 or 6, drop at 4 or less.\n\n1. The takeaway fits in under 15 words.\n2. It contradicts a common belief or reveals a hidden \"why\".\n3. It evokes awe, indignation or mild anxiety. \"Interesting\" scores zero.\n4. He can name who it gets sent to.\n5. There is an action for today, or a reference worth saving.\n6. A strong source can be shown on screen.\n7. It has an Indian example or stake, or is deliberately universal.\n8. The hook is paid off before the final 10 seconds.\n9. Only Shardul could make it: his drawing, his angle or his story.\n10. It is not one of the overdone effects, unless the angle is new.\n\nOne further test from his audience rules: one drawing must be able to carry the idea. If it needs footage he cannot shoot, reframe it as a drawing, a document, or something held to camera."
 },
 {
  "key": "platform",
  "title": "Platform notes (dated, re-check)",
  "grp": "platform",
  "steps": [],
  "body": "These come from his project's research, checked on 7 Nov 2026, and I have not re-checked them today. Store each as a Playbook card with its date so it can be reviewed, and do not present them in the interface as current fact.\n\n- Instagram's head has named watch time, likes and sends as the top ranking signals; sends matter most for reaching non-followers (Jan 2025).\n- Reels from smaller accounts are shown to a small audience first and widened if they perform (Apr 2024).\n- Reels Insights reports a skip rate for the first 3 seconds (reported Aug 2025). Instagram publishes no benchmark; thresholds quoted by third parties are unverified.\n- Trial Reels, which show a Reel only to non-followers, need 1,000 followers (Jul 2025). At about 800 he does not have them yet. When he does, use them to test hooks and the layout.\n- Instagram has said content must be three minutes or less to be recommended; longer Reels are reported to reach mainly followers.\n- Instagram's guidance prefers full-screen vertical video with no borders. No statement was found that a bordered layout is ranked lower. His landscape-in-vertical layout is a decided choice; the bands must look designed.\n- Exaggerated health or money claims and clickbait are excluded from recommendations.\n- The starting posting time (about 7:30 pm IST) rests on weak data. Re-pick it from his own Insights after four weeks."
 },
 {
  "key": "carousels",
  "title": "Carousels",
  "grp": "kinds",
  "steps": [
   "carousel"
  ],
  "body": "Keep `lib/carousel-reference.ts` as it is: the eight archetypes, the hook patterns, the craft rules (1080 × 1350, two font families at most, one idea per slide, body text never below 28 px, one call to action per carousel). Two additions: carousels take Type and Funnel like scripts, and the default design for a new carousel follows the video identity in A13 (open decision 6). Fix carousel 1 if any seed carousel is kept: its title says five mistakes and its slides say seven."
 },
 {
  "key": "production-styles",
  "title": "The four production styles",
  "grp": "production",
  "steps": [
   "script",
   "check"
  ],
  "body": "**Four production styles [the names are proposed; the elements are his].** All four share one canvas and one identity.\n\n| Style | What the viewer sees | Used for |\n|---|---|---|\n| **Board-led** | The physical whiteboard is the second visual. He draws live; the edit traces his real strokes in yellow. | Whiteboard explainer |\n| **Cards-led** | His face, plus quick full-screen cards for dates, places, the key number and quotes; drawings on the wall beside him. This is the Newton Reel. | History story |\n| **Face-led** | Mostly him to the lens with captions, and one or two short text beats above his head. A quiet screen. | Authority |\n| **Show-and-tell** | He shows the thing itself: his own screen recording, a document or object held to camera, the whiteboard as a progress board. Only material he recorded. | Build |"
 },
 {
  "key": "whiteboard",
  "title": "What whiteboard scripts are",
  "grp": "whiteboard",
  "steps": [
   "skeleton",
   "script"
  ],
  "body": "**What whiteboard scripts are.** The board is a picture, not a slide. One drawing per video, three labels at most, each label repeating the spoken noun, drawn on the word and not after it. The name of the idea is the last stroke. Anything that takes more than three seconds to draw is drawn before recording or added in the edit. In his research, freehand drawing held learners' attention 1.5 to 2 times longer than slides in a study of 6.9 million online-course sessions (Guo, Kim and Rubin, 2014)."
 },
 {
  "key": "look",
  "title": "The look (identity sheet v2)",
  "grp": "look",
  "steps": [
   "script"
  ],
  "body": "**The look (identity sheet, version 2, 10 Nov 2026).**\n\n- **Canvas:** 1080 × 1920. His landscape video sits whole in the middle (1080 × 608), never cropped to vertical, on a grained near-black page (`#141210`), never flat black. Keep everything important away from the top 360 px, the bottom 320 px and the right-hand 180 px, where Instagram's own buttons sit.\n- **Colour:** one accent, yellow `#FFD60A`. No orange, no underlines, no italics.\n- **Type:** few and plain. A Helvetica-class bold for the hook, cards and labels. One sans for captions.\n- **Hook:** on his face, yellow, bold, capitals, one word per line as he says it; gone when the hook ends.\n- **Three zones:** above his head, for short context text and timelines; the wall beside his head, for hand-drawn diagrams in black ink with yellow fills that he can pass in front of; full-screen cards on dark paper, on a hard cut, while his voice continues.\n- **Cards are quick:** about a second for a date or place, up to about 2.5 seconds for a quote, and never two in a row without his face between them.\n- **Sources:** small, on the card or flashed briefly. Never left on screen for the whole video.\n- **Captions:** phrase by phrase, in sentence case, in the band under the video. Never over his face or the whiteboard. No word-by-word pop, no capitals, no emoji.\n- **Drawings:** hand-drawn and slightly unpolished. Where possible they follow his real marker or fingertip.\n- **Rhythm:** something changes on screen at least every 7 seconds; one hard zoom-in at the turn; silences trimmed except the marked pauses; the key number gets its own silence.\n- **Sound:** a separate design for each section (hook, story, turn, conclusion). Rich, but never over the voice. One sound per visible event. Music changes only at section boundaries.\n- **Never:** stock footage, AI b-roll, template lower thirds, neon word-pop captions, glass effects, purple or teal gradients, bounce animation, anything that reads as AI-made or templated."
 },
 {
  "key": "recording",
  "title": "Recording basics",
  "grp": "production",
  "steps": [
   "delivery"
  ],
  "body": "**Recording basics for the shoot sheet.** Rear camera. Sit far enough back that the whiteboard is in frame. Lock exposure and white balance. Record two seconds of the empty board first. Marker letters 8 cm or taller. Three full takes: as marked; smaller, like telling one friend a secret; deliberately too big."
 }
];

export const SEED_RULES: SeedRule[] = [
 {
  "text": "Storytelling applies to every script, at every length.",
  "category": "writing"
 },
 {
  "text": "Keep my wording. When I have written a line, offer options for it or correct facts and grammar. Do not rewrite it unasked.",
  "category": "writing"
 },
 {
  "text": "When you guide me through a script, quote the actual line. No \"line 1, line 2\", and no timecodes unless I ask.",
  "category": "writing"
 },
 {
  "text": "Short first: 20 to 35 seconds by default until my numbers earn longer.",
  "category": "writing"
 },
 {
  "text": "The last line answers the hook. Then stop.",
  "category": "writing"
 },
 {
  "text": "English first. Hinglish only as seasoning, never for the main claim.",
  "category": "writing"
 },
 {
  "text": "Only what my setup can record: me, the whiteboard, drawings, cards, captions, sound.",
  "category": "writing"
 },
 {
  "text": "Every number has a source. If something is contested or didn't replicate, say so.",
  "category": "writing"
 },
 {
  "text": "Mark scripts for delivery: (brackets) for slower, **bold** for louder, and the other marks in the notation.",
  "category": "writing"
 },
 {
  "text": "Nothing that looks AI-generated, stock or templated. Slightly unpolished and hand-drawn is right.",
  "category": "look"
 },
 {
  "text": "One accent colour, yellow. No orange, no underlines, no italics. Few, plain fonts.",
  "category": "look"
 },
 {
  "text": "Hook text goes on my face, in yellow bold.",
  "category": "look"
 },
 {
  "text": "Captions sit under the video, never over my face or the whiteboard.",
  "category": "look"
 },
 {
  "text": "Full-screen documentary cards for dates, the key number and quotes. Keep them quick.",
  "category": "look"
 },
 {
  "text": "Sources appear briefly. They never stay on screen.",
  "category": "look"
 },
 {
  "text": "A separate sound design for each section, rich but never over my voice.",
  "category": "look"
 },
 {
  "text": "Cut anything that costs retention. (The echo card was removed from the Newton Reel for this reason.)",
  "category": "look"
 }
];

export const SEED_LESSON = {
 "text": "A 78-second Reel is too long for this account at about 800 followers. Run the same engine at 20 to 35 seconds.",
 "scope": "length",
 "appliesTo": "All",
 "evidence": "The Newton Reel; Shardul's judgement, no numbers logged yet",
 "status": "testing"
};

export const SEED_IDEAS: SeedIdea[] = [
 {
  "text": "We switch screens about every 47 seconds; in 2004 it was 2.5 minutes",
  "suggestedType": "Whiteboard explainer (the study)"
 },
 {
  "text": "\"21 days to build a habit\" is a myth; the study found about 66",
  "suggestedType": "Whiteboard explainer (misconception)"
 },
 {
  "text": "Re-reading notes loses to testing yourself after a week",
  "suggestedType": "Whiteboard explainer (the study)"
 },
 {
  "text": "Willpower isn't a battery: the big replications failed",
  "suggestedType": "Whiteboard explainer (misconception)"
 },
 {
  "text": "The 10,000-hour rule is half wrong",
  "suggestedType": "Whiteboard explainer (misconception)"
 },
 {
  "text": "Your first good idea blocks a better one (the chess study on its own)",
  "suggestedType": "Whiteboard explainer (the study)"
 },
 {
  "text": "Eisenhower never drew the Eisenhower Matrix",
  "suggestedType": "History story (origin)"
 },
 {
  "text": "Parkinson's law began as a joke in 1955",
  "suggestedType": "History story (origin)"
 },
 {
  "text": "One man, 90,000 index cards, 70 books",
  "suggestedType": "History story (a figure's system)"
 },
 {
  "text": "Drucker's nurses: more time with patients without hiring anyone",
  "suggestedType": "History story"
 },
 {
  "text": "Why India runs on UTC+5:30",
  "suggestedType": "History story (origin)"
 },
 {
  "text": "ISRO's first rocket parts travelled by bicycle",
  "suggestedType": "History story"
 },
 {
  "text": "The forgetting curve, measured in 1885 and again in 2015",
  "suggestedType": "History story (then and now)"
 },
 {
  "text": "The office WhatsApp group is India's hive mind",
  "suggestedType": "Authority"
 },
 {
  "text": "The 4,000-week grid, drawn on the board",
  "suggestedType": "Whiteboard explainer (framework)"
 },
 {
  "text": "Rebuilding this content app and what it taught me",
  "suggestedType": "Build"
 }
];

export const REFERENCE_SCRIPTS: SeedReference[] = [
 {
  "title": "Was Newton financially dumb?",
  "duration": 90,
  "type": "history",
  "template": "Newton engine",
  "funnel": "tofu",
  "say": [
   "Was Newton financially dumb?",
   "In 2008, Oxford researcher Merim Bilalić tracked the eyes of some chess players.",
   "He gave them a position with two ways to win: one familiar, and one faster but unfamiliar.",
   "They all said they tried to find the faster way, but no one could.",
   "Their eyes kept going back to the familiar move.",
   "Then he removed the familiar move, and they all found the faster one.",
   "This pull towards the familiar is your circle of competence.",
   "It's built from everything you've learned or experienced.",
   "For Newton, it was mostly physics.",
   "In 1720, he owned shares in the South Sea Company.",
   "In April, he sold the shares for a big profit.",
   "But the price kept rising.",
   "So in June, he bought back in, with almost everything he had.",
   "In September, it crashed.",
   "He lost a third of his fortune.",
   "Warren Buffett said in 1996: \"The size of that circle is not very important.\"",
   "Newton had one of the biggest in history.",
   "\"Knowing its boundaries, however, is vital.\"",
   "So no, Newton wasn't dumb. He just didn't know where his circle ended."
  ],
  "meta": "Reel · 60 s+ (about 78 s, 183 words) · History story · Newton engine · Top of funnel · Cards-led · Status: for Shardul to set.",
  "sources": "Bilalić, McLeod & Gobet, 2008, *Cognition* · Odlyzko, 2019 · Buffett, 1996 Berkshire letter.",
  "doNotSay": "\"Newton lost everything\"; \"grandmasters\"; \"Stanford\"; the \"madness of people\" quote as fact; a June purchase price; \"outside physics Newton was an ordinary man\". Note for a future version: Buffett wrote this in a letter, so \"wrote\" is more accurate than \"said\".",
  "why": "the hook is a four-word question; every section joins with \"but\" or \"so\"; the name of the idea arrives after the viewer has felt it; the last line answers the hook.",
  "board": ""
 },
 {
  "title": "Why isn't your worst case bad enough?",
  "duration": 20,
  "type": "history",
  "template": "Newton engine, compressed",
  "funnel": "tofu",
  "say": [
   "Why isn't your worst case bad enough?",
   "In 1994, psychologists asked students how long their thesis would take.",
   "Their guess: 34 days.",
   "Their worst case, if everything went wrong: 49.",
   "They took 56.",
   "The Sydney Opera House was due in 1963. It opened in 1973.",
   "So don't ask how long this will take. Ask how long the last one took."
  ],
  "meta": "Reel · 20 s · History story · Newton engine, compressed · Top of funnel · Board-led with two cards · Status: scripted.",
  "sources": "| Fact | Source | Status |\n|---|---|---|\n| 37 students; predicted 33.9 days; worst case 48.6; actual 55.5; about 30% finished within their own prediction | Buehler, Griffin & Ross, 1994, *JPSP* 67(3), 366–381 | Known. Taken from a summary; confirm against the paper before posting. |\n| Sydney Opera House: due December 1963 at $7 million; opened 20 October 1973 at $102 million | National Museum of Australia; Guinness World Records | Verified in his brief |",
  "doNotSay": "\"every student\" or \"nobody finished on time\"; that this study discovered the planning fallacy (Kahneman and Tversky named it in 1979); that the Opera House overran through bad planning alone.",
  "why": "",
  "board": "one long arrow; a tick at 34; a wall marked WORST CASE at 49; 56 written past the wall. If a take runs long, cut the Sydney line first."
 }
];
