import { describe, it, expect } from "vitest";
import { getLandingHeroStats, quizQuestions } from "../simulationData.js";

describe("simulationData exports", () => {
  it("getLandingHeroStats aggregates", () => {
    const s = getLandingHeroStats();
    expect(s.quizzes).toBe(quizQuestions.length);
    expect(s.packs).toBeGreaterThan(3);
    expect(s.scenarios).toBeGreaterThan(20);
  });
});
