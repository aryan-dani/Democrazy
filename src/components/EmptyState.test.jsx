/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState.jsx";

afterEach(() => cleanup());

describe("EmptyState", () => {
  it("renders title and optional hint", () => {
    render(
      <EmptyState title="Nothing here" hint="Try again later">
        <p>Extra</p>
      </EmptyState>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    expect(screen.getByText("Extra")).toBeInTheDocument();
  });
});
