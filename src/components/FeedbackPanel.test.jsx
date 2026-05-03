/** @vitest-environment jsdom */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackPanel from "./FeedbackPanel.jsx";

afterEach(() => cleanup());

describe("FeedbackPanel", () => {
  it("renders quiz wrong recovery actions", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSkip = vi.fn();

    render(
      <FeedbackPanel
        variant="quiz"
        isCorrect={false}
        feedback="oops"
        explanation="because"
        onRetry={onRetry}
        onNext={() => {}}
        onContinueAnyway={onSkip}
        continueAnywayLabel="skip"
      />,
    );

    await user.click(screen.getByRole("button", { name: /try again/i }));
    await user.click(screen.getByRole("button", { name: /skip/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("shows next path on correct", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <FeedbackPanel
        variant="quiz"
        isCorrect
        feedback="nice"
        explanation="study"
        onNext={onNext}
        nextLabel="Continue"
      />,
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(onNext).toHaveBeenCalled();
  });
});
