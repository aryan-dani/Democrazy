import { useRef } from "react";
import { toBlob, toPng } from "html-to-image";
import "./ShareSummaryCard.css";

/**
 * Styled card for OG-like sharing; downloadable PNG via html-to-image.
 * @param {{ title:string; headline:string; scoreLabel:string; sublabel?:string; badges?:string[] }} props
 */
export default function ShareSummaryCard({ title, headline, scoreLabel, sublabel, badges = [] }) {
  const ref = useRef(null);

  const download = async () => {
    const el = ref.current;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "democrazy-summary.png";
      a.click();
    } catch {
      /* noop */
    }
  };

  const nativeShare = async () => {
    const el = ref.current;
    if (!el || !navigator.share || !navigator.canShare) return;
    try {
      let blob = await toBlob(el, { pixelRatio: 2 });
      if (!blob) {
        const png = await toPng(el, { pixelRatio: 2 });
        const res = await fetch(png);
        blob = await res.blob();
      }
      if (!blob) return;
      const file = new File([blob], "democrazy-summary.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: headline, text: sublabel ?? headline });
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div className="share-summary-wrap">
      <div ref={ref} className="share-summary-card" aria-hidden>
        <div className="share-brand">
          <span className="material-symbols-outlined">how_to_vote</span>
          <span>{title}</span>
        </div>
        <p className="share-headline">{headline}</p>
        <div className="share-score">{scoreLabel}</div>
        {sublabel ? <p className="share-sub">{sublabel}</p> : null}
        {badges.length > 0 ? (
          <ul className="share-badges">
            {badges.slice(0, 4).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : (
          <p className="share-sub">Earn badges via simulations & quizzes.</p>
        )}
        <span className="share-footnote">Practice voting safely — verify with official resources.</span>
      </div>
      <div className="share-actions">
        <button type="button" className="btn-secondary-hero" onClick={download}>
          Download PNG
        </button>
        {typeof navigator !== "undefined" && navigator.share ? (
          <button type="button" className="btn-primary-hero" onClick={nativeShare}>
            Share
          </button>
        ) : null}
      </div>
    </div>
  );
}
