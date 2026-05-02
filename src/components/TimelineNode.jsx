import { useId, useState } from "react";
import "./TimelineNode.css";

/**
 * Clickable expandable election stage chip.
 */
export default function TimelineNode({
  stageTitle,
  description,
  example,
  icon,
  initiallyOpen = false,
}) {
  const panelId = useId();
  const [open, setOpen] = useState(initiallyOpen);

  const toggle = () => setOpen((o) => !o);

  return (
    <div className={`timeline-node ${open ? "timeline-node-open" : ""}`}>
      <button
        type="button"
        className="timeline-node-shell"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="timeline-node-dot" aria-hidden>
          <span className="material-symbols-outlined">{icon}</span>
        </span>
        <div className="timeline-node-text">
          <span className="timeline-node-phase">{stageTitle}</span>
          <span className="timeline-node-chevron material-symbols-outlined" aria-hidden>
            expand_more
          </span>
        </div>
      </button>

      <div id={panelId} className="timeline-node-panel" hidden={!open}>
        <p className="timeline-node-desc">{description}</p>
        {example ? (
          <div className="timeline-node-example">
            <span className="timeline-example-label">Quick scenario</span>
            <p>{example}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
