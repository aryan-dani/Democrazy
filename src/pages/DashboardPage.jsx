import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { scenarioPacks, timelineStages } from "../data/simulationData";
import { useProgress } from "../hooks/useProgress";
import ProgressBar from "../components/ProgressBar";
import BadgeCard from "../components/BadgeCard";
import EmptyState from "../components/EmptyState";
import "./DashboardPage.css";

function formatIso(iso) {
  if (!iso) return "Date unavailable";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function completionBlurb(row) {
  if (row.variant === "gemini") return "Adaptive session completed (Gemini).";
  if (row.variant === "classic") return "Scripted pack completed.";
  return "Marked complete in Democrazy.";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { progress, simulationPercent } = useProgress();

  const completions = useMemo(() => {
    const rows = [...(progress.completedSimulations ?? [])];
    rows.sort((a, b) => {
      const ta = a.at ? Date.parse(a.at) : 0;
      const tb = b.at ? Date.parse(b.at) : 0;
      return tb - ta;
    });
    return rows;
  }, [progress.completedSimulations]);

  const quizAttemptsDescending = useMemo(() => {
    const rows = [...(progress.quizScores ?? [])];
    rows.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    return rows;
  }, [progress.quizScores]);

  const simulationTotal =
    progress.simulationTotal > 0 ? progress.simulationTotal : (scenarioPacks[0]?.steps.length ?? 8);

  const resumeTarget = useMemo(() => {
    const visit = progress.lastSimulationVisit;
    if (
      visit?.packId &&
      scenarioPacks.some((pack) => pack.id === visit.packId) &&
      (visit.mode === "agent" || visit.mode === "classic")
    ) {
      return `/simulation?mode=${visit.mode}&pack=${visit.packId}`;
    }
    return "/simulation?mode=classic&pack=election-prep";
  }, [progress.lastSimulationVisit]);

  const lastQuizDisplay = progress.lastQuizScore
    ? `${progress.lastQuizScore.score}/${progress.lastQuizScore.total}`
    : "—";

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Activities sync in this browser. Sign in with Google to mirror progress to Firestore
            when Firebase env vars are configured.
          </p>
          {progress.lastSimulationVisit?.packId && (
            <p className="dashboard-subnote">
              Last simulation visit:&nbsp;
              <strong>{progress.lastSimulationVisit.mode}</strong>
              {" · "}
              <strong>{progress.lastSimulationVisit.packId}</strong>
              {progress.lastSimulationVisit.at && (
                <>
                  {" "}
                  (<span>{formatIso(progress.lastSimulationVisit.at)}</span>)
                </>
              )}
            </p>
          )}
        </div>
        <button className="btn-primary-hero" onClick={() => navigate(resumeTarget)} type="button">
          <span>Open simulations</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card dash-progress">
          <h2 className="dash-card-title">
            <span className="material-symbols-outlined">trending_up</span>
            Current progress
          </h2>
          <ProgressBar
            current={progress.simulationCompleted}
            total={simulationTotal}
            label="Simulation depth bar (tracks your latest scripted pack length)"
          />
          <div className="dash-stats-row">
            <div className="dash-stat">
              <span className="dash-stat-val">{simulationPercent}%</span>
              <span className="dash-stat-lbl">Simulation</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-val">{lastQuizDisplay}</span>
              <span className="dash-stat-lbl">Last quiz</span>
              {progress.lastQuizScore?.label && (
                <span className="dash-stat-sub">{progress.lastQuizScore.label}</span>
              )}
            </div>
            <div className="dash-stat">
              <span className="dash-stat-val">{progress.quizScores.length}</span>
              <span className="dash-stat-lbl">Quiz attempts</span>
            </div>
          </div>
        </div>

        <div className="dash-card dash-badges">
          <h2 className="dash-card-title">
            <span className="material-symbols-outlined">workspace_premium</span>
            Badges earned
          </h2>
          {(progress.badges ?? []).length === 0 ? (
            <EmptyState
              icon="emoji_events"
              title="Badge shelf is empty"
              hint="Finish simulations, quiz well, or earn a fast perfect score to unlock trophies."
            />
          ) : (
            <div className="dash-badge-grid">
              {(progress.badges ?? []).map((id) => (
                <BadgeCard
                  key={id}
                  badgeId={id}
                  unlockedAt={progress.badgeUnlocksAt?.[id] ?? null}
                />
              ))}
            </div>
          )}
        </div>

        <div className="dash-card">
          <h2 className="dash-card-title">
            <span className="material-symbols-outlined">check_circle</span>
            Completed simulations
          </h2>
          <div className="dash-list">
            {completions.length === 0 ? (
              <p className="dash-empty">
                No completions recorded yet. Finish a scripted pack or an adaptive Gemini session to
                see it listed here with a timestamp when available.
              </p>
            ) : (
              completions.map((row, idx) => (
                <div className="dash-list-item" key={`${row.title}-${idx}-${row.at ?? "legacy"}`}>
                  <div className="dash-list-icon">
                    <span className="material-symbols-outlined">
                      {row.variant === "gemini" ? "smart_toy" : "menu_book"}
                    </span>
                  </div>
                  <div>
                    <h4>{row.title}</h4>
                    <p>{completionBlurb(row)}</p>
                    <p className="dash-meta">
                      {row.at ? formatIso(row.at) : "Logged before local timestamps rolled out"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dash-card">
          <h2 className="dash-card-title">
            <span className="material-symbols-outlined">quiz</span>
            Quiz history
          </h2>
          <div className="dash-list">
            {quizAttemptsDescending.length === 0 ? (
              <p className="dash-empty">No graded quiz attempts yet.</p>
            ) : (
              quizAttemptsDescending.map((attempt, idx) => (
                <div className="dash-list-item" key={`${attempt.date}-${idx}`}>
                  <div className="dash-quiz-score">
                    <span className="dash-quiz-val">
                      {attempt.score}/{attempt.total}
                    </span>
                    <span className="dash-quiz-pct">
                      {attempt.total > 0
                        ? `${Math.round((attempt.score / attempt.total) * 100)}%`
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <h4>{attempt.label}</h4>
                    <p className="dash-meta">{formatIso(attempt.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="btn-text" onClick={() => navigate("/quiz")} type="button">
            Launch quiz →
          </button>
        </div>

        <div className="dash-card dash-timeline">
          <div className="dash-timeline-intro">
            <h2 className="dash-card-title dash-card-title-inline">
              <span className="material-symbols-outlined">timeline</span>
              Election process reference
            </h2>
            <p className="timeline-reference-copy">
              Explanatory roadmap from curated content—not a tally of tasks you personally finished.
            </p>
          </div>
          <div className="timeline-mini">
            {timelineStages.map((stage) => (
              <div className="timeline-mini-item timeline-reference" key={stage.id}>
                <div className="timeline-mini-dot">
                  <span className="material-symbols-outlined">{stage.icon}</span>
                </div>
                <div className="timeline-mini-info">
                  <h4>{stage.title}</h4>
                  <p className="timeline-mini-desc">{stage.description}</p>
                  <span className="timeline-badge badge-reference">Curriculum guide</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
