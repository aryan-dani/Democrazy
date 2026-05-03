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
 * @param {{ messages: { role: string; content: string }[]; mode?: "simple" | "deeper" }} payload
 */
export async function postTutorMessage(payload) {
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
