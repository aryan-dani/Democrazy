/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressProvider, useProgress } from "../useProgress.js";

function ScoreProbe() {
  const { addQuizScore, progress } = useProgress();
  return (
    <div>
      <span data-testid="count">{progress.quizScores.length}</span>
      <button type="button" onClick={() => addQuizScore(1, 2, { label: "Test quiz" })}>
        record
      </button>
    </div>
  );
}

describe("ProgressProvider", () => {
  beforeEach(() => {
    localStorage.removeItem("democrazy_progress");
  });

  afterEach(() => cleanup());

  it("records quiz scores through context", async () => {
    const user = userEvent.setup();
    render(
      <ProgressProvider>
        <ScoreProbe />
      </ProgressProvider>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    await user.click(screen.getByRole("button", { name: /record/i }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
