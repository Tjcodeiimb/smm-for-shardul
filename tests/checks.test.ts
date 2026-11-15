import { describe, expect, it } from "vitest";
import { runChecks, claimsIn } from "@/lib/checks";
import { parseScript, classifyScript, enforceLocks } from "@/lib/script-format";

const PASTE = `Why isn't your worst case bad enough?
In 1994, psychologists asked students how long their thesis would take.
Their guess: 34 days.
Their worst case, if everything went wrong: 49.
They took 56.
The Sydney Opera House was due in 1963. It opened in 1973.
So don't ask how long this will take. Ask how long the last one took.`;

describe("Paste from Claude and the step 6 checks", () => {
  const { beats } = parseScript(PASTE);

  it("parses beats and classifies Reel, 20 s, History story, Top", () => {
    expect(beats).toHaveLength(7);
    expect(classifyScript(PASTE, beats)).toMatchObject({ format: "reel", duration: 20, type: "history", funnel: "tofu", words: 60 });
  });

  it("lists numbers without a Verified fact as unsourced", () => {
    const base = { beats, duration: 20, funnel: "tofu", idea: "Ask how long the last one took", title: "", existingTitles: [], ticks: {} };
    const facts = runChecks({ ...base, facts: [], hasBrief: false }).find((c) => c.key === "facts")!;
    expect(facts.pass).toBe(false);
    expect(facts.items).toContain("Unsourced: 1994");
    const verified = runChecks({ ...base, hasBrief: true, facts: [{ id: "a", text: "1994 study: guessed 34, worst 49, took 56; Opera House 1963 to 1973", number: "", citation: "", sample: "", replication: "", caveat: "", link: "", checked: "", status: "verified" }] }).find((c) => c.key === "facts")!;
    expect(verified.pass).toBe(true);
  });

  it("finds claims including quotes", () => {
    expect(claimsIn('He said "the size of that circle is not very important" in 1996.')).toEqual(["1996", '"the size of that circle is not very important"']);
  });

  it("keeps locked lines whatever a tool returns", () => {
    const locked = beats.map((b, i) => ({ ...b, locked: i === 0 }));
    const out = enforceLocks(locked, beats.map((b) => ({ ...b, say: "changed" })));
    expect(out[0].say).toBe(beats[0].say);
    expect(out[1].say).toBe("changed");
  });
});
