/** @vitest-environment jsdom */

import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AIChatDrawer from "./AIChatDrawer.jsx";

vi.mock("../services/tutorApi", () => ({
  postTutorMessage: vi.fn(() =>
    Promise.resolve({
      reply: "Hello!",
      suggestedChips: ["Next"],
    }),
  ),
}));

afterEach(() => cleanup());

describe("AIChatDrawer", () => {
  it("closes the dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<AIChatDrawer />);
    await user.click(screen.getByRole("button", { name: /open civic tutor chat/i }));

    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("moves focus into the dialog when opened", async () => {
    const user = userEvent.setup();
    render(<AIChatDrawer />);
    await user.click(screen.getByRole("button", { name: /open civic tutor chat/i }));

    await screen.findByRole("dialog");
    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });
});
