import { describe, it, expect } from "vitest";
import { coerceWorldState, validateTurnPayload } from "../agenticTurn.js";

describe("coerceWorldState", () => {
  it("uses defaults when input is missing or not an object", () => {
    expect(coerceWorldState(null)).toMatchObject({
      trustScore: 60,
      rumorExposure: 20,
      deadlinesMet: 0,
      turnIndex: 0,
    });
    expect(coerceWorldState(undefined)).toMatchObject({
      trustScore: 60,
      rumorExposure: 20,
      deadlinesMet: 0,
      turnIndex: 0,
    });
    expect(coerceWorldState("x")).toMatchObject({
      trustScore: 60,
      rumorExposure: 20,
      deadlinesMet: 0,
      turnIndex: 0,
    });
  });

  it("clamps trustScore and rumorExposure into 0–100 and rounds", () => {
    expect(
      coerceWorldState({
        trustScore: -5,
        rumorExposure: 150.7,
      }),
    ).toMatchObject({ trustScore: 0, rumorExposure: 100 });
    expect(
      coerceWorldState({
        trustScore: 51.4,
        rumorExposure: 49.9,
      }),
    ).toMatchObject({ trustScore: 51, rumorExposure: 50 });
  });

  it("keeps deadlinesMet and turnIndex non-negative integers", () => {
    expect(
      coerceWorldState({
        deadlinesMet: -3,
        turnIndex: -1,
      }),
    ).toMatchObject({ deadlinesMet: 0, turnIndex: 0 });
    expect(coerceWorldState({ deadlinesMet: 2.7, turnIndex: 9.4 })).toMatchObject({
      deadlinesMet: 3,
      turnIndex: 9,
    });
  });
});

describe("validateTurnPayload", () => {
  const baseStart = () => ({
    action: "start",
    packId: "election-prep",
  });

  it("rejects unknown packId", () => {
    const r = validateTurnPayload({ ...baseStart(), packId: "nope" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Unknown packId/);
    expect(r.error).toContain("election-prep");
  });

  it("rejects invalid action", () => {
    const r = validateTurnPayload({ ...baseStart(), action: "pause" });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("start");
    expect(r.error).toContain("advance");
  });

  it("rejects when turnIndex meets or exceeds pack maxTurns", () => {
    const r = validateTurnPayload({
      action: "start",
      packId: "election-prep",
      worldState: { turnIndex: 10 },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Maximum turns exceeded/i);
  });

  it("rejects advance with non-object lastChoice when provided", () => {
    const r = validateTurnPayload({
      action: "advance",
      packId: "election-prep",
      lastChoice: "a",
      worldState: { turnIndex: 0 },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("lastChoice");
  });

  it("accepts advance with object lastChoice and coerces world state", () => {
    const r = validateTurnPayload({
      action: "advance",
      packId: "local-civic",
      lastChoice: { optionId: "b" },
      worldState: { trustScore: 200 },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.worldState.trustScore).toBe(100);
      expect(r.lastChoice.optionId).toBe("b");
    }
  });

  it("normalizes omitted lastChoice to null on advance", () => {
    const r = validateTurnPayload({
      action: "advance",
      packId: "misinformation-lab",
      worldState: { turnIndex: 5 },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.lastChoice).toBeNull();
  });

  it("accepts misinformation pack at last allowed turn index", () => {
    const r = validateTurnPayload({
      action: "start",
      packId: "misinformation-lab",
      worldState: { turnIndex: 11 },
    });
    expect(r.ok).toBe(true);
  });
});
