/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar.jsx";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    busy: false,
    authEnabled: false,
    signInGoogle: vi.fn(),
    signOutUser: vi.fn(),
  }),
}));

vi.mock("../utils/themeStorage", () => ({
  getStoredTheme: () => "dark",
  setStoredTheme: vi.fn(),
}));

afterEach(() => cleanup());

describe("Navbar", () => {
  it("toggles theme visual state", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    const toggle = screen.getByRole("button", { name: /switch to light theme/i });
    await user.click(toggle);
    expect(screen.getByRole("button", { name: /switch to dark theme/i })).toBeInTheDocument();
  });
});
