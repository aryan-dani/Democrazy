import { Link } from "react-router-dom";
import { timelineStages } from "../data/simulationData";
import TimelineNode from "../components/TimelineNode";
import "./TimelinePage.css";

export default function TimelinePage() {
  return (
    <div className="timeline-page-shell">
      <header className="timeline-hero">
        <span className="timeline-pill">Explorer</span>
        <h1>Election timeline</h1>
        <p className="timeline-lede">
          Tap each stage for a beginner-friendly rundown plus a micro-scenario — no cramming paragraphs.
        </p>
        <div className="timeline-hero-links">
          <Link className="btn-primary-hero" to="/simulation?mode=classic">
            Jump into simulations
          </Link>
          <Link className="btn-secondary-hero" to="/dashboard">
            Progress hub
          </Link>
        </div>
      </header>

      <div className="timeline-stack" role="feed" aria-label="Election stages timeline">
        {timelineStages.map((stage, idx) => (
          <TimelineNode
            key={stage.id}
            icon={stage.icon}
            stageTitle={stage.title}
            description={stage.description}
            example={stage.quickExample}
            initiallyOpen={idx === 0}
          />
        ))}
      </div>

      <p className="timeline-footnote">
        Status labels in curated data illustrate story pacing — not personally tracked completion unless you tie them later to
        dashboards.
      </p>
    </div>
  );
}
