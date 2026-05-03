/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../services/tutorApi.js", () => ({
  postQuizExplain: vi.fn(() =>
    Promise.resolve({
      reply: "Tutor helps you see the distinction.",
      suggestedChips: ["What is a provisional ballot?"],
    }),
  ),
}));

import * as tutorApi from "../services/tutorApi.js";
import QuizWrongExplainCallout from "./QuizWrongExplainCallout.jsx";

afterEach(() => cleanup());

describe("QuizWrongExplainCallout", () => {
  it("fetches and renders tutor copy", async () => {
    const user = userEvent.setup();
    render(
      <QuizWrongExplainCallout
        question="Q?"
        explanation="Because rules."
        options={[
          { text: "a", correct: true },
          { text: "b", correct: false },
        ]}
        chosenIndex={1}
      />,
    );
    await user.click(screen.getByRole("button", { name: /gemini tutor/i }));
    expect(await screen.findByText(/Tutor helps you see/i)).toBeInTheDocument();
    expect(tutorApi.postQuizExplain).toHaveBeenCalledTimes(1);
  });
});
