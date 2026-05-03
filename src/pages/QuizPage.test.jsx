/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProgressProvider } from "../hooks/useProgress";
import QuizPage from "./QuizPage.jsx";
import { quizQuestions } from "../data/simulationData";

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("QuizPage", () => {
  const renderQuiz = (initialPath = "/quiz") => {
    return render(
      <ProgressProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </MemoryRouter>
      </ProgressProvider>,
    );
  };

  it("can complete a full quiz, correctly tracking scores, and allowing retake", async () => {
    const user = userEvent.setup();
    renderQuiz();

    expect(screen.getByRole("heading", { name: /knowledge quiz/i })).toBeInTheDocument();

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const correctIndex = q.options.findIndex((opt) => opt.correct);
      const incorrectIndex = q.options.findIndex((opt) => !opt.correct);
      
      // For question 0, answer incorrectly first to test "Try again"
      if (i === 0) {
        await user.click(screen.getByText(q.options[incorrectIndex].text).closest("button"));
        expect(screen.getByText(/Here's what happened/i)).toBeInTheDocument();
        
        // click Try Again
        await user.click(screen.getByRole("button", { name: /Try again/i }));
      }
      
      // Answer correctly
      await user.click(screen.getByText(q.options[correctIndex].text).closest("button"));
      
      expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
      
      // click Next question / See results
      const btnName = i === quizQuestions.length - 1 ? /See results/i : /Next question/i;
      await user.click(screen.getByRole("button", { name: btnName }));
    }

    // Finished
    expect(screen.getByRole("heading", { name: /Quiz complete/i })).toBeInTheDocument();
    
    // Check score
    expect(screen.getAllByText(`${quizQuestions.length}/${quizQuestions.length}`)[0]).toBeInTheDocument();

    // Retake quiz
    await user.click(screen.getByRole("button", { name: /Retake quiz/i }));
    
    // Should be back to question 1
    expect(screen.getByRole("heading", { name: /knowledge quiz/i })).toBeInTheDocument();
  });

  it("handles skipping a question when answered incorrectly", async () => {
    const user = userEvent.setup();
    renderQuiz();

    // Answer Q1 incorrectly
    const q1 = quizQuestions[0];
    const incorrectIndex = q1.options.findIndex((opt) => !opt.correct);
    await user.click(screen.getByText(q1.options[incorrectIndex].text).closest("button"));
    
    // Skip question (counts as missed)
    await user.click(screen.getByRole("button", { name: /Next question \(counts as missed\)/i }));

    // Should be on Q2 now
    const q2 = quizQuestions[1];
    expect(screen.getByRole("heading", { name: q2.question })).toBeInTheDocument();
  });

  it("shows simulation banner when fromSim query param is present", async () => {
    renderQuiz("/quiz?from=sim");
    expect(screen.getByText(/Quiz linked from your simulation/i)).toBeInTheDocument();
  });
});
