import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { classifyGeminiFailure } from "./geminiErrors.js";
import { PACK_BRIEFS } from "./packBriefs.js";

export const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    narrative: { type: SchemaType.STRING },
    phase: { type: SchemaType.STRING },
    options: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          label: { type: SchemaType.STRING },
        },
        required: ["id", "label"],
      },
    },
    coachNote: { type: SchemaType.STRING },
    complete: { type: SchemaType.BOOLEAN },
    worldState: {
      type: SchemaType.OBJECT,
      properties: {
        trustScore: { type: SchemaType.INTEGER },
        rumorExposure: { type: SchemaType.INTEGER },
        deadlinesMet: { type: SchemaType.INTEGER },
        turnIndex: { type: SchemaType.INTEGER },
      },
      required: ["trustScore", "rumorExposure", "deadlinesMet", "turnIndex"],
    },
  },
  required: ["narrative", "phase", "options", "coachNote", "complete", "worldState"],
};

const DEFAULT_WORLD = {
  trustScore: 60,
  rumorExposure: 20,
  deadlinesMet: 0,
  turnIndex: 0,
};

export function coerceWorldState(ws) {
  if (!ws || typeof ws !== "object") return { ...DEFAULT_WORLD };
  return {
    trustScore:
      typeof ws.trustScore === "number"
        ? Math.max(0, Math.min(100, Math.round(ws.trustScore)))
        : DEFAULT_WORLD.trustScore,
    rumorExposure:
      typeof ws.rumorExposure === "number"
        ? Math.max(0, Math.min(100, Math.round(ws.rumorExposure)))
        : DEFAULT_WORLD.rumorExposure,
    deadlinesMet:
      typeof ws.deadlinesMet === "number"
        ? Math.max(0, Math.round(ws.deadlinesMet))
        : DEFAULT_WORLD.deadlinesMet,
    turnIndex:
      typeof ws.turnIndex === "number"
        ? Math.max(0, Math.round(ws.turnIndex))
        : DEFAULT_WORLD.turnIndex,
  };
}

export function validateTurnPayload(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid JSON body" };
  const { action, packId, worldState, lastChoice } = body;
  const validPack = typeof packId === "string" && PACK_BRIEFS[packId];
  if (!validPack) {
    const ids = Object.keys(PACK_BRIEFS).join(", ");
    return { ok: false, error: `Unknown packId. Use one of: ${ids}` };
  }
  if (action !== "start" && action !== "advance") {
    return { ok: false, error: "action must be 'start' or 'advance'" };
  }
  const ws = coerceWorldState(worldState);
  const brief = PACK_BRIEFS[packId];
  if (ws.turnIndex >= brief.maxTurns) {
    return { ok: false, error: "Maximum turns exceeded for this pack" };
  }
  if (
    action === "advance" &&
    lastChoice !== null &&
    lastChoice !== undefined &&
    typeof lastChoice !== "object"
  ) {
    return { ok: false, error: "lastChoice must be an object with optionId" };
  }
  return { ok: true, packId, action, worldState: ws, lastChoice: lastChoice || null };
}

function parseStructuredResponse(text) {
  const parsed = JSON.parse(text);
  if (!parsed.worldState || typeof parsed.worldState !== "object") {
    throw new Error("Missing worldState");
  }
  parsed.worldState = coerceWorldState(parsed.worldState);
  if (!Array.isArray(parsed.options) || parsed.options.length < 2) {
    throw new Error("Expected at least 2 options");
  }
  for (const opt of parsed.options) {
    if (!opt?.id || !opt?.label) throw new Error("Each option requires id and label");
  }
  return parsed;
}

export async function runAgenticTurn(body) {
  const check = validateTurnPayload(body);
  if (!check.ok) {
    return { ok: false, statusCode: 400, error: check.error };
  }
  const { packId, action, worldState, lastChoice } = check;
  const apiKey =
    typeof process.env.GEMINI_API_KEY === "string" ? process.env.GEMINI_API_KEY.trim() : "";
  if (!apiKey) {
    return {
      ok: false,
      statusCode: 503,
      code: "NO_API_KEY",
      error:
        "GEMINI_API_KEY is not configured on the server. Add it to .env (dev) or your host env vars.",
    };
  }

  const brief = PACK_BRIEFS[packId];
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const systemInstruction = `
You simulate an educational civic scenario for teenagers and young adults. Output MUST be ONLY valid JSON matching the schema (no markdown).
Content is fictional practice; do not invent specific laws by jurisdiction — speak in general best practices and say "check your state's official election site" when details vary.
Keep each narrative under ~120 words. Offer exactly three distinct options labeled A/B/C style ids ("a","b","c").
World state numbers are integers 0-100 except deadlinesMet which is non-negative count and turnIndex which increments each server turn.
Rules:
- Reflect consequences of prior choice inside narrative and adjust worldState plausibly.
- If turnIndex reaches ${brief.maxTurns - 1} OR the storyline naturally concludes next, set complete true on THAT response and summarize wrap-up inside coachNote briefly.
For action=start: open a strong scene with no recap of choices.
For action=advance: the user chose lastChoice.optionId; incorporate that choice subtly into the dilemma.
Pack context:
Theme: ${brief.theme}
Learning goals: ${brief.learningGoals.join("; ")}
Tone: ${brief.tone}
`.trim();

  const userPrompt = JSON.stringify({
    action,
    packId,
    worldState,
    lastChoice,
    reminders: [
      `turnIndex input is ${worldState.turnIndex}`,
      brief.maxTurns ? `Hard cap turns (0-based): ${brief.maxTurns}` : "",
    ],
  });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });
    const text =
      typeof result.response?.text === "function"
        ? result.response.text()
        : (result.response?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "");
    if (!text) {
      return {
        ok: false,
        statusCode: 502,
        code: "EMPTY_RESPONSE",
        error: "Gemini returned no text for this turn. Retry in a moment.",
        retryAfterSec: 15,
      };
    }
    let data;
    try {
      data = parseStructuredResponse(text);
    } catch (e) {
      return {
        ok: false,
        statusCode: 502,
        code: "INVALID_MODEL_JSON",
        error: `The model reply was not usable. Try again or use offline practice. (${e instanceof Error ? e.message : String(e)})`,
        retryAfterSec: 12,
      };
    }

    const nextWs = coerceWorldState(data.worldState);
    nextWs.turnIndex = worldState.turnIndex + 1;
    data.worldState = nextWs;
    data.meta = { packId, maxTurns: brief.maxTurns };

    if (nextWs.turnIndex >= brief.maxTurns) data.complete = true;

    return { ok: true, data };
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
