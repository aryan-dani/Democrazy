/** @vitest-environment jsdom */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQuiz } from "../useQuiz.js";

const questions = [
  {
    id: 1,
    question: "Q1",
    options: [
      { text: "wrong", correct: false },
      { text: "right", correct: true },
    ],
    explanation: "e1",
  },
  {
    id: 2,
    question: "Q2",
    options: [{ text: "only", correct: true }],
    explanation: "e2",
  },
];

describe("useQuiz", () => {
  it("tracks correct answers and advances", () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleOptionClick(1));
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.score).toBe(1);
    expect(result.current.showFeedback).toBe(true);

    act(() => result.current.handleNextQuestion());
    expect(result.current.currentQuestion).toBe(1);
    expect(result.current.showFeedback).toBe(false);
  });

  it("retry wrong clears feedback without scoring", () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleOptionClick(0));
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.score).toBe(0);

    act(() => result.current.handleQuizRetryWrong());
    expect(result.current.showFeedback).toBe(false);
    expect(result.current.selectedOption).toBeNull();
  });

  it("skip incorrect commits as missed and advances", () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleOptionClick(0));
    expect(result.current.isCorrect).toBe(false);

    act(() => result.current.skipQuestionIncorrect());
    expect(result.current.currentQuestion).toBe(1);
    expect(result.current.score).toBe(0);

    expect(result.current.answers).toHaveLength(1);
    expect(result.current.answers[0].correct).toBe(false);
  });

  it("completes after last correct step", () => {
    const { result } = renderHook(() =>
      useQuiz([
        questions[1], // single-option correct-only
      ]),
    );

    act(() => result.current.handleOptionClick(0));
    act(() => result.current.handleNextQuestion());
    expect(result.current.isComplete).toBe(true);
  });

  it("blocks option clicks during feedback", () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleOptionClick(0));
    expect(result.current.selectedOption).toBe(0);

    act(() => result.current.handleOptionClick(1));
    expect(result.current.selectedOption).toBe(0);
  });

  it("reset clears state", () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleOptionClick(1));
    act(() => result.current.handleNextQuestion());
    act(() => result.current.resetQuiz());

    expect(result.current.currentQuestion).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.answers).toEqual([]);
  });
});
