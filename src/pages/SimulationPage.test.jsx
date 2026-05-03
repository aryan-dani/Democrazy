/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProgressProvider } from "../hooks/useProgress";
import SimulationPage from "./SimulationPage.jsx";
import * as simDataMod from "../data/simulationData.js";
import * as agenticSimMod from "../hooks/useAgenticSimulation";
import * as useSimMod from "../hooks/useSimulation";

vi.mock("../utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("../data/simulationData.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadPackSteps: vi.fn(),
  };
});

vi.mock("../hooks/useAgenticSimulation", () => ({
  useAgenticSimulation: vi.fn(),
}));

vi.mock("../hooks/useSimulation", () => ({
  useSimulation: vi.fn(),
}));

afterEach(() => cleanup());

describe("SimulationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Classic Mode", () => {
    it("handles load failure", async () => {
      simDataMod.loadPackSteps.mockRejectedValue(new Error("Failed to load"));
      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=classic&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(await screen.findByText(/Could not load this pack/i)).toBeInTheDocument();
    });

    it("renders loaded classic scenario successfully", async () => {
      const mockSteps = [
        {
          id: "step0",
          phase: "Phase Zero",
          scenario: "This is a scripted scenario",
          options: [{ text: "Option A", correct: true }],
        },
      ];
      simDataMod.loadPackSteps.mockResolvedValue(mockSteps);

      useSimMod.useSimulation.mockReturnValue({
        currentStep: 0,
        selectedOption: null,
        isCorrect: null,
        showFeedback: false,
        isComplete: false,
        currentStepData: mockSteps[0],
        totalSteps: 1,
        handleOptionClick: vi.fn(),
        handleNextStep: vi.fn(),
        handleRetry: vi.fn(),
        handleContinueAnyway: vi.fn(),
        resetSimulation: vi.fn(),
      });

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=classic&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(await screen.findByText(/This is a scripted scenario/i)).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /simulation hub/i })).toBeInTheDocument();
    });
  });

  describe("Agent Mode", () => {
    it("renders loading state correctly", () => {
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: null,
        loading: true,
        agentError: null,
        offlineMode: false,
        secondsUntilRetry: 0,
        canRetryGemini: true,
        completed: false,
        worldState: { turnIndex: 0 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: vi.fn(),
        continueOfflinePractice: vi.fn(),
      });

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(screen.getByText(/Gemini is authoring your dilemma/i)).toBeInTheDocument();
    });

    it("renders error state and offline fallback correctly", () => {
      const mockRestart = vi.fn();
      const mockOffline = vi.fn();

      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: null,
        loading: false,
        agentError: { message: "API is down", code: "RATE_LIMIT" },
        offlineMode: false,
        secondsUntilRetry: 5,
        canRetryGemini: false,
        completed: false,
        worldState: { turnIndex: 0 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: mockRestart,
        continueOfflinePractice: mockOffline,
      });

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(screen.getByText(/API is down/i)).toBeInTheDocument();
      expect(screen.getByText(/RATE LIMIT/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole("button", { name: /Retry with Gemini/i });
      expect(retryBtn).toBeDisabled();

      const offlineBtn = screen.getByRole("button", { name: /Continue offline/i });
      offlineBtn.click();
      expect(mockOffline).toHaveBeenCalled();
    });

    it("renders agentic scene successfully", () => {
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: {
          narrative: "Agentic scenario test",
          phase: "Agent Phase",
          options: [{ id: "o1", label: "Agent Option 1" }],
        },
        loading: false,
        agentError: null,
        offlineMode: false,
        secondsUntilRetry: 0,
        canRetryGemini: true,
        completed: false,
        worldState: { turnIndex: 1 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: vi.fn(),
        continueOfflinePractice: vi.fn(),
      });

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(screen.getByText(/Agentic scenario test/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Agent Phase/i)[0]).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Agent Option 1/i })).toBeInTheDocument();
    });

    it("can switch to scripted pack when API fails", () => {
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: null,
        loading: false,
        agentError: { message: "API is down", code: "RATE_LIMIT" },
        offlineMode: false,
        secondsUntilRetry: 5,
        canRetryGemini: false,
        completed: false,
        worldState: { turnIndex: 0 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: vi.fn(),
        continueOfflinePractice: vi.fn(),
      });

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      const scriptedBtn = screen.getByRole("button", { name: /Scripted pack only/i });
      scriptedBtn.click();
      // Test is to ensure no crash
    });

    it("renders completed state correctly and supports retake/quiz navigation", async () => {
      const mockRestart = vi.fn();
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: null,
        loading: false,
        agentError: null,
        offlineMode: false,
        secondsUntilRetry: 0,
        canRetryGemini: false,
        completed: true,
        worldState: { turnIndex: 10 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: mockRestart,
        continueOfflinePractice: vi.fn(),
      });

      const user = userEvent.setup();
      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/quiz" element={<div>Quiz Page Redirected</div>} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(screen.getByText(/Gemini session complete!/i)).toBeInTheDocument();

      const rerunBtn = screen.getByRole("button", { name: /Rerun adaptive sim/i });
      await user.click(rerunBtn);
      expect(mockRestart).toHaveBeenCalled();

      // Test Toolbar in completed state
      const packSelect = screen.getByLabelText(/Scenario pack/i);
      await user.selectOptions(packSelect, "local-civic");

      const quizBtn = screen.getByRole("button", { name: /Take the Quiz/i });
      await user.click(quizBtn);
      expect(screen.getByText("Quiz Page Redirected")).toBeInTheDocument();
    });

    it("renders classic sim error state", async () => {
      // We need to mock loadPackSteps to fail
      vi.spyOn(simDataMod, "loadPackSteps").mockRejectedValueOnce(new Error("Load failed"));

      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=classic&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      expect(await screen.findByText(/Could not load this pack/i)).toBeInTheDocument();
    });

    it("can retry Gemini on agent error when available", async () => {
      const mockRestart = vi.fn();
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: null,
        loading: false,
        agentError: { message: "API is down", code: "RATE_LIMIT" },
        offlineMode: false,
        secondsUntilRetry: 0,
        canRetryGemini: true,
        completed: false,
        worldState: { turnIndex: 0 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: mockRestart,
        continueOfflinePractice: vi.fn(),
      });

      const user = userEvent.setup();
      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      const retryBtn = screen.getByRole("button", { name: /Retry with Gemini/i });
      await user.click(retryBtn);
      expect(mockRestart).toHaveBeenCalled();
    });

    it("handles toolbar dropdown callbacks", async () => {
      agenticSimMod.useAgenticSimulation.mockReturnValue({
        scene: {
          narrative: "Agentic scenario test",
          phase: "Agent Phase",
          options: [{ id: "o1", label: "Agent Option 1" }],
        },
        loading: false,
        agentError: null,
        offlineMode: false,
        secondsUntilRetry: 0,
        canRetryGemini: true,
        completed: false,
        worldState: { turnIndex: 1 },
        maxTurns: 10,
        chooseOption: vi.fn(),
        restart: vi.fn(),
        continueOfflinePractice: vi.fn(),
      });

      const user = userEvent.setup();
      render(
        <ProgressProvider>
          <MemoryRouter initialEntries={["/simulation?mode=agent&pack=election-prep"]}>
            <Routes>
              <Route path="/simulation" element={<SimulationPage />} />
            </Routes>
          </MemoryRouter>
        </ProgressProvider>,
      );

      // Change Pack
      const packSelect = screen.getByLabelText(/Scenario pack/i);
      await user.selectOptions(packSelect, "local-civic");
      // Change Mode
      const classicBtn = screen.getByRole("button", { name: /Classic script/i });
      await user.click(classicBtn);
    });
  });
});
