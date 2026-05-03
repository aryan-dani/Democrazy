/**
 * Consume the HTTP request body stream and parse JSON once.
 *
 * Empty body resolves to `{}`. Malformed JSON resolves to `null`.
 *
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
export async function parseJsonBodyOnce(req) {
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
