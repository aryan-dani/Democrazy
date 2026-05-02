function apiOrigin() {
  const raw = import.meta.env.VITE_API_ORIGIN;
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}

export class SimulationApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number; code?: string; retryAfterSec?: number }} [detail]
   */
  constructor(message, detail = {}) {
    super(message);
    this.name = "SimulationApiError";
    this.status = detail.status;
    this.code = detail.code;
    this.retryAfterSec = detail.retryAfterSec;
  }
}

/** Default client-side backoff when server does not send retryAfterSec */
const FALLBACK_RETRY_SEC = {
  RATE_LIMIT: 60,
  MODEL_UNAVAILABLE: 30,
  NO_API_KEY: 0,
};

/**
 * Calls the secure Gemini bridge (Vercel `/api/simulation/turn` locally via dev middleware).
 * @param {Record<string, unknown>} payload
 */
export async function postSimulationTurn(payload) {
  const res = await fetch(`${apiOrigin()}/api/simulation/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const code = typeof json?.code === "string" ? json.code : undefined;
    let retryAfterSec =
      typeof json?.retryAfterSec === "number" && Number.isFinite(json.retryAfterSec)
        ? Math.min(300, Math.max(5, Math.round(json.retryAfterSec)))
        : undefined;

    if (retryAfterSec == null && res.status === 429) {
      retryAfterSec = FALLBACK_RETRY_SEC.RATE_LIMIT;
    }
    if (retryAfterSec == null && res.status === 503) {
      retryAfterSec =
        code === "NO_API_KEY" ? FALLBACK_RETRY_SEC.NO_API_KEY : FALLBACK_RETRY_SEC.MODEL_UNAVAILABLE;
    }

    const message =
      typeof json?.error === "string" ? json.error : `Request failed (${res.status})`;

    throw new SimulationApiError(message, {
      status: res.status,
      code,
      retryAfterSec: retryAfterSec === 0 ? undefined : retryAfterSec,
    });
  }

  if (json && json.ok === false) {
    const message = typeof json.error === "string" ? json.error : "Model declined";
    throw new SimulationApiError(message, {
      status: res.status,
      code: typeof json.code === "string" ? json.code : undefined,
    });
  }

  return json ?? { ok: false, error: "Empty response body" };
}
