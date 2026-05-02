import { useState, useCallback, useEffect } from "react";

import { buildOfflineBeat } from "../utils/agenticFallback";
import { postSimulationTurn, SimulationApiError } from "../utils/simulationApi";

const seedWorldState = () => ({
  trustScore: 60,
  rumorExposure: 20,
  deadlinesMet: 0,
  turnIndex: 0,
});

/** @typedef {{ narrative:string, phase:string, options:{id:string,label:string}[], coachNote:string }} AgentTurnFace */

function scheduleRetryAfter(err) {
  if (
    typeof err.retryAfterSec === "number" &&
    Number.isFinite(err.retryAfterSec) &&
    err.retryAfterSec > 0
  ) {
    return Date.now() + err.retryAfterSec * 1000;
  }
  if (err.status === 403 || err.code === "AUTH" || err.code === "MODEL_NOT_FOUND" || err.code === "NO_API_KEY") {
    return 0;
  }
  if (err.status === 429 || err.code === "RATE_LIMIT") {
    return Date.now() + 45_000;
  }
  if (err.status === 503 || err.code === "MODEL_UNAVAILABLE") {
    return Date.now() + 20_000;
  }
  return 0;
}

export function useAgenticSimulation({ packId, enabled }) {
  const [scene, setScene] = useState(
    /** @type { Partial<AgentTurnFace> | null } */ (null),
  );
  const [worldState, setWorldState] = useState(seedWorldState);
  const [maxTurns, setMaxTurns] = useState(10);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [agentError, setAgentError] = useState(
    /** @type {null | { message: string; code?: string; status?: number }} */ (null),
  );
  const [retryAllowedAt, setRetryAllowedAt] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    if (!retryAllowedAt || Date.now() >= retryAllowedAt) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [retryAllowedAt]);

  const secondsUntilRetry =
    retryAllowedAt > nowTick ? Math.ceil((retryAllowedAt - nowTick) / 1000) : 0;
  const canRetryGemini = !retryAllowedAt || Date.now() >= retryAllowedAt;

  const applyPayload = useCallback((payload) => {
    if (!payload.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Model declined");
    }
    setScene({
      narrative: payload.narrative,
      phase: payload.phase,
      options: payload.options,
      coachNote: payload.coachNote,
    });
    setWorldState(payload.worldState);
    const cap = typeof payload.meta?.maxTurns === "number" ? payload.meta.maxTurns : undefined;
    if (cap !== undefined) {
      setMaxTurns(cap);
    }
    setCompleted(Boolean(payload.complete));
  }, []);

  const applyGeminiCatch = useCallback((error) => {
    if (error instanceof SimulationApiError) {
      setAgentError({
        message: error.message,
        code: error.code,
        status: error.status,
      });
      const until = scheduleRetryAfter(error);
      if (until > Date.now()) {
        setRetryAllowedAt(until);
      }
    } else {
      setAgentError({
        message: error instanceof Error ? error.message : String(error),
      });
      setRetryAllowedAt(Date.now() + 6000);
    }
  }, []);

  const hydrateOfflineAt = useCallback(
    (turnOneBased, priorWs) => {
      const beat = buildOfflineBeat(packId, turnOneBased, priorWs);
      if (!beat.ok) {
        setAgentError({ message: beat.error ?? "Offline mode unavailable." });
        return;
      }
      if (beat.complete) {
        setCompleted(true);
        setScene(null);
        return;
      }
      setScene(beat.scene);
      setWorldState(beat.worldState);
      setMaxTurns(beat.maxTurns);
      setCompleted(false);
      setAgentError(null);
    },
    [packId],
  );

  const bootstrapFromNetwork = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setAgentError(null);
    setCompleted(false);
    setOfflineMode(false);
    setRetryAllowedAt(0);
    setScene(null);
    setWorldState(seedWorldState());
    try {
      const response = await postSimulationTurn({
        action: "start",
        packId,
        worldState: seedWorldState(),
      });
      applyPayload(response);
      setOfflineMode(false);
    } catch (error) {
      applyGeminiCatch(error);
      setOfflineMode(false);
    } finally {
      setLoading(false);
    }
  }, [applyGeminiCatch, applyPayload, enabled, packId]);

  useEffect(() => {
    bootstrapFromNetwork();
  }, [packId, enabled, bootstrapFromNetwork]);

  const continueOfflinePractice = useCallback(() => {
    setAgentError(null);
    setRetryAllowedAt(0);
    setOfflineMode(true);
    setLoading(false);

    const startTurn = scene ? Math.min(worldState.turnIndex + 1, Number.MAX_SAFE_INTEGER) : 1;
    hydrateOfflineAt(startTurn, worldState);
  }, [hydrateOfflineAt, scene, worldState]);

  const restartWithGemini = useCallback(async () => {
    if (!enabled) return;
    if (!canRetryGemini) return;
    await bootstrapFromNetwork();
  }, [bootstrapFromNetwork, canRetryGemini, enabled]);

  const chooseOption = useCallback(
    async (index) => {
      if (!enabled || loading || completed || (agentError && !offlineMode) || !scene?.options?.[index]) {
        return;
      }

      if (offlineMode) {
        const nextTurn = worldState.turnIndex + 1;
        const beat = buildOfflineBeat(packId, nextTurn, worldState);
        if (!beat.ok) {
          setAgentError({ message: beat.error ?? "Offline step unavailable." });
          return;
        }
        if (beat.complete) {
          setCompleted(true);
          setScene(null);
          return;
        }
        setScene(beat.scene);
        setWorldState(beat.worldState);
        setMaxTurns(beat.maxTurns);
        setCompleted(false);
        setAgentError(null);
        return;
      }

      const optionId = scene.options[index].id;
      setLoading(true);
      try {
        const response = await postSimulationTurn({
          action: "advance",
          packId,
          worldState,
          lastChoice: { optionId },
        });
        applyPayload(response);
        setAgentError(null);
        setOfflineMode(false);
      } catch (error) {
        applyGeminiCatch(error);
      } finally {
        setLoading(false);
      }
    },
    [
      agentError,
      offlineMode,
      enabled,
      loading,
      completed,
      scene,
      packId,
      worldState,
      applyPayload,
      applyGeminiCatch,
    ],
  );

  return {
    scene,
    worldState,
    maxTurns,
    loading,
    agentError,
    offlineMode,
    secondsUntilRetry,
    canRetryGemini,
    completed,
    chooseOption,
    restart: restartWithGemini,
    continueOfflinePractice,
  };
}