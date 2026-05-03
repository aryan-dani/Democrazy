/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptionButton from "./OptionButton.jsx";

afterEach(() => cleanup());

describe("OptionButton", () => {
  it("announces consolidated option letter and text", () => {
    const onClick = vi.fn();
    render(
      <OptionButton
        text="Register early"
        index={2}
        isSelected={false}
        isCorrect={false}
        showFeedback={false}
        disabled={false}
        onClick={onClick}
      />,
    );
    expect(screen.getByRole("button", { name: "Option C: Register early" })).toBeTruthy();
  });

  it("supports aria-pressed in agent variant", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <OptionButton
        variant="agent"
        text="Path one"
        index={0}
        isSelected={false}
        isCorrect={false}
        showFeedback={false}
        disabled={false}
        onClick={onClick}
      />,
    );
    const btn = screen.getByRole("button", { name: "Option A: Path one" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await user.click(btn);
    expect(onClick).toHaveBeenCalledWith(0);
    rerender(
      <OptionButton
        variant="agent"
        text="Path one"
        index={0}
        isSelected
        isCorrect={false}
        showFeedback={false}
        disabled={false}
        onClick={onClick}
      />,
    );
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("classic variant lacks aria-pressed", () => {
    render(
      <OptionButton
        variant="classic"
        text="Yes"
        index={0}
        isSelected={false}
        isCorrect={false}
        showFeedback={false}
        disabled={false}
        onClick={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Option A: Yes" })).not.toHaveAttribute(
      "aria-pressed",
    );
  });
});
