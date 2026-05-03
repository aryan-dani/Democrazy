/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProgressProvider } from "../hooks/useProgress";
import DashboardPage from "./DashboardPage.jsx";

afterEach(() => cleanup());

describe("DashboardPage", () => {
  it("shows dashboard scaffold", () => {
    render(
      <ProgressProvider>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      </ProgressProvider>,
    );
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
  });
});
