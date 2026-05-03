import { useCallback, useEffect, useRef, useState } from "react";
import { postTutorMessage, TutorApiError } from "../services/tutorApi";
import LoadingState from "./LoadingState";
import "./AIChatDrawer.css";

const CHIP_SEED = [
  "What is NOTA?",
  "What is a polling booth?",
  "What happens after voting?",
  "Missing from voter list?",
];

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** @typedef {{ role: string; content: string }} ChatMsg */

function getFocusable(dialog) {
  if (!dialog || !(dialog instanceof HTMLElement)) return [];
  return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (el) => el instanceof HTMLElement && typeof el.focus === "function",
  );
}

export default function AIChatDrawer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(/** @type {"simple"|"deeper"} */ ("simple"));
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState(/** @type {ChatMsg[]} */ ([]));
  const [loading, setLoading] = useState(false);
  const [errorLine, setErrorLine] = useState(null);
  const [chips, setChips] = useState(CHIP_SEED);

  const endRef = useRef(null);
  const drawerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const fabRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  /** @type {React.MutableRefObject<HTMLElement | null>} */
  const focusRestoreRef = useRef(null);

  const closeDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [msgs.length, loading, open]);

  useEffect(() => {
    if (!open) return undefined;

    const drawer = drawerRef.current;
    const fab = fabRef.current;
    if (!drawer) return undefined;

    focusRestoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    /** @returns {HTMLElement | undefined} */
    const firstFocusable = () => {
      const xs = getFocusable(drawer);
      return xs[0];
    };

    const tid = window.setTimeout(() => {
      const target = firstFocusable();
      target?.focus();
    }, 0);

    /** @type {(e: KeyboardEvent) => void} */
    const onKeyDoc = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    };

    /** @type {(e: KeyboardEvent) => void} */
    const trapTab = (e) => {
      if (e.key !== "Tab" || !drawer) return;
      const list = getFocusable(drawer);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];

      const active = document.activeElement;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDoc);
    drawer.addEventListener("keydown", trapTab);

    return () => {
      window.clearTimeout(tid);
      document.removeEventListener("keydown", onKeyDoc);
      drawer.removeEventListener("keydown", trapTab);
      const prev = focusRestoreRef.current;
      if (prev && typeof prev.focus === "function" && document.body.contains(prev)) {
        prev.focus();
      } else {
        fab?.focus?.({ preventScroll: true });
      }
      focusRestoreRef.current = null;
    };
  }, [open, closeDrawer]);

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
        const res = await postTutorMessage({
          messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })),
          mode,
        });
        const bot = typeof res.reply === "string" ? res.reply.trim() : "";
        setMsgs((prev) => [
          ...prev,
          { role: "model", content: bot || "Hmm, I drew a blank. Try asking in other words?" },
        ]);
        if (Array.isArray(res.suggestedChips) && res.suggestedChips.length > 0) {
          setChips(res.suggestedChips.slice(0, 4));
        }
      } catch (err) {
        const msg =
          err instanceof TutorApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Tutor is briefly unavailable.";
        setErrorLine(msg);
      } finally {
        setLoading(false);
      }
    },
    [msgs, loading, mode],
  );

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="tutor-fab"
        onClick={() => setOpen(true)}
        aria-label="Open civic tutor chat"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="tutor-dialog"
      >
        <span className="material-symbols-outlined" aria-hidden>
          chat
        </span>
        <span>Civic tutor</span>
      </button>

      {open ? (
        <div
          className="tutor-backdrop"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && closeDrawer()}
        >
          <div
            id="tutor-dialog"
            ref={drawerRef}
            className="tutor-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutor-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="tutor-head">
              <div>
                <strong id="tutor-dialog-title">Gemini civic tutor</strong>
                <p>Short civic answers • non-partisan</p>
              </div>
              <button
                type="button"
                className="tutor-close"
                onClick={closeDrawer}
                aria-label="Close tutor"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
            </header>

            <div className="tutor-row">
              <span className="tutor-mini-label">Mode</span>
              <div className="tutor-mode-switch" role="group" aria-label="Answer depth mode">
                <button
                  type="button"
                  className={`tutor-chip-btn ${mode === "simple" ? "active" : ""}`}
                  onClick={() => setMode("simple")}
                  aria-pressed={mode === "simple"}
                >
                  Explain simply
                </button>
                <button
                  type="button"
                  className={`tutor-chip-btn ${mode === "deeper" ? "active" : ""}`}
                  onClick={() => setMode("deeper")}
                  aria-pressed={mode === "deeper"}
                >
                  Go deeper
                </button>
              </div>
            </div>

            <div className="tutor-scroller">
              {msgs.length === 0 ? (
                <>
                  <p className="tutor-intro">
                    Ask quick questions — NOTA lines, provisional ballots, what happens inside a
                    polling place, staying calm if you are not on the list.
                  </p>
                  <div className="quick-chips">
                    {chips.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="tutor-chip"
                        onClick={() => sendPrompt(c)}
                        disabled={loading}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {msgs.map((m, idx) => (
                <div
                  key={`${idx}-${m.role}-${m.content.slice(0, 12)}`}
                  className={`bubble ${m.role}`}
                >
                  {m.content}
                </div>
              ))}
              {loading ? (
                <div className="bubble model">
                  <LoadingState label="Fetching answer..." />
                </div>
              ) : null}
              {errorLine ? (
                <div className="bubble error" role="alert" aria-live="assertive">
                  {errorLine}
                </div>
              ) : null}
              <div ref={endRef} />
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
              <button
                type="submit"
                className="btn-primary-hero"
                disabled={loading || !draft.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
