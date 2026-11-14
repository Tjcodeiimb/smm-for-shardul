import { describe, expect, it } from "vitest";
import { budgetFor, budgetStatus, durationForWords, estimateSeconds, countWords } from "@/lib/taxonomy";

describe("word budget (section 9.2)", () => {
  it("uses the brief's budgets", () => {
    expect(budgetFor(20)).toMatchObject({ min: 45, max: 55 });
    expect(budgetFor(30)).toMatchObject({ min: 70, max: 80 });
    expect(budgetFor(90)).toMatchObject({ min: 210, max: 240, label: "60 s+" });
  });

  it("allows 5% either side, and a 20 s script over 58 words is over budget", () => {
    expect(budgetStatus(55, 20).state).toBe("ok");
    expect(budgetStatus(57, 20).state).toBe("ok");
    expect(budgetStatus(58, 20)).toEqual({ state: "over", by: 3 });
    expect(budgetStatus(42, 20).state).toBe("under");
  });

  it("estimates at 2.5 words/s, and 2.3 for a line said while drawing", () => {
    const line = { say: "one two three four five six seven eight nine ten" };
    expect(estimateSeconds([line])).toBe(4);
    expect(estimateSeconds([{ ...line, drawing: true }])).toBeCloseTo(10 / 2.3);
  });

  it("classifies by the nearest budget", () => {
    expect(durationForWords(60)).toBe(20); // 5 over 20 s, 10 under 30 s
    expect(durationForWords(75)).toBe(30);
    expect(durationForWords(183)).toBe(60);
    expect(countWords("  So don't ask.  Ask again. ")).toBe(5);
  });
});
