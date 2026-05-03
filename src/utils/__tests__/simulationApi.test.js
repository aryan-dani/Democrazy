import { describe, it, expect, vi, beforeEach } from "vitest";
import { postSimulationTurn, SimulationApiError } from "../simulationApi.js";

describe("postSimulationTurn", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ ok: true, narrative: "x" }),
        }),
      ),
    );
  });

  it("returns json on HTTP 200 ok path", async () => {
    const data = await postSimulationTurn({ action: "start", packId: "election-prep" });
    expect(data.ok).toBe(true);
    expect(data.narrative).toBe("x");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/simulation\/turn$/),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws when response ok:false with 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: false, error: "declined", code: "X" }),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected SimulationApiError");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.message).toBe("declined");
      expect(err.code).toBe("X");
    }
  });

  it("maps 429 with server retry hint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "slow down", retryAfterSec: 17 }),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.retryAfterSec).toBe(17);
    }
  });

  it("fallback retry on 429 without server hint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "nope" }),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.retryAfterSec).toBe(60);
    }
  });

  it("maps 503 NO_API_KEY to no retry hint", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: "no key", code: "NO_API_KEY" }),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.code).toBe("NO_API_KEY");
      expect(err.retryAfterSec).toBeUndefined();
    }
  });

  it("maps generic 503 to model backoff", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ error: "overload" }),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.retryAfterSec).toBe(30);
    }
  });

  it("handles non-json error bodies gracefully", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });

    try {
      await postSimulationTurn({});
      expect.fail("expected rejection");
    } catch (err) {
      expect(err).toBeInstanceOf(SimulationApiError);
      expect(err.message).toContain("500");
    }
  });
});
