import { describe, it, expect } from "vitest";
import { BADGE_CATALOG, computeEarnedBadgeIds, mergeBadgeUnlocks } from "../badges.js";

describe("badges", () => {
  it("computeEarnedBadgeIds awards basics", () => {
    const ids = computeEarnedBadgeIds({
      completedSimulations: [{}],
      lastQuizScore: { score: 8, total: 8, durationSec: 10 },
      badges: [],
    });
    expect(ids).toEqual(
      expect.arrayContaining(["first_time_voter", "perfect_run", "election_ready", "fast_learner"]),
    );
  });

  it("mergeBadgeUnlocks stamps new ids only once", () => {
    const out = mergeBadgeUnlocks([], ["perfect_run"], {});
    expect(out.perfect_run).toMatch(/^\d{4}-\d{2}-\d{2}/);
    const out2 = mergeBadgeUnlocks(["perfect_run"], ["perfect_run"], out);
    expect(out2.perfect_run).toBe(out.perfect_run);
  });

  it("BADGE_CATALOG stays stable keyed", () => {
    expect(BADGE_CATALOG.first_time_voter.title).toMatch(/First/);
  });
});
