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

  it("can switch modes", async () => {
    const user = userEvent.setup();
    render(<AIChatDrawer />);
    await user.click(screen.getByRole("button", { name: /open civic tutor chat/i }));
    await screen.findByRole("dialog");

    const simpleBtn = screen.getByRole("button", { name: /explain simply/i });
    const deeperBtn = screen.getByRole("button", { name: /go deeper/i });

    await user.click(deeperBtn);
    expect(deeperBtn).toHaveClass("active");

    await user.click(simpleBtn);
    expect(simpleBtn).toHaveClass("active");
  });

  it("can submit a quick chip", async () => {
    const user = userEvent.setup();
    render(<AIChatDrawer />);
    await user.click(screen.getByRole("button", { name: /open civic tutor chat/i }));
    await screen.findByRole("dialog");

    const chip = screen.getByRole("button", { name: /What is NOTA\?/i });
    await user.click(chip);

    expect(screen.getByText("What is NOTA?")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Hello!")).toBeInTheDocument();
    });
  });

  it("can submit a drafted message", async () => {
    const user = userEvent.setup();
    render(<AIChatDrawer />);
    await user.click(screen.getByRole("button", { name: /open civic tutor chat/i }));
    await screen.findByRole("dialog");

    const input = screen.getByRole("textbox", { name: /your civic question/i });
    await user.type(input, "Testing question");
    await user.click(screen.getByRole("button", { name: /^Send$/i }));

    expect(screen.getByText("Testing question")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Hello!")).toBeInTheDocument();
    });
  });
});
