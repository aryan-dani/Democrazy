import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { longestPackScenarioCount } from "../data/simulationData";
import { computeEarnedBadgeIds, mergeBadgeUnlocks } from "../utils/badges";

const STORAGE_KEY = "democrazy_progress";

export const QUIZ_LABEL_DEFAULT = "Civics knowledge quiz";

const ProgressContext = createContext(null);

function normalizeQuizEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const score = typeof entry.score === "number" ? entry.score : 0;
  const total = typeof entry.total === "number" ? entry.total : 0;
  const date = typeof entry.date === "string" ? entry.date : new Date().toISOString();
  const label =
    typeof entry.label === "string" && entry.label.trim().length > 0
      ? entry.label.trim()
      : QUIZ_LABEL_DEFAULT;
  const durationSec =
    typeof entry.durationSec === "number" && Number.isFinite(entry.durationSec)
      ? Math.max(0, entry.durationSec)
      : undefined;
  const out = { score, total, date, label };
  if (durationSec !== undefined) out.durationSec = durationSec;
  return out;
}

function deriveVariantFromTitle(title) {
  if (title.includes("· Gemini")) return "gemini";
  if (title.includes("· Classic")) return "classic";
  return "unknown";
}

function normalizeCompletion(entry) {
  if (typeof entry === "string" && entry.trim()) {
    const title = entry.trim();
    return { title, variant: deriveVariantFromTitle(title), at: null };
  }
  if (entry && typeof entry === "object" && typeof entry.title === "string" && entry.title.trim()) {
    const title = entry.title.trim();
    const variant =
      entry.variant === "gemini" || entry.variant === "classic"
        ? entry.variant
        : deriveVariantFromTitle(title);
    return {
      title,
      variant,
      at: typeof entry.at === "string" ? entry.at : null,
    };
  }
  return null;
}

function defaultProgressShape() {
  return {
    simulationCompleted: 0,
    simulationTotal: longestPackScenarioCount,
    quizScores: [],
    lastQuizScore: null,
    completedSimulations: [],
    lastSimulationVisit: null,
    badges: [],
    badgeUnlocksAt: {},
    classicSessionByPack: {},
    updatedAt: null,
  };
}

function withReconciledBadges(prev, nextSlice) {
  const merged = { ...prev, ...nextSlice };
  const ids = computeEarnedBadgeIds(merged);
  const prevIds = Array.isArray(merged.badges) ? merged.badges : [];
  const badgeUnlocksAt = mergeBadgeUnlocks(prevIds, ids, merged.badgeUnlocksAt ?? {});
  return {
    ...merged,
    badges: ids,
    badgeUnlocksAt,
    updatedAt: new Date().toISOString(),
  };
}

