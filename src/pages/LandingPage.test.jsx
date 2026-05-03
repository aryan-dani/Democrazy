/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage.jsx";

afterEach(() => cleanup());

function Harness() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulation" element={<p>Simulation route</p>} />
    </Routes>
  );
}

describe("LandingPage", () => {
  it("navigates constitutional CTA to simulations", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Harness />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: /constitutional stress pack/i }));
    expect(await screen.findByText(/Simulation route/i)).toBeInTheDocument();
  });

  it("shows hero and feature grid headings", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /ready to vote/i })).toBeInTheDocument();
    expect(screen.getByText(/Everything You Need/i)).toBeInTheDocument();
  });
});
