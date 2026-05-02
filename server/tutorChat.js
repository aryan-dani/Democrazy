import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyGeminiFailure } from "./geminiErrors.js";

const QUICK_CHIPS_FALLBACK = ["What is NOTA?", "What is a polling booth?", "What if I'm not on the voter list?"];

/** @typedef {{ role:'user'|'model'; parts:{text:string}[] }} GeminiContentPart */

export function validateTutorBody(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Expected JSON body" };
  }
  const mode = body.mode === "deeper" ? "deeper" : "simple";
  const msgs = Array.isArray(body.messages) ? body.messages : [];
  if (msgs.length < 1) {
    return { ok: false, error: "`messages` must be a non-empty array of {role, content}" };
  }
  const last = msgs[msgs.length - 1];
  if (typeof last?.content !== "string" || !last.content.trim()) {
    return { ok: false, error: "Last message needs non-empty content" };
  }
  return { ok: true, mode, messages: msgs };
}

/**
 * @param {unknown} body
 * @returns {Promise<{ ok: true, reply: string, suggestedChips: string[] } | { ok: false, statusCode: number; error: string; code?: string; retryAfterSec?: number }>}
 */
export async function runTutorChat(body) {
  const v = validateTutorBody(body);
  if (!v.ok) {
    return { ok: false, statusCode: 400, code: "BAD_REQUEST", error: v.error ?? "Bad request" };
  }
  const { mode, messages } = v;

  const apiKey =
    typeof process.env.GEMINI_API_KEY === "string" ? process.env.GEMINI_API_KEY.trim() : "";
  if (!apiKey) {
    return {
      ok: false,
      statusCode: 503,
      code: "NO_API_KEY",
      error: "GEMINI_API_KEY is not configured on the server.",
    };
  }

  const depth =
    mode === "deeper"
      ? "Go a bit deeper: add one extra concrete scenario or clarification, still concise."
      : "Answer like the user knows almost nothing political. Max ~80 words.";
  const systemInstruction = `
You are a friendly, neutral civic educator for teenagers and young adults practicing elections literacy.
Respond to the user's LAST message only. Stay non-partisan. No voting recommendations for parties or candidates.
${depth}
Forbidden: speculate about undocumented personal voter status; instruct lawbreaking; partisan attacks.
Suggest 2–3 short follow-up questions in JSON under key "followUps" inside the SAME JSON response as plain strings.
Always output VALID JSON ONLY: {"reply": string, "followUps": string[]}
Never use markdown fences.
`.trim();

  const modelName = process.env.GEMINI_TUTOR_MODEL || process.env.GEMINI_MODEL || "gemini-2.0-flash";

  /** @typedef {{role:string; content:string}} Incoming */
  /** @type {Incoming[]} */
  const incoming = messages;
  const recent = incoming.slice(-10);
  const transcript = recent
    .map((m) => {
      const label = m.role === "model" ? "Assistant" : "User";
      return `${label}: ${typeof m.content === "string" ? m.content.trim() : ""}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const contents = [{ role: "user", parts: [{ text: transcript }] }];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: mode === "deeper" ? 0.55 : 0.45,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  });

  try {
    const result = await model.generateContent({
      contents,
    });
    const text =
      typeof result.response?.text === "function"
        ? result.response.text()
        : result.response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
    if (!text.trim()) {
      return {
        ok: false,
        statusCode: 502,
        code: "EMPTY_RESPONSE",
        error: "Tutor returned an empty reply.",
        retryAfterSec: 15,
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        ok: false,
        statusCode: 502,
        code: "INVALID_JSON",
        error: "Tutor reply was not valid JSON.",
      };
    }
    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) {
      return { ok: false, statusCode: 502, code: "BAD_REPLY", error: "Tutor omitted reply text." };
    }
    const followUps = Array.isArray(parsed.followUps)
      ? parsed.followUps
          .filter((x) => typeof x === "string" && x.trim())
          .map((x) => x.trim())
          .slice(0, 4)
      : [];
    const suggestedChips = followUps.length ? followUps : QUICK_CHIPS_FALLBACK;

    return { ok: true, reply, suggestedChips };
  } catch (e) {
    const c = classifyGeminiFailure(e);
    const out = {
      ok: false,
      statusCode: c.statusCode,
      code: c.code,
      error: c.error,
    };
    if (typeof c.retryAfterSec === "number") {
      out.retryAfterSec = c.retryAfterSec;
    }
    return out;
  }
}
