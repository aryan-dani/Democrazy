import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  SchemaType: {
    OBJECT: "OBJECT",
    STRING: "STRING",
    BOOLEAN: "BOOLEAN",
    INTEGER: "INTEGER",
    ARRAY: "ARRAY",
  },
  GoogleGenerativeAI: class MockGenAi {
    getGenerativeModel() {
      return {
        generateContent: (...args) => mockGenerateContent(...args),
      };
    }
  },
}));

const { runAgenticTurn } = await import("../agenticTurn.js");

function validTurnJson(wsTurn = 0) {
  return JSON.stringify({
    narrative: "Practice scene.",
    phase: "open",
    options: [
      { id: "a", label: "Path A" },
      { id: "b", label: "Path B" },
    ],
    coachNote: "Coach tip.",
    complete: false,
    worldState: {
      trustScore: 55,
      rumorExposure: 12,
      deadlinesMet: 0,
      turnIndex: wsTurn,
    },
  });
}

describe("runAgenticTurn (mocked Gemini SDK)", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "vitest-key");
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns ok:true with incremented turn index on success", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => validTurnJson(0),
      },
    });

    const result = await runAgenticTurn({
      action: "start",
      packId: "election-prep",
      worldState: { turnIndex: 0 },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.worldState.turnIndex).toBe(1);
      expect(result.data.meta.packId).toBe("election-prep");
      expect(result.data.options).toHaveLength(2);
    }
  });

  it("returns EMPTY_RESPONSE when model returns blank text", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "" },
    });

    const result = await runAgenticTurn({
      action: "start",
      packId: "election-prep",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMPTY_RESPONSE");
      expect(result.statusCode).toBe(502);
    }
  });

  it("returns INVALID_MODEL_JSON when inner parse fails", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "{ not valid json" },
    });

    const result = await runAgenticTurn({
      action: "start",
      packId: "local-civic",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_MODEL_JSON");
  });

  it("surfaces classifyGeminiFailure when generateContent throws rate limit", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("received 429 too many"));

    const result = await runAgenticTurn({
      action: "start",
      packId: "election-prep",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("RATE_LIMIT");
  });

  it("returns NO_API_KEY when GEMINI_API_KEY is blank", async () => {
    vi.stubEnv("GEMINI_API_KEY", "   ");
    const result = await runAgenticTurn({
      action: "start",
      packId: "election-prep",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("NO_API_KEY");
  });
});
