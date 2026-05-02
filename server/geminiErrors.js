/**
 * Map Google Generative AI client / fetch failures to stable codes + humane copy for the SPA.
 *
 * @param {unknown} err
 * @returns {{ statusCode: number; code: string; error: string; retryAfterSec?: number }}
 */
export function classifyGeminiFailure(err) {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  /** @type {number | undefined} */
  let retryAfterSec;

  const retryMatch = raw.match(/retry[_-]?after[:\s]+(\d+)/i);
  if (retryMatch) {
    retryAfterSec = Math.min(300, Math.max(5, parseInt(retryMatch[1], 10)));
  }

  const is429 =
    /\b429\b/.test(raw) ||
    msg.includes("too many requests") ||
    msg.includes("resource exhausted") ||
    msg.includes("rate limit");

  if (is429) {
    return {
      statusCode: 429,
      code: "RATE_LIMIT",
      error:
        "Gemini hit a usage limit or burst cap for your API key. Wait a minute and try again, or switch to offline practice.",
      retryAfterSec: retryAfterSec ?? 60,
    };
  }

  if (/\b503\b/i.test(raw) || msg.includes("unavailable") || msg.includes("overloaded")) {
    return {
      statusCode: 503,
      code: "MODEL_UNAVAILABLE",
      error: "Gemini reports it is overloaded right now. Try again shortly or continue without the AI.",
      retryAfterSec: retryAfterSec ?? 30,
    };
  }

  if (/\b401\b/.test(raw) || /\b403\b/.test(raw) || msg.includes("api key not valid")) {
    return {
      statusCode: 403,
      code: "AUTH",
      error: "The API key was rejected. Check GEMINI_API_KEY in your .env (or Vercel env) and restart the dev server.",
    };
  }

  if (msg.includes("not found") || msg.includes("is not found") || /\b404\b/.test(raw)) {
    return {
      statusCode: 400,
      code: "MODEL_NOT_FOUND",
      error:
        "That model name is not available for this key. Try setting GEMINI_MODEL to a model your project can access (e.g. gemini-2.0-flash or gemini-1.5-flash).",
    };
  }

  if (msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) {
    return {
      statusCode: 502,
      code: "NETWORK",
      error: "Could not reach Google. Check your connection, VPN, or firewall.",
      retryAfterSec: 10,
    };
  }

  return {
    statusCode: 502,
    code: "UNKNOWN",
    error: "Something went wrong talking to Gemini. You can retry, use offline practice, or scripted mode.",
    retryAfterSec: 8,
  };
}
