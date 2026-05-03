function apiOrigin() {
  const raw = import.meta.env.VITE_API_ORIGIN;
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}

export class TutorApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number; code?: string; retryAfterSec?: number }} [detail]
   */
  constructor(message, detail = {}) {
    super(message);
    this.name = "TutorApiError";
    this.status = detail.status;
    this.code = detail.code;
    this.retryAfterSec = detail.retryAfterSec;
  }
}

/**
 * POST /api/assistant/chat — tutoring chat JSON or quiz-explain payloads.
 *
 * @param {Record<string, unknown>} payload
 */
async function postAssistantChat(payload) {
  const res = await fetch(`${apiOrigin()}/api/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof json?.error === "string" ? json.error : `Tutor request failed (${res.status})`;
    throw new TutorApiError(message, {
      status: res.status,
      code: typeof json?.code === "string" ? json.code : undefined,
      retryAfterSec: typeof json?.retryAfterSec === "number" ? json.retryAfterSec : undefined,
    });
  }

  if (!json || json.ok !== true) {
    throw new TutorApiError("Unexpected tutor response", { status: res.status });
  }

  return {
    reply: typeof json.reply === "string" ? json.reply : "",
    suggestedChips: Array.isArray(json.suggestedChips) ? json.suggestedChips : [],
  };
}

/**
 * @param {{ messages: { role: string; content: string }[]; mode?: "simple" | "deeper" }} payload
 */
export async function postTutorMessage(payload) {
  return postAssistantChat(payload);
}

/**
 * @param {{ question: string; explanation: string; options: { text: string; correct?: boolean }[]; chosenIndex: number }} payload
 */
export async function postQuizExplain(payload) {
  return postAssistantChat({
    mode: "quiz_explain",
    question: payload.question,
    explanation: payload.explanation,
    options: payload.options.map((o) => ({
      text: o.text,
      correct: Boolean(o.correct),
    })),
    chosenIndex: payload.chosenIndex,
  });
}
