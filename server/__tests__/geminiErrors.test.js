import { describe, it, expect } from "vitest";
import { classifyGeminiFailure } from "../geminiErrors.js";

describe("classifyGeminiFailure", () => {
  it("detects rate limit and clamps retry-after low bound", () => {
    const low = classifyGeminiFailure(new Error("429 TooManyRequests Retry-After: 2"));
    expect(low.code).toBe("RATE_LIMIT");
    expect(low.retryAfterSec).toBe(5);
    expect(low.statusCode).toBe(429);
  });

  it("parses Retry-After from message and clamps high bound", () => {
    const high = classifyGeminiFailure(new Error("resource exhausted Retry-After: 999999"));
    expect(high.code).toBe("RATE_LIMIT");
    expect(high.retryAfterSec).toBe(300);
  });

  it("classifies overloaded / unavailable as MODEL_UNAVAILABLE", () => {
    const a = classifyGeminiFailure(new Error("503 unavailable"));
    expect(a.code).toBe("MODEL_UNAVAILABLE");
    expect(a.statusCode).toBe(503);

    const b = classifyGeminiFailure(new Error("Model is overloaded"));
    expect(b.code).toBe("MODEL_UNAVAILABLE");
  });

  it("classifies auth rejection", () => {
    const r = classifyGeminiFailure(new Error("401 Unauthorized"));
    expect(r.code).toBe("AUTH");
    expect(r.statusCode).toBe(403);
  });

  it("classifies model not found wording", () => {
    const r = classifyGeminiFailure(new Error("model gemini-x is not found"));
    expect(r.code).toBe("MODEL_NOT_FOUND");
    expect(r.statusCode).toBe(400);
  });

  it("classifies network-ish failures", () => {
    const r = classifyGeminiFailure(new Error("fetch failed"));
    expect(r.code).toBe("NETWORK");
    expect(r.retryAfterSec).toBeDefined();
    expect(r.statusCode).toBe(502);
  });

  it("falls through to UNKNOWN", () => {
    const r = classifyGeminiFailure(new Error("mystery"));
    expect(r.code).toBe("UNKNOWN");
    expect(r.statusCode).toBe(502);
    expect(typeof r.retryAfterSec).toBe("number");
  });
});
