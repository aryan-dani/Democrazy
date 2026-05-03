/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import LoadingState from "./LoadingState.jsx";

afterEach(() => cleanup());

describe("LoadingState", () => {
  it("shows status region with label", () => {
    render(<LoadingState label="Patience…" />);
    expect(screen.getByText("Patience…")).toBeInTheDocument();
  });
});
