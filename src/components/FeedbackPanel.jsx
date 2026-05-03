import { memo } from "react";
import "./FeedbackPanel.css";

/**
 * Component to display correctness feedback or agentic coach notes.
 * Provides actions to retry or proceed.
 *
 * @param {Object} props
 * @param {boolean} [props.isCorrect] - Whether the user's answer was correct.
 * @param {string} [props.feedback] - The primary feedback text.
 * @param {string} [props.explanation] - Additional details or rationale.
 * @param {Function} [props.onRetry] - Handler for retrying the question.
 * @param {Function} [props.onNext] - Handler for advancing to the next step.
 * @param {string} props.nextLabel - The label for the next button.
 * @param {"classic"|"agent"|"quiz"} [props.variant="classic"] - Visual variant.
 * @param {Function} [props.onContinueAnyway] - Handler for skipping correction (quiz mode).
 * @param {string} [props.continueAnywayLabel="Continue anyway"] - Label for the skip button.
 */
const FeedbackPanel = memo(function FeedbackPanel({
  isCorrect,
  feedback,
  explanation,
  onRetry,
  onNext,
  nextLabel,
  variant = "classic",
  onContinueAnyway,
  continueAnywayLabel = "Continue anyway",
}) {
  const coachMode = variant === "agent";
  const quizMode = variant === "quiz";

  return (
    <div
      className={`feedback-panel ${coachMode ? "feedback-agent" : isCorrect ? "feedback-correct" : "feedback-wrong"} ${quizMode ? "feedback-quiz" : ""}`}
      id="feedback-panel"
      role="region"
      aria-live="polite"
    >
      <div className="feedback-header">
        <span
          className={`material-symbols-outlined feedback-icon ${isCorrect === true ? "dc-animate-check" : ""}`}
          aria-hidden="true"
        >
          {coachMode ? "psychology_alt" : isCorrect ? "emoji_events" : "error_outline"}
        </span>
        <h3 className="feedback-title">
          {coachMode ? "Agent reflection" : isCorrect ? "Correct!" : "Here's what happened"}
        </h3>
      </div>

      <div className="feedback-body">
        <div className="feedback-immediate">
          <h4>
            {coachMode ? "Ripple effects" : quizMode ? "Immediate feedback" : "What happened"}
          </h4>
          <p>{feedback}</p>
        </div>

        {explanation && (
          <div className="feedback-explanation">
            <h4>{coachMode ? "Next instincts" : "Learn why"}</h4>
            <p>{explanation}</p>
          </div>
        )}
      </div>

      <div className="feedback-actions">
        {coachMode || isCorrect ? (
          <button className="btn-next" onClick={onNext} id="btn-next-step" type="button">
            <span>{nextLabel || "Next Step"}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <div className="feedback-recovery-actions">
            <button className="btn-retry" onClick={onRetry} id="btn-retry" type="button">
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
              <span>Try again</span>
            </button>
            {typeof onContinueAnyway === "function" ? (
              <button className="btn-continue-soft" type="button" onClick={onContinueAnyway}>
                <span>{continueAnywayLabel}</span>
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
});

export default FeedbackPanel;
