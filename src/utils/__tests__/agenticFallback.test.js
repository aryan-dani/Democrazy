/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import { buildOfflineBeat } from "../agenticFallback";
import * as simData from "../../data/simulationData";

vi.mock("../../data/simulationData", () => ({
  loadPackSteps: vi.fn(),
}));

describe("agenticFallback", () => {
  it("handles empty pack steps", async () => {
    simData.loadPackSteps.mockResolvedValueOnce([]);
    const res = await buildOfflineBeat("some-pack", 1);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("This pack has no scripted steps for offline mode.");
  });

  it("handles invalid turns", async () => {
    simData.loadPackSteps.mockResolvedValueOnce([{ scenario: "test", options: [] }]);
    const res = await buildOfflineBeat("some-pack", 0);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Invalid turn.");
  });

  it("handles completion", async () => {
    simData.loadPackSteps.mockResolvedValueOnce([{ scenario: "test", options: [] }]);
    const res = await buildOfflineBeat("some-pack", 2);
    expect(res.ok).toBe(true);
    expect(res.complete).toBe(true);
  });

  it("builds a successful scene", async () => {
    simData.loadPackSteps.mockResolvedValueOnce([
      { scenario: "Step 1", phase: "P1", options: [{ text: "Opt 1" }] },
    ]);
    const res = await buildOfflineBeat("some-pack", 1);
    expect(res.ok).toBe(true);
    expect(res.scene.narrative).toContain("Step 1");
    expect(res.scene.options[0].label).toBe("Opt 1");
    expect(res.worldState.turnIndex).toBe(1);
  });
});
