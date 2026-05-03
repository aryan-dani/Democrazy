import { describe, it, expect } from "vitest";
import { validateTutorBody, validateQuizExplainBody } from "../tutorChat.js";

describe("validateTutorBody", () => {
  it("rejects non-object bodies", () => {
    expect(validateTutorBody(null).ok).toBe(false);
    expect(validateTutorBody(undefined).ok).toBe(false);
    expect(validateTutorBody("x").ok).toBe(false);
  });

  it("rejects empty messages array", () => {
    const r = validateTutorBody({ messages: [], mode: "simple" });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("non-empty");
  });

  it("rejects blank last message content", () => {
    const r = validateTutorBody({
      messages: [{ role: "user", content: "   " }],
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("non-empty");
  });

  it("defaults mode to simple unless deeper", () => {
    const plain = validateTutorBody({
      messages: [{ role: "user", content: "What is turnout?" }],
    });
    expect(plain.ok).toBe(true);
    if (plain.ok) expect(plain.mode).toBe("simple");

    const deeper = validateTutorBody({
      mode: "deeper",
      messages: [{ role: "user", content: "Explain ranked choice" }],
    });
    expect(deeper.ok).toBe(true);
    if (deeper.ok) expect(deeper.mode).toBe("deeper");
  });
});

describe("validateQuizExplainBody", () => {
  const base = {
    mode: "quiz_explain",
    question: "Minimum voting age?",
    explanation: "Federal floor is 18.",
    options: [
      { text: "18", correct: true },
      { text: "21", correct: false },
    ],
  };

  it("accepts wrong chosenIndex with single correct option", () => {
    const r = validateQuizExplainBody({ ...base, chosenIndex: 1 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.correctIndex).toBe(0);
  });

  it("rejects when chosenIndex points to correct answer", () => {
    const r = validateQuizExplainBody({ ...base, chosenIndex: 0 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("incorrect");
  });

  it("rejects when not exactly one correct option", () => {
    let r = validateQuizExplainBody({
      mode: "quiz_explain",
      question: "Q",
      explanation: "E",
      options: [
        { text: "a", correct: true },
        { text: "b", correct: true },
      ],
      chosenIndex: 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("exactly one");

    r = validateQuizExplainBody({
      mode: "quiz_explain",
      question: "Q",
      explanation: "E",
      options: [
        { text: "a", correct: false },
        { text: "b", correct: false },
      ],
      chosenIndex: 0,
    });
    expect(r.ok).toBe(false);
  });
});
