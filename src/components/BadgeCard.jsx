import { BADGE_CATALOG } from "../utils/badges";
import "./BadgeCard.css";

/** @param {{ badgeId:string; unlockedAt?:string|null }} props */
export default function BadgeCard({ badgeId, unlockedAt }) {
  const meta = BADGE_CATALOG[badgeId];
  if (!meta) return null;
  return (
    <article className="badge-card dc-animate-pop" aria-label={meta.title}>
      <span className="badge-card-icon material-symbols-outlined" aria-hidden>
        military_tech
      </span>
      <div className="badge-card-body">
        <h4>{meta.title}</h4>
        <p>{meta.description}</p>
        {unlockedAt ? (
          <time className="badge-card-time" dateTime={unlockedAt}>
            Unlocked {new Date(unlockedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </time>
        ) : (
          <span className="badge-card-time muted">Tracked automatically</span>
        )}
      </div>
    </article>
  );
}
