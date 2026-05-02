import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  scenarioPacks,
  pickPackSteps,
} from "../data/simulationData";

import { useSimulation } from "../hooks/useSimulation";
import { useAgenticSimulation } from "../hooks/useAgenticSimulation";
import { useProgress } from "../hooks/useProgress";
import ProgressBar from "../components/ProgressBar";
import ScenarioCard from "../components/ScenarioCard";
import OptionButton from "../components/OptionButton";
import FeedbackPanel from "../components/FeedbackPanel";
import ShareSummaryCard from "../components/ShareSummaryCard";
import { trackEvent } from "../utils/analytics";
import { BADGE_CATALOG } from "../utils/badges";
import "./SimulationPage.css";

function resolvePackId(raw) {
  if (scenarioPacks.some((p) => p.id === raw)) {
    return raw;
  }
  return scenarioPacks[0]?.id ?? "election-prep";
}

function ScenarioToolbar({ mode, packId, onPackChange, onModeChange }) {
  return (
    <div className="sim-toolbar" aria-label="Simulation controls">
      <div className="sim-toolbar-cluster">
        <label className="sim-field-label" htmlFor="scenario-pack-select">
          Scenario pack
        </label>
        <select
          className="sim-select"
          id="scenario-pack-select"
          value={packId}
          onChange={(event) => onPackChange(event.target.value)}
        >
          {scenarioPacks.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.title}
            </option>
          ))}
        </select>
      </div>

      <div className="sim-toolbar-cluster mode-toggle-cluster">
        <span className="sim-field-label">Mode</span>
        <div className="mode-toggle" role="group" aria-label="Simulation mode">
          <button
            type="button"
            className={`mode-toggle-btn ${mode === "classic" ? "mode-active" : ""}`}
            onClick={() => onModeChange("classic")}
          >
            Classic script
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${mode === "agent" ? "mode-active" : ""}`}
            onClick={() => onModeChange("agent")}
          >
            Adaptive (Gemini)
          </button>
        </div>
      </div>
    </div>
  );
}

function ClassicSimulationExperience({ packId, onAdjustQuery }) {
  const navigate = useNavigate();
  const steps = useMemo(() => pickPackSteps(packId), [packId]);
  const packMeta = scenarioPacks.find((p) => p.id === packId) ?? scenarioPacks[0];

  const {
    currentStep,
    selectedOption,
    isCorrect,
    showFeedback,
    isComplete,
    currentStepData,
    totalSteps,
    handleOptionClick,
    handleNextStep,
    handleRetry,
    handleContinueAnyway,
    resetSimulation,
  } = useSimulation(steps);

  const {
    updateSimulationProgress,
    markSimulationComplete,
    saveClassicPackStep,
    clearClassicPackSession,
    progress,
  } = useProgress();

  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const cap = Math.max(steps.length - 1, 0);
    const raw = progressRef.current.classicSessionByPack?.[packId]?.step ?? 0;
    const saved = Math.min(Math.max(Number(raw), 0), cap);
    resetSimulation({ startAt: saved });
     
  }, [packId, steps.length, resetSimulation]);

  const persistClassicAdvance = () => {
    updateSimulationProgress(currentStep + 1, totalSteps);
    if (currentStep + 1 >= totalSteps) {
      markSimulationComplete(`${packMeta.title} · Classic`);
      clearClassicPackSession(packId);
    } else {
      saveClassicPackStep(packId, currentStep + 1);
    }
  };

  const handleNextScripted = () => {
    persistClassicAdvance();
    handleNextStep();
  };

  const handleContinueWithMistake = () => {
    persistClassicAdvance();
    handleContinueAnyway();
  };

  useEffect(() => {
    if (!isComplete) return;
    trackEvent("sim_complete", { mode: "classic", packId });
  }, [isComplete, packId]);

  if (!currentStepData) {
    return null;
  }

  if (isComplete) {
    return (
      <div className="sim-page-shell">
        <ScenarioToolbar mode="classic" packId={packId} onPackChange={(id) => onAdjustQuery(id, "classic")} onModeChange={(next) => onAdjustQuery(packId, next)} />
        <div className="simulation-page" id="simulation-page">
          <div className="simulation-complete">
            <div className="complete-icon-wrap">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <h2>Classic simulation complete!</h2>
            <p>
              You finished all {totalSteps} scripted beats inside {packMeta.title}. Prefer branching,
              cinematic consequences? Toggle Adaptive mode for a Gemini-powered run grounded in this
              theme.
            </p>
            <div className="complete-actions">
              <button
                className="btn-primary-hero"
                onClick={() => navigate("/quiz?from=sim")}
                type="button"
              >
                <span>Take the Quiz</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button
                className="btn-secondary-hero"
                onClick={() => {
                  clearClassicPackSession(packId);
                  resetSimulation({ startAt: 0 });
                }}
                type="button"
              >
                <span>Restart Pack</span>
              </button>
            </div>
            <ShareSummaryCard
              title={`${packMeta.title} • Classic`}
              headline="Simulation complete"
              scoreLabel={`${totalSteps}/${totalSteps} beats`}
              sublabel={`Pack resume + quiz unlock ready`}
              badges={(progress.badges ?? []).map((id) => BADGE_CATALOG[id]?.title).filter(Boolean)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-page-shell">
      <ScenarioToolbar mode="classic" packId={packId} onPackChange={(id) => onAdjustQuery(id, "classic")} onModeChange={(next) => onAdjustQuery(packId, next)} />
      <div className="simulation-page" id="simulation-page">
        <div className="simulation-sidebar">
          <h2 className="sidebar-title">Simulation Hub</h2>
          <p className="sidebar-muted">{packMeta.blurb}</p>
          <ProgressBar current={currentStep} total={totalSteps} label="Script Progress" />
          <div className="step-list">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`step-item ${idx === currentStep ? "step-active" : ""} ${idx < currentStep ? "step-done" : ""}`}
              >
                <span className="step-dot">
                  {idx < currentStep ? <span className="material-symbols-outlined">check</span> : idx + 1}
                </span>
                <span className="step-name">{step.phase}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="simulation-main">
          <ScenarioCard
            step={currentStepData}
            phase={currentStepData.phase}
            didYouKnow={currentStepData.didYouKnow}
            pitfall={currentStepData.pitfall}
          >
            {currentStepData.options.map((opt, idx) => (
              <OptionButton
                key={idx}
                text={opt.text}
                index={idx}
                isSelected={selectedOption === idx}
                isCorrect={opt.correct}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={handleOptionClick}
              />
            ))}
          </ScenarioCard>

          {showFeedback && (
            <FeedbackPanel
              isCorrect={isCorrect}
              feedback={currentStepData.options[selectedOption]?.feedback ?? ""}
              explanation={currentStepData.explanation}
              onRetry={handleRetry}
              onNext={handleNextScripted}
              onContinueAnyway={handleContinueWithMistake}
              continueAnywayLabel="Continue anyway — story keeps going"
              nextLabel={currentStep + 1 >= totalSteps ? "Complete" : "Next Step"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function AgentSimulationExperience({ packId, onAdjustQuery }) {
  const navigate = useNavigate();
  const packMeta = scenarioPacks.find((p) => p.id === packId) ?? scenarioPacks[0];

  const {
    scene,
    loading,
    agentError,
    offlineMode,
    secondsUntilRetry,
    canRetryGemini,
    completed,
    worldState,
    maxTurns,
    chooseOption,
    restart,
    continueOfflinePractice,
  } = useAgenticSimulation({ packId, enabled: true });

  const [chosenOptionIdx, setChosenOptionIdx] = useState(null);

  useEffect(() => {
    setChosenOptionIdx(null);
  }, [scene?.options, scene?.narrative, packId]);

  const { markSimulationComplete, updateSimulationProgress, progress } = useProgress();
  const completionLogged = useRef(false);

  useEffect(() => {
    completionLogged.current = false;
  }, [packId]);

  useEffect(() => {
    if (!completed) {
      return;
    }
    if (completionLogged.current) {
      return;
    }
    completionLogged.current = true;
    markSimulationComplete(
      offlineMode ? `${packMeta.title} · Offline practice` : `${packMeta.title} · Gemini`,
    );
    updateSimulationProgress(Math.min(worldState.turnIndex, maxTurns), maxTurns);
    trackEvent("sim_complete", {
      variant: offlineMode ? "offline_practice" : "gemini_agent",
      packId,
    });
  }, [
    completed,
    markSimulationComplete,
    maxTurns,
    offlineMode,
    packMeta.title,
    updateSimulationProgress,
    worldState.turnIndex,
  ]);

  const blockingError = Boolean(agentError && !offlineMode);

  if (completed) {
    return (
      <div className="sim-page-shell">
        <ScenarioToolbar mode="agent" packId={packId} onPackChange={(id) => onAdjustQuery(id, "agent")} onModeChange={(next) => onAdjustQuery(packId, next)} />
        <div className="simulation-page" id="simulation-page">
          <div className="simulation-complete">
            <div className="complete-icon-wrap">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <h2>{offlineMode ? "Offline session complete!" : "Gemini session complete!"}</h2>
            <p>
              You completed {worldState.turnIndex}/{maxTurns} adaptive beats for {packMeta.title}.
              {" "}
              {offlineMode
                ? "Practice used the scripted pack storyline while the AI was unavailable."
                : "Gemini replies are illustrative—always corroborate with official election resources."}
            </p>
            <div className="complete-actions">
              <button className="btn-primary-hero" onClick={() => navigate("/quiz?from=sim")} type="button">
                <span>Take the Quiz</span>
              </button>
              <button className="btn-secondary-hero" onClick={() => restart()} type="button">
                <span>Rerun adaptive sim</span>
              </button>
            </div>
            <ShareSummaryCard
              title={`${packMeta.title} • ${offlineMode ? "Offline practice" : "Gemini"}`}
              headline="Adaptive simulation complete"
              scoreLabel={`${Math.min(worldState.turnIndex, maxTurns)}/${maxTurns}`}
              badges={(progress.badges ?? []).map((id) => BADGE_CATALOG[id]?.title).filter(Boolean)}
            />
          </div>
        </div>
      </div>
    );
  }

  const handleAdaptiveChoice = async (idx) => {
    if (loading || blockingError) {
      return;
    }
    setChosenOptionIdx(idx);
    await chooseOption(idx);
  };

  const trust = typeof worldState.trustScore === "number" ? worldState.trustScore : "--";
  const rumor = typeof worldState.rumorExposure === "number" ? worldState.rumorExposure : "--";
  const stateStrip = `Trust ${trust} • Rumors ${rumor}`;

  const progressCurrent =
    blockingError && !scene ? 0 : loading && !scene ? 0 : worldState.turnIndex;
  const safeTitle = loading && !scene ? "Spinning up your session…" : `Turn ${worldState.turnIndex}`;
  const phaseLabel = offlineMode
    ? scene?.phase ?? "Offline practice"
    : blockingError && !scene
      ? "Gemini paused"
      : scene?.phase ?? (loading && !scene ? "Contacting Gemini…" : "—");

  return (
    <div className="sim-page-shell">
      <ScenarioToolbar mode="agent" packId={packId} onPackChange={(id) => onAdjustQuery(id, "agent")} onModeChange={(next) => onAdjustQuery(packId, next)} />
      <div className="simulation-page" id="simulation-page">
        <div className="simulation-sidebar">
          <h2 className="sidebar-title">Adaptive Studio</h2>
          <p className="sidebar-muted">{packMeta.blurb}</p>
          {offlineMode && (
            <div className="sim-offline-banner" role="status">
              Offline practice: same pack storyline without Gemini. You can retry the AI anytime.
              <button
                type="button"
                className="btn-text sim-offline-banner-retry"
                disabled={loading || !canRetryGemini}
                onClick={() => restart()}
              >
                {!canRetryGemini && secondsUntilRetry > 0
                  ? `Retry Gemini (${secondsUntilRetry}s)`
                  : "Retry with Gemini"}
              </button>
            </div>
          )}
          {agentError && !offlineMode && (
            <div className="sim-alert" role="alert">
              {agentError.code ? (
                <span className="sim-error-code">{agentError.code.replace(/_/g, " ")}</span>
              ) : null}
              <p className="sim-error-message">{agentError.message}</p>
              {!canRetryGemini && secondsUntilRetry > 0 ? (
                <p className="sim-retry-countdown">
                  Automated backoff: retry opens in ~{secondsUntilRetry}s to avoid hammering the API.
                </p>
              ) : null}
              <div className="sim-error-actions">
                <button
                  className="btn-primary-hero sim-error-primary"
                  type="button"
                  disabled={loading || !canRetryGemini}
                  onClick={() => restart()}
                >
                  Retry with Gemini
                </button>
                <button
                  className="btn-secondary-hero"
                  type="button"
                  disabled={loading}
                  onClick={() => continueOfflinePractice()}
                >
                  Continue offline
                </button>
                <button
                  className="btn-text"
                  type="button"
                  onClick={() => onAdjustQuery(packId, "classic")}
                >
                  Scripted pack only
                </button>
              </div>
            </div>
          )}
          <ProgressBar
            current={Math.min(progressCurrent, maxTurns)}
            total={Math.max(maxTurns, 1)}
            label="Adaptive arc"
          />
          <div className="metric-grid">
            <div>
              <span className="metric-label">Phase</span>
              <strong>{phaseLabel}</strong>
            </div>
            <div>
              <span className="metric-label">Momentum</span>
              <strong>{blockingError && !scene ? "—" : stateStrip}</strong>
            </div>
          </div>
        </div>

        <div className="simulation-main agent-main">
          {loading && !scene && (
            <div className="sim-loading" role="status">
              Gemini is authoring your dilemma…
            </div>
          )}

          {scene && (
            <ScenarioCard
              step={{
                id: worldState.turnIndex,
                scenario: scene.narrative,
              }}
              phase={scene.phase}
              coachBanner={scene.coachNote}
              titleOverride={safeTitle}
            >
              {scene.options?.map((opt, idx) => (
                <OptionButton
                  key={opt.id}
                  text={opt.label}
                  index={idx}
                  isCorrect={undefined}
                  isSelected={chosenOptionIdx === idx}
                  showFeedback={false}
                  disabled={loading || blockingError}
                  onClick={handleAdaptiveChoice}
                  variant="agent"
                />
              ))}
            </ScenarioCard>
          )}

          {loading && scene && (
            <div className="sim-soft-loading" aria-live="polite">
              Updating storyline…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "agent" ? "agent" : "classic";
  const packId = resolvePackId(params.get("pack") ?? scenarioPacks[0]?.id);
  const { rememberSimulationVisit } = useProgress();

  useEffect(() => {
    rememberSimulationVisit({ mode, packId });
  }, [mode, packId, rememberSimulationVisit]);

  const handleAdjustQuery = (nextPack, nextMode = mode) => {
    const qp = new URLSearchParams(params);
    qp.set("pack", resolvePackId(nextPack));
    qp.set("mode", nextMode === "agent" ? "agent" : "classic");
    setParams(qp, { replace: true });
  };

  if (mode === "agent") {
    return <AgentSimulationExperience key={packId} packId={packId} onAdjustQuery={handleAdjustQuery} />;
  }

  return <ClassicSimulationExperience key={packId} packId={packId} onAdjustQuery={handleAdjustQuery} />;
}
