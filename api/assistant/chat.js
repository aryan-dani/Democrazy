import { parseJsonBodyOnce } from "../../server/parseJsonBodyOnce.js";
import { runTutorChat } from "../../server/tutorChat.js";
import { setDemocrazyCorsHeaders } from "../../server/httpCors.js";

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  setDemocrazyCorsHeaders(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
    return;
  }

  const body = await parseJsonBodyOnce(req);
  if (!body || typeof body !== "object") {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Expected JSON body" }));
    return;
  }

  const result = await runTutorChat(body);
  const statusCode = result.ok ? 200 : (result.statusCode ?? 500);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  if (result.ok) {
    res.end(
      JSON.stringify({
        ok: true,
        reply: result.reply,
        suggestedChips: result.suggestedChips ?? [],
      }),
    );
  } else {
    const out = { ok: false, error: result.error };
    if (result.code) out.code = result.code;
    if (typeof result.retryAfterSec === "number") out.retryAfterSec = result.retryAfterSec;
    res.end(JSON.stringify(out));
  }
}
