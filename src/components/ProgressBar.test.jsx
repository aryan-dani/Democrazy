/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ProgressBar from "./ProgressBar.jsx";

afterEach(() => cleanup());

describe("ProgressBar", () => {
  it("exposes progressbar semantics for current/total ratio", () => {
    render(<ProgressBar current={3} total={10} label="Modules" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar.getAttribute("aria-valuenow")).toBe("30");
  });

  it("uses 0% when total is zero", () => {
    render(<ProgressBar current={5} total={0} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });
});