function migrateProgress(raw) {
  if (!raw || typeof raw !== "object") return null;

  const simulationTotalRaw =
    typeof raw.simulationTotal === "number" && raw.simulationTotal > 0
      ? raw.simulationTotal
      : longestPackScenarioCount;

  let quizScores = [];
  if (Array.isArray(raw.quizScores)) {
    quizScores = raw.quizScores.map(normalizeQuizEntry).filter(Boolean);
  }

  let lastQuizScore = null;
  if (raw.lastQuizScore && typeof raw.lastQuizScore === "object") {
    lastQuizScore = normalizeQuizEntry({ ...raw.lastQuizScore });
  }

  let completedSimulations = [];
  if (Array.isArray(raw.completedSimulations)) {
    completedSimulations = raw.completedSimulations.map(normalizeCompletion).filter(Boolean);
  }

  let lastSimulationVisit = null;
  const v = raw.lastSimulationVisit;
  if (v && typeof v === "object" && (v.mode === "agent" || v.mode === "classic")) {
    const packId = typeof v.packId === "string" ? v.packId.trim() : "";
    if (packId) {
      lastSimulationVisit = {
        mode: v.mode,
        packId,
        at: typeof v.at === "string" ? v.at : new Date().toISOString(),
      };
    }
  }

  let classicSessionByPack = {};
  if (raw.classicSessionByPack && typeof raw.classicSessionByPack === "object") {
    for (const [k, val] of Object.entries(raw.classicSessionByPack)) {
      if (typeof val === "object" && val && typeof val.step === "number") {
        classicSessionByPack[k] = {
          step: Math.max(0, Math.round(val.step)),
          at: typeof val.at === "string" ? val.at : undefined,
        };
      }
    }
  }

  let badgeUnlocksAt = {};
  if (raw.badgeUnlocksAt && typeof raw.badgeUnlocksAt === "object") {
    badgeUnlocksAt = { ...raw.badgeUnlocksAt };
  }

  let badges = [];
  if (Array.isArray(raw.badges)) {
    badges = raw.badges.filter((x) => typeof x === "string");
  }

  const base = {
    simulationCompleted:
      typeof raw.simulationCompleted === "number" ? Math.max(0, raw.simulationCompleted) : 0,
    simulationTotal: simulationTotalRaw,
    quizScores,
    lastQuizScore,
    completedSimulations,
    lastSimulationVisit,
    badges,
    badgeUnlocksAt,
    classicSessionByPack,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
  return withReconciledBadges(base, {});
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const migrated = migrateProgress(parsed);
      if (migrated) return migrated;
    }
  } catch {
    /* ignore */
  }
  return withReconciledBadges(defaultProgressShape(), {});
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress]);

  const mergeRemotePayload = useCallback((remotePartial) => {
    if (!remotePartial || typeof remotePartial !== "object") return;
    setProgress((prev) => {
      const nextQuiz = Array.isArray(remotePartial.quizScores)
        ? remotePartial.quizScores.map(normalizeQuizEntry).filter(Boolean)
        : [];
      const nextDone = [...(prev.completedSimulations ?? [])];
      const remoteDone = Array.isArray(remotePartial.completedSimulations)
        ? remotePartial.completedSimulations.map(normalizeCompletion).filter(Boolean)
        : [];
      for (const r of remoteDone) {
        if (!nextDone.some((x) => x.title === r.title && x.at === r.at)) nextDone.push(r);
      }

      const classicMerged = { ...(prev.classicSessionByPack ?? {}) };
      const remClassic =
        remotePartial.classicSessionByPack && typeof remotePartial.classicSessionByPack === "object"
          ? remotePartial.classicSessionByPack
          : {};
      for (const [pid, sess] of Object.entries(remClassic)) {
        const rStep =
          sess && typeof sess === "object" && typeof sess.step === "number" ? sess.step : 0;
        const local = classicMerged[pid];
        if (!local || rStep > local.step) classicMerged[pid] = { step: rStep, at: sess?.at };
      }

      const remoteLast = remotePartial.lastQuizScore
        ? normalizeQuizEntry(remotePartial.lastQuizScore)
        : null;
      let lastQuizScore = prev.lastQuizScore;
      if (
        remoteLast &&
        (!lastQuizScore || Date.parse(remoteLast.date) > Date.parse(lastQuizScore.date))
      )
        lastQuizScore = remoteLast;

      let quizScores = [...prev.quizScores];
      for (const q of nextQuiz) {
        if (!quizScores.some((e) => e.date === q.date)) quizScores.push(q);
      }
      quizScores.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

      const patch = {
        simulationCompleted: Math.max(
          prev.simulationCompleted,
          typeof remotePartial.simulationCompleted === "number"
            ? remotePartial.simulationCompleted
            : 0,
        ),
        quizScores,
        completedSimulations: nextDone,
        classicSessionByPack: classicMerged,
        lastQuizScore,
      };

      return withReconciledBadges(prev, patch);
    });
  }, []);

  const updateSimulationProgress = useCallback((completed, total) => {
    setProgress((prev) =>
      withReconciledBadges(prev, {
        simulationCompleted: Math.max(prev.simulationCompleted, completed),
        simulationTotal: total,
      }),
    );
  }, []);

  const addQuizScore = useCallback((score, total, meta = {}) => {
    const entry = normalizeQuizEntry({
      score,
      total,
      date: new Date().toISOString(),
      label: typeof meta.label === "string" ? meta.label : QUIZ_LABEL_DEFAULT,
      durationSec: typeof meta.durationSec === "number" ? meta.durationSec : undefined,
    });
    if (!entry) return;
    setProgress((prev) =>
      withReconciledBadges(prev, {
        quizScores: [...prev.quizScores, entry],
        lastQuizScore: entry,
      }),
    );
  }, []);

  const markSimulationComplete = useCallback((simName) => {
    const title = String(simName).trim();
    if (!title) return;
    const row = normalizeCompletion({
      title,
      variant: deriveVariantFromTitle(title),
      at: new Date().toISOString(),
    });
    if (!row) return;
    setProgress((prev) =>
      withReconciledBadges(prev, {
        completedSimulations: [...prev.completedSimulations, row],
      }),
    );
  }, []);

  const rememberSimulationVisit = useCallback(({ mode, packId }) => {
    const m = mode === "agent" ? "agent" : "classic";
    const id = typeof packId === "string" ? packId.trim() : "";
    if (!id) return;
    setProgress((prev) =>
      withReconciledBadges(prev, {
        lastSimulationVisit: {
          mode: m,
          packId: id,
          at: new Date().toISOString(),
        },
      }),
    );
  }, []);

  const saveClassicPackStep = useCallback((packId, stepIndex) => {
    const id = typeof packId === "string" ? packId.trim() : "";
    if (!id || typeof stepIndex !== "number" || Number.isNaN(stepIndex)) return;
    const step = Math.max(0, Math.round(stepIndex));
    setProgress((prev) => {
      const map = { ...(prev.classicSessionByPack ?? {}) };
      map[id] = { step, at: new Date().toISOString() };
      return withReconciledBadges(prev, { classicSessionByPack: map });
    });
  }, []);

  const clearClassicPackSession = useCallback((packId) => {
    const id = typeof packId === "string" ? packId.trim() : "";
    if (!id) return;
    setProgress((prev) => {
      const map = { ...(prev.classicSessionByPack ?? {}) };
      delete map[id];
      return withReconciledBadges(prev, { classicSessionByPack: map });
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(withReconciledBadges(defaultProgressShape(), {}));
  }, []);

  const total = progress.simulationTotal > 0 ? progress.simulationTotal : longestPackScenarioCount;
  const simulationPercent = Math.round(
    (Math.min(progress.simulationCompleted, total) / total) * 100,
  );

  const api = useMemo(
    () => ({
      progress,
      updateSimulationProgress,
      addQuizScore,
      markSimulationComplete,
      rememberSimulationVisit,
      saveClassicPackStep,
      clearClassicPackSession,
      resetProgress,
      mergeRemotePayload,
      simulationPercent: Number.isFinite(simulationPercent) ? simulationPercent : 0,
    }),
    [
      progress,
      updateSimulationProgress,
      addQuizScore,
      markSimulationComplete,
      rememberSimulationVisit,
      saveClassicPackStep,
      clearClassicPackSession,
      resetProgress,
      mergeRemotePayload,
      simulationPercent,
    ],
  );

  return createElement(ProgressContext.Provider, { value: api }, children);
}

/**
 * Hook to access and mutate the user's progress state from the ProgressProvider context.
 * Used for saving quiz scores, recording completed simulations, and tracking badges.
 */
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside <ProgressProvider>.");
  }
  return ctx;
}
