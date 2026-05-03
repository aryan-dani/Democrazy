import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class MockGenAi {
    getGenerativeModel() {
      return {
        generateContent: (...args) => mockGenerateContent(...args),
      };
    }
  },
}));

const { runTutorChat } = await import("../tutorChat.js");

describe("runTutorChat (mocked Gemini SDK)", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "vitest-key");
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("handles quiz_explain mode with guarded JSON remediation", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            reply:
              "Option 1 misreads the Constitutional path; option 0 tracks how electors are allocated.",
            followUps: ["What is certification?", "How do recount rules vary by state?"],
          }),
      },
    });

    const result = await runTutorChat({
      mode: "quiz_explain",
      question: "How is the presidency decided?",
      explanation: "Electoral votes finalize the presidency; national trackers are descriptive.",
      options: [
        { text: "Electoral votes from state contests", correct: true },
        { text: "Whoever cable networks project first nationally", correct: false },
      ],
      chosenIndex: 1,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toContain("Option 1");
      expect(result.suggestedChips[0]).toContain("certification");
    }
  });

  it("parses reply and followUps chips", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            reply: "Votes are counted locally then certified upward.",
            followUps: ["What is a canvass?", "How do provisional ballots work?"],
          }),
      },
    });

    const result = await runTutorChat({
      messages: [{ role: "user", content: "How are votes counted?" }],
      mode: "simple",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toContain("Votes");
      expect(result.suggestedChips).toEqual([
        "What is a canvass?",
        "How do provisional ballots work?",
      ]);
    }
  });

  it("returns EMPTY_RESPONSE for whitespace-only tutor text", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "   \n\t" },
    });

    const result = await runTutorChat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("EMPTY_RESPONSE");
  });

  it("returns INVALID_JSON when reply is not JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => "Here is prose only" },
    });

    const result = await runTutorChat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INVALID_JSON");
  });

  it("returns BAD_REPLY when JSON omits usable reply text", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => JSON.stringify({ reply: "", followUps: [] }) },
    });

    const result = await runTutorChat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BAD_REPLY");
  });

  it("surfaces Gemini failure classification on throw", async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error("service overloaded and unavailable"));

    const result = await runTutorChat({
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("MODEL_UNAVAILABLE");
  });
});
