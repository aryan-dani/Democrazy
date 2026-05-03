/** @vitest-environment jsdom */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSimulation } from "../useSimulation";

describe("useSimulation", () => {
  const mockSteps = [
    {
      id: "step1",
      phase: "Phase 1",
      options: [
        { text: "Opt 1", correct: true, feedback: "Good" },
        { text: "Opt 2", correct: false, feedback: "Bad" },
      ],
    },
    {
      id: "step2",
      phase: "Phase 2",
      options: [
        { text: "Opt 3", correct: false, feedback: "Wrong" },
        { text: "Opt 4", correct: true, feedback: "Right" },
      ],
    },
  ];

  it("initializes correctly with steps", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    expect(result.current.currentStep).toBe(0);
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.isCorrect).toBeNull();
    expect(result.current.showFeedback).toBe(false);
    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.currentStepData).toEqual(mockSteps[0]);
    expect(result.current.totalSteps).toBe(2);
    expect(result.current.progress).toBe(0);
  });

  it("handles correct option click and next step", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(0); // Correct option
    });

    expect(result.current.selectedOption).toBe(0);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.showFeedback).toBe(true);

    act(() => {
      result.current.handleNextStep();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps).toEqual([0]);
    expect(result.current.showFeedback).toBe(false);
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.progress).toBe(50);
  });

  it("handles incorrect option click and retry", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(1); // Incorrect option
    });

    expect(result.current.isCorrect).toBe(false);
    expect(result.current.showFeedback).toBe(true);

    act(() => {
      result.current.handleRetry();
    });

    expect(result.current.showFeedback).toBe(false);
    expect(result.current.selectedOption).toBeNull();
    expect(result.current.isCorrect).toBeNull();
    // Step should not have advanced
    expect(result.current.currentStep).toBe(0);
  });

  it("handles continue anyway on wrong answer", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(1); // Incorrect option
    });

    expect(result.current.isCorrect).toBe(false);

    act(() => {
      result.current.handleContinueAnyway();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps).toEqual([0]);
    expect(result.current.showFeedback).toBe(false);
  });

  it("ignores handleContinueAnyway if answer is correct", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(0); // Correct option
    });

    act(() => {
      result.current.handleContinueAnyway();
    });

    // Should not advance because it was correct
    expect(result.current.currentStep).toBe(0);
    expect(result.current.showFeedback).toBe(true);
  });

  it("completes simulation at the end of steps", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(0);
      result.current.handleNextStep();
    });

    act(() => {
      result.current.handleOptionClick(1);
      result.current.handleNextStep();
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.currentStep).toBe(1); // Stays at last step index
    expect(result.current.completedSteps).toEqual([0, 1]);
    expect(result.current.progress).toBe(100);
  });

  it("handles resetSimulation", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.handleOptionClick(0);
      result.current.handleNextStep();
    });

    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.resetSimulation();
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.isComplete).toBe(false);
  });

  it("handles resetSimulation with startAt options", () => {
    const { result } = renderHook(() => useSimulation(mockSteps));

    act(() => {
      result.current.resetSimulation({ startAt: 1 });
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.resetSimulation({ startAt: "last" });
    });
    expect(result.current.currentStep).toBe(1); // 1 is the last index

    act(() => {
      result.current.resetSimulation({ startAt: 99 }); // Out of bounds
    });
    expect(result.current.currentStep).toBe(1); // Clamped to max
  });
});
