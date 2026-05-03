/** @vitest-environment jsdom */

import { describe, expect, it, vi, afterEach } from "vitest";
import { postSimulationTurn, SimulationApiError } from "../simulationApi";

describe("simulationApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles ok:false explicitly inside json", async () => {
    import.meta.env.VITE_API_ORIGIN = "http://localhost";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: false, error: "Model declined", code: "TEST_CODE" }),
    });

    await expect(postSimulationTurn({ test: true })).rejects.toThrowError(SimulationApiError);
    await expect(postSimulationTurn({ test: true })).rejects.toThrow("Model declined");
    
    // restore for second test
    fetchSpy.mockRestore();
    
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
});
