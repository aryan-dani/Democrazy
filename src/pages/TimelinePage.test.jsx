/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TimelinePage from "./TimelinePage.jsx";

afterEach(() => cleanup());

describe("TimelinePage", () => {
  it("lists stages from data", () => {
    render(
      <MemoryRouter>
        <TimelinePage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Announcement/i)).toBeInTheDocument();
  });
});
