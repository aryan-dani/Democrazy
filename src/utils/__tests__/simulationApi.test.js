/** @vitest-environment jsdom */

import { describe, expect, it, vi, afterEach } from "vitest";
import { postSimulationTurn, SimulationApiError } from "../simulationApi";

describe("simulationApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles ok:false explicitly inside json", async () => {
    import.meta.env.VITE_API_ORIGIN = "http://localhost";
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: false, error: "Model declined", code: "TEST_CODE" }),
    });

    const promise = postSimulationTurn({ test: true });
    await expect(promise).rejects.toThrowError(SimulationApiError);
    await expect(promise).rejects.toThrow("Model declined");
    
    vi.restoreAllMocks();
    
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: false }), // without error/code
    });
    
    await expect(postSimulationTurn({ test: true })).rejects.toThrow("Model declined");
  });

  it("handles fallback to empty origin string when env var is missing", async () => {
    const originalEnv = import.meta.env.VITE_API_ORIGIN;
    import.meta.env.VITE_API_ORIGIN = undefined;

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true, data: "test" }),
    });

    const res = await postSimulationTurn({ test: true });
    expect(res.data).toBe("test");

    import.meta.env.VITE_API_ORIGIN = originalEnv;
  });

  it("handles 429 and 503 errors with retry logic", async () => {
    import.meta.env.VITE_API_ORIGIN = "http://localhost";
    
    // 429 Rate Limit
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "Too many requests" }),
    });
    try {
      await postSimulationTurn({});
    } catch (err) {
      expect(err.status).toBe(429);
      expect(err.retryAfterSec).toBe(60);
    }

    // 503 Model Unavailable
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: "Server busy", code: "MODEL_UNAVAILABLE" }),
    });
    try {
      await postSimulationTurn({});
    } catch (err) {
      expect(err.status).toBe(503);
      expect(err.retryAfterSec).toBe(30);
    }

    // 503 with NO_API_KEY
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: "No key", code: "NO_API_KEY" }),
    });
    try {
      await postSimulationTurn({});
    } catch (err) {
      expect(err.retryAfterSec).toBeUndefined();
    }
  });

  it("respects server-provided retryAfterSec", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "Retry soon", retryAfterSec: 10 }),
    });
    try {
      await postSimulationTurn({});
    } catch (err) {
      expect(err.retryAfterSec).toBe(10);
    }
  });
});
