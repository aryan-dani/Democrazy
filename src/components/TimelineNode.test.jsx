/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimelineNode from "./TimelineNode.jsx";

afterEach(() => cleanup());

describe("TimelineNode", () => {
  it("toggles expandable panel", async () => {
    const user = userEvent.setup();
    render(
      <TimelineNode
        stageTitle="Stage A"
        description="Full body"
        example="Tiny scenario"
        icon="campaign"
        initiallyOpen={false}
      />,
    );

    const btn = screen.getByRole("button", { name: /stage a/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Full body")).toBeVisible();
  });
});
