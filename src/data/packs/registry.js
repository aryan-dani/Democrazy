/**
 * Pack metadata stays in the main bundle; step payloads load per-pack via dynamic import.
 * Keep `stepCount` aligned with each pack file’s scenario array length.
 */

/** @typedef {{ id: string; title: string; blurb: string; stepCount: number }} ScenarioPackMeta */

/** @type {ScenarioPackMeta[]} */
export const scenarioPackCatalog = [
  {
    id: "election-prep",
    title: "Election Prep Saga",
    blurb:
      "From registration through results — foundational U.S. voter literacy scenarios with branching feedback.",
    stepCount: 8,
  },
  {
    id: "local-civic",
    title: "City Hall Spotlight",
    blurb:
      "Agendas, records, participatory budgeting, and petitions — deepen your municipality muscle memory.",
    stepCount: 5,
  },
  {
    id: "misinformation-lab",
    title: "Misinformation Drill Lab",
    blurb:
      "Practice neutralizing deceptive audio, sloppy charts, and coercion plays without amplifying junk.",
    stepCount: 5,
  },
  {
    id: "constitutional-stress",
    title: "Constitutional Stress Test",
    blurb:
      "Electoral vote paths, recount myths, courthouse drama versus reality — institutional literacy drills.",
    stepCount: 8,
  },
];

/** Back-compat name used across the app — entries have no `steps`; use `loadPackSteps`. */
export const scenarioPacks = scenarioPackCatalog;

/** @param {readonly ScenarioPackMeta[]} [packs] */
export function countScenariosAcrossPacks(packs = scenarioPackCatalog) {
  return packs.reduce((total, pack) => total + pack.stepCount, 0);
}

export const longestPackScenarioCount = Math.max(...scenarioPackCatalog.map((p) => p.stepCount));

export const DEFAULT_PACK_ID = scenarioPackCatalog[0]?.id ?? "election-prep";

/**
 * Load scripted steps for one pack (code-split). Unknown ids fall back to election prep.
 * @param {string} packId
 */
export async function loadPackSteps(packId) {
  const known = scenarioPackCatalog.some((p) => p.id === packId);
  const id = known ? packId : DEFAULT_PACK_ID;
  switch (id) {
    case "election-prep":
      return (await import("./electionPrep.js")).electionPrepSteps;
    case "local-civic":
      return (await import("./localCivic.js")).localCivicSteps;
    case "misinformation-lab":
      return (await import("./misinformationLab.js")).misinformationLabSteps;
    case "constitutional-stress":
      return (await import("./constitutionalStressTest.js")).constitutionalStressTestSteps;
    default:
      return (await import("./electionPrep.js")).electionPrepSteps;
  }
}
