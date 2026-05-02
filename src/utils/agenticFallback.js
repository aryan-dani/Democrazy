import { pickPackSteps } from "../data/simulationData";

/**
 * Scripted pack steps shaped like an agent turn (offline when Gemini is unavailable).
 * @param {string} packId
 * @param {number} turnOneBased 1-indexed beat (matches adaptive worldState.turnIndex)
 * @param {{ trustScore:number, rumorExposure:number, deadlinesMet:number, turnIndex:number }} [priorWorld]
 */
export function buildOfflineBeat(packId, turnOneBased, priorWorld) {
  const steps = pickPackSteps(packId);
  if (!steps.length) {
    return { ok: false, error: "This pack has no scripted steps for offline mode." };
  }

  const idx = turnOneBased - 1;
  if (idx < 0) {
    return { ok: false, error: "Invalid turn." };
  }
  if (idx >= steps.length) {
    return { ok: true, complete: true };
  }

  const step = steps[idx];
  const options = step.options.map((o, i) => ({
    id: String.fromCharCode(97 + i),
    label: o.text,
  }));

  const coach =
    step.didYouKnow ||
    step.pitfall ||
    step.explanation ||
    "Keep going—each choice still teaches something useful.";

  const base = priorWorld ?? {
    trustScore: 60,
    rumorExposure: 20,
    deadlinesMet: 0,
    turnIndex: 0,
  };

  return {
    ok: true,
    complete: false,
    scene: {
      narrative: `Offline practice (no AI): ${step.scenario}`,
      phase: step.phase,
      options,
      coachNote: coach,
    },
    worldState: {
      ...base,
      turnIndex: turnOneBased,
    },
    maxTurns: steps.length,
  };
}
