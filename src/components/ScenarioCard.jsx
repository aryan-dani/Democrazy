import { memo } from "react";
import "./ScenarioCard.css";

/**
 * Component to display a scenario step with its options and contextual hints.
 *
 * @param {Object} props
 * @param {Object} props.step - The step object containing the scenario text and id.
 * @param {string} props.phase - The name of the current simulation phase.
 * @param {string} [props.didYouKnow] - Optional educational hint.
 * @param {string} [props.pitfall] - Optional warning about common mistakes.
 * @param {React.ReactNode} props.children - The options buttons to render.
 * @param {string} [props.titleOverride] - Optional custom title for the card.
 * @param {string} [props.coachBanner] - Optional coach feedback to display (agentic mode).
 */
const ScenarioCard = memo(function ScenarioCard({
  step,
  phase,
  didYouKnow,
  pitfall,
  children,
  titleOverride,
  coachBanner,
}) {
  return (
    <div className="scenario-card" id="scenario-card">
      <div className="scenario-header">
        <div className="scenario-phase-badge">
          <span className="material-symbols-outlined">flag</span>
          <span>{phase}</span>
        </div>
        <h2 className="scenario-title">{titleOverride || `Step ${step.id}`}</h2>
      </div>
      {coachBanner && (
        <div className="scenario-coach-banner" role="note">
          <span className="material-symbols-outlined">smart_toy</span>
          <div>
            <strong>Adaptive coach note</strong>
            <p>{coachBanner}</p>
          </div>
        </div>
      )}
      <p className="scenario-text">{step.scenario}</p>

      <div className="scenario-options">{children}</div>

      <div className="scenario-info-cards">
        {didYouKnow && (
          <div className="info-card info-card-tip">
            <div className="info-card-header">
              <span className="material-symbols-outlined">lightbulb</span>
              <span>Did you know?</span>
            </div>
            <p>{didYouKnow}</p>
          </div>
        )}
        {pitfall && (
          <div className="info-card info-card-warning">
            <div className="info-card-header">
              <span className="material-symbols-outlined">warning</span>
              <span>Common Pitfall</span>
            </div>
            <p>{pitfall}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ScenarioCard;
