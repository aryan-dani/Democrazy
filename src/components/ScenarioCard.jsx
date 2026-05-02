import "./ScenarioCard.css";

export default function ScenarioCard({
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
}
