import "./ProgressBar.css";

export default function ProgressBar({ current, total, label }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-bar-container" id="progress-bar">
      <div className="progress-bar-header">
        <span className="progress-label">{label || "Progress"}</span>
        <span className="progress-count">
          {current} / {total}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="progress-percent">{percent}%</span>
    </div>
  );
}
