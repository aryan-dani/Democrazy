import { electionPrepSteps } from "./electionPrep.js";
import { localCivicSteps } from "./localCivic.js";
import { misinformationLabSteps } from "./misinformationLab.js";

export const scenarioPacks = [
  {
    id: "election-prep",
    title: "Election Prep Saga",
    blurb:
      "From registration through results — foundational U.S. voter literacy scenarios with branching feedback.",
    steps: electionPrepSteps,
  },
  {
    id: "local-civic",
    title: "City Hall Spotlight",
    blurb:
      "Agendas, records, participatory budgeting, and petitions — deepen your municipality muscle memory.",
    steps: localCivicSteps,
  },
  {
    id: "misinformation-lab",
    title: "Misinformation Drill Lab",
    blurb:
      "Practice neutralizing deceptive audio, sloppy charts, and coercion plays without amplifying junk.",
    steps: misinformationLabSteps,
  },
];

/** @param {readonly { steps: unknown[] }[]} packs */
export function countScenariosAcrossPacks(packs) {
  return packs.reduce((total, pack) => total + pack.steps.length, 0);
}

export const simulationSteps = electionPrepSteps;

export function pickPackSteps(packId) {
  const pack = scenarioPacks.find((p) => p.id === packId);
  return pack?.steps ?? electionPrepSteps;
}

export const longestPackScenarioCount = Math.max(...scenarioPacks.map((p) => p.steps.length));
