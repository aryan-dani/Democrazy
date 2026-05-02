import "./LoadingState.css";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="dc-loading-state" role="status" aria-live="polite">
      <span className="dc-loading-dot" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
