import { describe, it, expect } from "vitest";
import { validateTutorBody } from "../tutorChat.js";

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
