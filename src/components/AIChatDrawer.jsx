import { useCallback, useEffect, useRef, useState } from "react";
import { postTutorMessage, TutorApiError } from "../services/tutorApi";
import LoadingState from "./LoadingState";
import "./AIChatDrawer.css";

const CHIP_SEED = ["What is NOTA?", "What is a polling booth?", "What happens after voting?", "Missing from voter list?"];

/** @typedef {{ role: string; content: string }} ChatMsg */

export default function AIChatDrawer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(/** @type {"simple"|"deeper"} */ ("simple"));
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState(/** @type {ChatMsg[]} */ ([]));
  const [loading, setLoading] = useState(false);
  const [errorLine, setErrorLine] = useState(null);
  const [chips, setChips] = useState(CHIP_SEED);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, loading, open]);

  const sendPrompt = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const nextMsgs = [...msgs, { role: "user", content: trimmed }];
      setMsgs(nextMsgs);
      setDraft("");
      setErrorLine(null);
      setLoading(true);
      try {
        const res = await postTutorMessage({ messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })), mode });
        const bot = typeof res.reply === "string" ? res.reply.trim() : "";
        setMsgs((prev) => [...prev, { role: "model", content: bot || "Hmm, I drew a blank. Try asking in other words?" }]);
        if (Array.isArray(res.suggestedChips) && res.suggestedChips.length > 0) {
          setChips(res.suggestedChips.slice(0, 4));
        }
      } catch (err) {
        const msg =
          err instanceof TutorApiError ? err.message : err instanceof Error ? err.message : "Tutor is briefly unavailable.";
        setErrorLine(msg);
      } finally {
        setLoading(false);
      }
    },
    [msgs, loading, mode],
  );

  return (
    <>
      <button type="button" className="tutor-fab" onClick={() => setOpen(true)} aria-label="Open civic tutor chat">
        <span className="material-symbols-outlined">chat</span>
        <span>Civic tutor</span>
      </button>

      {open ? (
        <div className="tutor-backdrop" role="presentation">
          <div className="tutor-drawer" role="dialog" aria-modal="true" aria-label="Civic tutor powered by Gemini">
            <header className="tutor-head">
              <div>
                <strong>Gemini civic tutor</strong>
                <p>Short civic answers • non-partisan</p>
              </div>
              <button type="button" className="tutor-close" onClick={() => setOpen(false)} aria-label="Close tutor">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="tutor-row">
              <span className="tutor-mini-label">Mode</span>
              <div className="tutor-mode-switch" role="group" aria-label="Answer depth mode">
                <button
                  type="button"
                  className={`tutor-chip-btn ${mode === "simple" ? "active" : ""}`}
                  onClick={() => setMode("simple")}
                >
                  Explain simply
                </button>
                <button
                  type="button"
                  className={`tutor-chip-btn ${mode === "deeper" ? "active" : ""}`}
                  onClick={() => setMode("deeper")}
                >
                  Go deeper
                </button>
              </div>
            </div>

            <div className="tutor-scroller">
              {msgs.length === 0 ? (
                <p className="tutor-intro">
                  Ask quick questions — NOTA lines, provisional ballots, what happens inside a polling place, staying calm if you are
                  not on the list.
                </p>
              ) : null}
              {msgs.map((m, idx) => (
                <div key={`${idx}-${m.role}-${m.content.slice(0, 12)}`} className={`bubble ${m.role}`}>
                  {m.content}
                </div>
              ))}
              {loading ? (
                <div className="bubble model">
                  <LoadingState label="Fetching answer..." />
                </div>
              ) : null}
              {errorLine ? <div className="bubble error">{errorLine}</div> : null}
              <div ref={endRef} />
            </div>

            <div className="quick-chips">
              {chips.map((c) => (
                <button key={c} type="button" className="tutor-chip" onClick={() => sendPrompt(c)} disabled={loading}>
                  {c}
                </button>
              ))}
            </div>

            <form
              className="tutor-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendPrompt(draft);
              }}
            >
              <textarea
                rows={2}
                placeholder="Ask a civic question..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Your civic question"
              />
              <button type="submit" className="btn-primary-hero" disabled={loading || !draft.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
