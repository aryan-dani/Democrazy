import { describe, it, expect, vi, beforeEach } from "vitest";
import { postTutorMessage, postQuizExplain, TutorApiError } from "../tutorApi.js";

describe("postTutorMessage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ ok: true, reply: "Hi", suggestedChips: ["A"] }),
        }),
      ),
    );
  });

  it("returns reply and chips on OK", async () => {
    const out = await postTutorMessage({
      messages: [{ role: "user", content: "What is turnout?" }],
      mode: "simple",
    });
    expect(out.reply).toBe("Hi");
    expect(out.suggestedChips).toEqual(["A"]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/assistant\/chat$/),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("postQuizExplain sends quiz_explain payload", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, reply: "Because X", suggestedChips: ["Y"] }),
    });
    const out = await postQuizExplain({
      question: "Q?",
      explanation: "E.",
      options: [
        { text: "a", correct: true },
        { text: "b", correct: false },
      ],
      chosenIndex: 1,
    });
    expect(out.reply).toBe("Because X");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/assistant\/chat$/),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("quiz_explain"),
      }),
    );
  });

  it("throws TutorApiError when HTTP fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "slow down", retryAfterSec: 12 }),
    });
    try {
      await postTutorMessage({ messages: [{ role: "user", content: "x" }] });
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(TutorApiError);
      expect(e.message).toContain("slow down");
      expect(e.retryAfterSec).toBe(12);
    }
  });

  it("throws when json missing ok:true", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: false, error: "nope" }),
    });
    try {
      await postTutorMessage({ messages: [{ role: "user", content: "x" }] });
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(TutorApiError);
      expect(e.message).toContain("Unexpected");
    }
  });

  it("handles error codes and missing fields in success response", async () => {
    // Error with code
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "bad", code: "BAD_REQ" }),
    });
    try {
      await postTutorMessage({ messages: [] });
    } catch (e) {
      expect(e.code).toBe("BAD_REQ");
    }

    // Success but missing reply/chips
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });
    const out = await postTutorMessage({ messages: [] });
    expect(out.reply).toBe("");
    expect(out.suggestedChips).toEqual([]);
  });

  it("handles non-json error bodies", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.reject(new Error("bad json")),
    });
    try {
      await postTutorMessage({ messages: [{ role: "user", content: "x" }] });
    } catch (e) {
      expect(e).toBeInstanceOf(TutorApiError);
      expect(e.message).toContain("503");
    }
  });
});
