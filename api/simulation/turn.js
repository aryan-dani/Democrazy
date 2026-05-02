import { runAgenticTurn } from "../../server/agenticTurn.js";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  setCors(res);
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

  const body = await parseBody(req);
  if (!body || typeof body !== "object") {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Expected JSON body" }));
    return;
  }

  const result = await runAgenticTurn(body);
  const statusCode = result.ok ? 200 : result.statusCode ?? 500;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  if (result.ok) {
    res.end(JSON.stringify({ ok: true, ...result.data }));
  } else {
    const body = { ok: false, error: result.error };
    if (result.code) body.code = result.code;
    if (typeof result.retryAfterSec === "number") body.retryAfterSec = result.retryAfterSec;
    res.end(JSON.stringify(body));
  }
}
