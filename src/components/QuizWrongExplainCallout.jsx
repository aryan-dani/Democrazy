import { useState, useCallback } from "react";
import { postQuizExplain } from "../services/tutorApi";
import "./QuizWrongExplainCallout.css";

/**
 * Extension for quiz wrong answers — calls `/api/assistant/chat` with `mode: quiz_explain`.
 *
 * @param {{ question: string; explanation: string; options: { text: string; correct?: boolean }[]; chosenIndex: number }} props
 */
export default function QuizWrongExplainCallout({ question, explanation, options, chosenIndex }) {
  const [status, setStatus] = useState("idle");
  const [reply, setReply] = useState("");
  const [chips, setChips] = useState([]);
  const [err, setErr] = useState("");

  const onExplain = useCallback(async () => {
    setStatus("loading");
    setErr("");
    setReply("");
    setChips([]);
    try {
      const out = await postQuizExplain({ question, explanation, options, chosenIndex });
      setReply(out.reply);
      setChips(out.suggestedChips);
      setStatus("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Tutor unavailable.");
      setStatus("error");
    }
  }, [question, explanation, options, chosenIndex]);

  return (
    <div className="quiz-wrong-explain" role="region" aria-label="Extended tutor explanation">
      <button
        type="button"
        className="btn-quiz-ai-explain"
        onClick={onExplain}
        disabled={status === "loading"}
      >
        <span className="material-symbols-outlined">
          {status === "loading" ? "hourglass_empty" : "smart_toy"}
        </span>
        <span>
          {status === "loading"
            ? "Fetching tutor explanation…"
            : "Explain deeper with Gemini tutor"}
        </span>
      </button>

      {status === "error" ? (
        <p className="quiz-explain-error" role="alert">
          {err} Use “Learn why” above or retry after checking that the tutor API key is configured.
        </p>
      ) : null}

      {status === "done" && reply ? (
        <div className="quiz-explain-body">
          <h4 className="quiz-explain-heading">Tutor walkthrough</h4>
          <p className="quiz-explain-reply">{reply}</p>
          {chips.length > 0 ? (
            <p className="quiz-explain-chips">
              <strong>Ideas to explore:</strong> {chips.slice(0, 3).join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
