import { describe, expect, it } from "vitest";
import { buildStepPrompt, buildLinePrompt, HARD_CONSTRAINTS, applicableLessons, nearestReferences, type PromptContext, type Lesson } from "@/lib/studio-prompts";
import { emptyBeat } from "@/lib/script-format";

const lesson = (over: Partial<Lesson>): Lesson => ({ id: 1, text: "Lesson", scope: "length", applies_to: { all: true }, status: "testing", created_at: "2026-11-01", ...over });

const ctx: PromptContext = {
  format: "reel", duration: 20, type: "history", funnel: "tofu", template: "Newton engine", idea: "Plan from how long the last one took",
  angle: "", hook: "Why isn't your worst case bad enough?", hookFollow: "", skeleton: "", title: "",
  beats: [{ ...emptyBeat("Hook"), say: "Why isn't your worst case bad enough?", locked: true }, { ...emptyBeat("Beat 2"), say: "In 1994, students guessed." }],
  facts: [
    { id: "a", text: "37 students predicted 33.9 days", number: "34", citation: "Buehler, Griffin & Ross, 1994, JPSP", sample: "", replication: "", caveat: "", link: "", checked: "", status: "verified" },
    { id: "b", text: "An unchecked claim about Sydney", number: "1963", citation: "", sample: "", replication: "", caveat: "", link: "", checked: "", status: "known" },
  ],
  doNotSay: "every student",
  rules: [{ id: 1, text: "Keep my wording.", category: "writing", active: true }, { id: 2, text: "A switched-off rule.", category: "writing", active: false }],
  lessons: [lesson({ text: "A 78-second Reel is too long for this account." }), lesson({ id: 2, text: "Only for 60 s.", applies_to: { duration: [60] } }), lesson({ id: 3, text: "Retired one.", status: "retired" })],
  cards: [{ key: "story", title: "Story rules", body: "Join beats with but or so.", steps: ["script"] }, { key: "hooks", title: "Hook bank", body: "Formulas", steps: ["hook"] }],
  references: [
    { id: 1, title: "Was Newton financially dumb?", duration: 90, type: "history", text: "..." },
    { id: 2, title: "Why isn't your worst case bad enough?", duration: 20, type: "history", text: "..." },
    { id: 3, title: "A whiteboard piece", duration: 20, type: "whiteboard", text: "..." },
  ],
};

describe("prompt assembly (section 10.2)", () => {
  const prompt = buildStepPrompt("script", ctx);

  it("puts the eight blocks in order", () => {
    const heads = ["# 1. Task", "# 2. Hard constraints", "# 3. The brief", "# 4. Facts", "# 5. Shardul's rules, then his lessons", "# 6. Playbook", "# 7. Reference scripts", "# 8. Output"];
    const at = heads.map((h) => prompt.indexOf(h));
    expect(at.every((x) => x >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("has exactly the five hard constraints", () => {
    expect(HARD_CONSTRAINTS).toHaveLength(5);
    for (const c of HARD_CONSTRAINTS) expect(prompt).toContain(c);
  });

  it("includes active rules and matching lessons, with the override line", () => {
    expect(prompt).toContain("They override the general guidance below.");
    expect(prompt).toContain("Keep my wording.");
    expect(prompt).not.toContain("A switched-off rule.");
    expect(prompt).toContain("A 78-second Reel is too long for this account.");
    expect(prompt).not.toContain("Only for 60 s.");
    expect(prompt).not.toContain("Retired one.");
  });

  it("includes only Verified facts, the do-not-say list, the step's cards, the budget and locked lines", () => {
    expect(prompt).toContain("37 students predicted 33.9 days");
    expect(prompt).not.toContain("An unchecked claim about Sydney");
    expect(prompt).toContain("Do not say: every student");
    expect(prompt).toContain("Story rules");
    expect(prompt).not.toContain("Hook bank");
    expect(prompt).toContain("45 to 55 spoken words");
    expect(prompt).toMatch(/Locked lines[\s\S]*Why isn't your worst case bad enough\?/);
  });

  it("uses the two nearest reference scripts, same type first", () => {
    expect(nearestReferences(ctx.references, ctx).map((r) => r.id)).toEqual([2, 1]);
  });

  it("Options targets one line only", () => {
    const p = buildLinePrompt("options", ctx, 1);
    expect(p).toContain("The line (beat \"Beat 2\"): In 1994, students guessed.");
    expect(p).toContain("Do not touch any other line.");
  });

  it("caps lessons at 15, keeping confirmed ones", () => {
    const many = Array.from({ length: 20 }, (_, i) => lesson({ id: i, text: `L${i}`, created_at: `2026-10-${String(i + 1).padStart(2, "0")}`, status: i === 0 ? "confirmed" : "testing" }));
    const kept = applicableLessons(many, ctx);
    expect(kept).toHaveLength(15);
    expect(kept.map((l) => l.text)).toContain("L0");
  });
});
