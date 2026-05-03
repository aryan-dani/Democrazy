import { memo } from "react";
import "./LoadingState.css";

const LoadingState = memo(function LoadingState({ label = "Loading..." }) {
  return (
    <div className="dc-loading-state" role="status" aria-live="polite">
      <span className="dc-loading-dot" aria-hidden />
      <span>{label}</span>
    </div>
  );
});

export default LoadingState;
