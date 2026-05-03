import { useNavigate } from "react-router-dom";
import { getLandingHeroStats } from "../data/simulationData";
import "./LandingPage.css";

const heroStats = getLandingHeroStats();

const features = [
  {
    icon: "play_circle",
    title: "Interactive Simulations",
    desc: "Walk through real election scenarios and make decisions that shape outcomes.",
  },
  {
    icon: "timeline",
    title: "Election Timeline",
    desc: "Track every stage of the democratic process from announcement to results.",
  },
  {
    icon: "quiz",
    title: "Knowledge Quizzes",
    desc: "Sharpen civic facts — optional Gemini tutor digs into wrong answers against the scripted explanation.",
  },
  {
    icon: "leaderboard",
    title: "Progress Dashboard",
    desc: "Track your learning journey and see how far you've come.",
  },
  {
    icon: "smart_toy",
    title: "Gemini Adaptive Mode",
    desc: "Let Google's Gemini remix consequences through a guarded, civic-education JSON contract.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" id="landing-page">
      <section className="hero-section">
        <div className="hero-badge">
          <span className="material-symbols-outlined">how_to_vote</span>
          <span>Interactive Election Simulator</span>
        </div>
        <h1 className="hero-title">
          You just turned 18.
          <br />
          <span className="hero-highlight">Ready to vote?</span>
        </h1>
        <p className="hero-subtitle">
          Navigate the democratic process with confidence. Take simulations, learn the timeline, and
          track your progress to become an informed voter.
        </p>
        <div className="hero-actions">
          <button
            className="btn-secondary-hero"
            onClick={() => navigate("/timeline")}
            id="btn-explore-timeline"
            type="button"
          >
            <span>Election timeline</span>
            <span className="material-symbols-outlined">timeline</span>
          </button>
          <button
            className="btn-secondary-hero"
            onClick={() => navigate("/simulation?mode=agent&pack=election-prep")}
            id="btn-start-agent"
            type="button"
          >
            <span>Try Adaptive AI</span>
            <span className="material-symbols-outlined">smart_toy</span>
          </button>
          <button
            className="btn-primary-hero"
            onClick={() => navigate("/simulation?mode=classic&pack=election-prep")}
            id="btn-start-simulation"
            type="button"
          >
            <span>Classic Simulation</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            className="btn-secondary-hero"
            onClick={() => navigate("/simulation?mode=classic&pack=constitutional-stress")}
            id="btn-start-constitutional-pack"
            type="button"
          >
            <span>Constitutional stress pack</span>
            <span className="material-symbols-outlined">balance</span>
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">{heroStats.scenarios}</span>
            <span className="stat-label">Scenarios</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{heroStats.quizzes}</span>
            <span className="stat-label">Quiz Questions</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{heroStats.timelineStages}</span>
            <span className="stat-label">Timeline Stages</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{heroStats.packs}</span>
            <span className="stat-label">Packs</span>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="features-heading">Everything You Need</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon-wrap">
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
