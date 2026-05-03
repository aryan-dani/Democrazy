import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

vi.mock("./components/Navbar", () => ({
  default: () => <nav data-testid="mock-navbar" />,
}));
vi.mock("./components/AIChatDrawer", () => ({
  default: () => <div data-testid="mock-ai-drawer" />,
}));
vi.mock("./components/FirestoreProgressBridge", () => ({
  default: () => <div data-testid="mock-fs-bridge" />,
}));
vi.mock("./pages/LandingPage", () => ({
  default: () => <div data-testid="mock-landing" />,
}));

describe("App Router", () => {
  it("renders main components and default route", () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId("mock-navbar")).toBeInTheDocument();
    expect(getByTestId("mock-ai-drawer")).toBeInTheDocument();
    expect(getByTestId("mock-fs-bridge")).toBeInTheDocument();
  });
});
