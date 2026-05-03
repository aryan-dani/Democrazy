/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import ScenarioCard from "./ScenarioCard.jsx";

afterEach(() => cleanup());

const step = {
  id: 1,
  scenario: "Scenario text",
  options: [],
};

describe("ScenarioCard", () => {
  it("renders scenario and tips", () => {
    render(
      <ScenarioCard
        step={step}
        phase="Prep"
        didYouKnow="States publish official deadlines early."
        pitfall="Watch out."
      >
        <p>child slot</p>
      </ScenarioCard>,
    );
    expect(screen.getByText(/Scenario text/i)).toBeInTheDocument();
    expect(screen.getByText(/States publish official deadlines/i)).toBeInTheDocument();
    expect(screen.getByText(/Watch out/i)).toBeInTheDocument();
    expect(screen.getByText(/child slot/i)).toBeInTheDocument();
  });
});
