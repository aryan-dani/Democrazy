import "./EmptyState.css";

export default function EmptyState({ icon = "inventory_2", title, hint, children }) {
  return (
    <div className="dc-empty-state" role="status">
      <span className="material-symbols-outlined dc-empty-icon">{icon}</span>
      <h4>{title}</h4>
      {hint ? <p>{hint}</p> : null}
      {children}
    </div>
  );
}
