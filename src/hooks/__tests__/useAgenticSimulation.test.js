/** @vitest-environment jsdom */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAgenticSimulation } from "../useAgenticSimulation";
import * as simApi from "../../utils/simulationApi";
import * as offlineApi from "../../utils/agenticFallback";

vi.mock("../../utils/simulationApi", () => ({
  postSimulationTurn: vi.fn(),
  SimulationApiError: class SimulationApiError extends Error {
    constructor(message, status, code, retryAfterSec) {
      super(message);
      this.status = status;
      this.code = code;
      this.retryAfterSec = retryAfterSec;
    }
  },
}));

vi.mock("../../utils/agenticFallback", () => ({
  buildOfflineBeat: vi.fn(),
}));

describe("useAgenticSimulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const flush = async () =>
    act(async () => {
      await Promise.resolve();
    });

  const mockPayload = {
    ok: true,
    narrative: "Test narrative",
    phase: "Test phase",
    options: [{ id: "opt1", label: "Option 1" }],
    coachNote: "Coach note",
    worldState: {
      trustScore: 70,
      rumorExposure: 10,
      deadlinesMet: 1,
      turnIndex: 1,
    },
    meta: { maxTurns: 5 },
    complete: false,
  };

  it("bootstraps from network on mount when enabled", async () => {
    simApi.postSimulationTurn.mockResolvedValueOnce(mockPayload);

    const { result } = renderHook(() =>
      useAgenticSimulation({ packId: "test-pack", enabled: true }),
    );

    expect(result.current.loading).toBe(true);

    await flush();

    expect(result.current.loading).toBe(false);
    expect(result.current.scene).toEqual({
      narrative: "Test narrative",
      phase: "Test phase",
      options: [{ id: "opt1", label: "Option 1" }],
      coachNote: "Coach note",
    });
  });

  it("handles network error and retries correctly", async () => {
    simApi.postSimulationTurn.mockRejectedValueOnce(
      new simApi.SimulationApiError("Rate limited", 429, "RATE_LIMIT", null),
    );

    const { result } = renderHook(() =>
      useAgenticSimulation({ packId: "test-pack", enabled: true }),
    );

    await flush();

    expect(result.current.agentError).toEqual({
      message: "Rate limited",
      status: 429,
      code: "RATE_LIMIT",
    });

    expect(result.current.canRetryGemini).toBe(false);
    expect(result.current.secondsUntilRetry).toBe(45);

    act(() => {
      vi.advanceTimersByTime(46000);
    });

    expect(result.current.canRetryGemini).toBe(true);
  });

  it("handles offline continuation", async () => {
    simApi.postSimulationTurn.mockRejectedValueOnce(new Error("Network failed"));

    const { result } = renderHook(() =>
      useAgenticSimulation({ packId: "test-pack", enabled: true }),
    );

    await flush();

    expect(result.current.agentError).toBeTruthy();

    offlineApi.buildOfflineBeat.mockResolvedValueOnce({
      ok: true,
      scene: { narrative: "Offline step", phase: "Offline phase", options: [] },
      worldState: { turnIndex: 1 },
      maxTurns: 10,
      complete: false,
    });

    await act(async () => {
      result.current.continueOfflinePractice();
      await Promise.resolve();
    });

    expect(result.current.offlineMode).toBe(true);
    expect(result.current.scene).toBeTruthy();
  });

  it("allows choosing an option and advancing", async () => {
    simApi.postSimulationTurn.mockResolvedValueOnce(mockPayload).mockResolvedValueOnce({
      ...mockPayload,
      worldState: { ...mockPayload.worldState, turnIndex: 2 },
    });

    const { result } = renderHook(() =>
      useAgenticSimulation({ packId: "test-pack", enabled: true }),
    );

    await flush();
    expect(result.current.scene).toBeTruthy();

    await act(async () => {
      result.current.chooseOption(0);
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.worldState.turnIndex).toBe(2);
  });

  it("respects retryAfterSec from the API", async () => {
    simApi.postSimulationTurn.mockRejectedValueOnce(
      new simApi.SimulationApiError("Wait a bit", 429, "RATE_LIMIT", 10),
    );

    const { result } = renderHook(() =>
      useAgenticSimulation({ packId: "test-pack", enabled: true }),
    );

    await flush();

    expect(result.current.agentError).toBeTruthy();
    expect(result.current.secondsUntilRetry).toBe(10);
    expect(result.current.canRetryGemini).toBe(false);

    act(() => {
      vi.advanceTimersByTime(11000);
    });

    expect(result.current.canRetryGemini).toBe(true);
  });
});
