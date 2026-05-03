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
});
