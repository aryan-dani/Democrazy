/** @typedef {{ score:number; total:number; date:string; label:string; durationSec?:number }} QuizScoreEntry */

/**
 * Canonical badge IDs stored in progress.
 * Underscores for stable localStorage compatibility.
 */
export const BADGE_CATALOG = {
  first_time_voter: {
    id: "first_time_voter",
    title: "First-Time Voter",
    description: "Finished your first guided simulation.",
  },
  election_ready: {
    id: "election_ready",
    title: "Election Ready",
    description: "Completed a simulation and scored 75%+ on the quiz.",
  },
  perfect_run: {
    id: "perfect_run",
    title: "Perfect Run",
    description: "Answered every quiz question correctly in a run.",
  },
  fast_learner: {
    id: "fast_learner",
    title: "Fast Learner",
    description: "Perfect quiz in under 3 minutes.",
  },
};

/**
 * @param {{
 *   completedSimulations?: unknown[];
 *   lastQuizScore?: { score: number; total: number; durationSec?: number } | null;
 *   badges?: string[];
 * }} p
 * @returns {string[]}
 */
export function computeEarnedBadgeIds(p) {
  const earned = new Set();

  const simDone = (p.completedSimulations?.length ?? 0) >= 1;
  if (simDone) {
    earned.add("first_time_voter");
  }

  const last = p.lastQuizScore;
  if (last && typeof last.total === "number" && last.total > 0) {
    const ratio = last.score / last.total;
    if (ratio >= 1) {
      earned.add("perfect_run");
    }
    if (simDone && ratio >= 0.75) {
      earned.add("election_ready");
    }
    const dur = typeof last.durationSec === "number" ? last.durationSec : null;
    if (ratio >= 1 && dur !== null && dur <= 180) {
      earned.add("fast_learner");
    }
  }

  return [...earned].sort();
}

/**
 * Merge badge unlock timestamps for newly earned badges.
 * @param {string[]} prevIds
 * @param {string[]} nextIds
 * @param {Record<string, string>} prevUnlocks
 */
export function mergeBadgeUnlocks(prevIds, nextIds, prevUnlocks) {
  const next = { ...prevUnlocks };
  const now = new Date().toISOString();
  for (const id of nextIds) {
    if (!prevIds.includes(id) && !next[id]) {
      next[id] = now;
    }
  }
  return next;
}
