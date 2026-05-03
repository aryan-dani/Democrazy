import { describe, it, expect } from "vitest";
import {
  scenarioPackCatalog,
  scenarioPacks,
  loadPackSteps,
  countScenariosAcrossPacks,
  longestPackScenarioCount,
} from "../registry.js";

describe("pack registry", () => {
  it("loadPackSteps falls back to election prep for unknown id", async () => {
    const steps = await loadPackSteps("no-such-pack");
    expect(steps.length).toBeGreaterThan(0);
    const election = await loadPackSteps("election-prep");
    expect(steps).toEqual(election);
  });

  it("counts scenarios and max pack length", () => {
    const total = countScenariosAcrossPacks(scenarioPackCatalog);
    expect(total).toBeGreaterThan(20);
    expect(longestPackScenarioCount).toBeGreaterThanOrEqual(8);
  });

  it("scenarioPacks alias matches catalog", () => {
    expect(scenarioPacks).toBe(scenarioPackCatalog);
  });
});
