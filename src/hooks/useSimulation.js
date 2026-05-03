import { useState, useCallback } from "react";

export function useSimulation(steps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleOptionClick = useCallback(
    (optionIndex) => {
      if (showFeedback) return;
      const option = steps[currentStep].options[optionIndex];
      setSelectedOption(optionIndex);
      setIsCorrect(option.correct);
      setShowFeedback(true);
    },
    [currentStep, showFeedback, steps],
  );

  const handleNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    if (nextStep >= steps.length) {
      setIsComplete(true);
    } else {
      setCurrentStep(nextStep);
    }
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentStep, steps.length]);

  const handleRetry = useCallback(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, []);

  /**
   * Advance after wrong answer without correcting (mistake recovery).
   */
  const handleContinueAnyway = useCallback(() => {
    if (!showFeedback || isCorrect !== false) return;
    handleNextStep();
  }, [showFeedback, isCorrect, handleNextStep]);

  const resetSimulation = useCallback(
    (opts = {}) => {
      const max = Math.max(steps.length - 1, 0);
      const raw = typeof opts.startAt === "number" ? Math.min(Math.max(opts.startAt, 0), max) : 0;
      const at = opts.startAt === "last" ? max : raw;
      setCurrentStep(at);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowFeedback(false);
      setCompletedSteps([]);
      setIsComplete(false);
    },
    [steps.length],
  );

  return {
    currentStep,
    selectedOption,
    isCorrect,
    showFeedback,
    completedSteps,
    isComplete,
    currentStepData: steps[currentStep] || null,
    totalSteps: steps.length,
    progress: Math.round((completedSteps.length / Math.max(steps.length, 1)) * 100),
    handleOptionClick,
    handleNextStep,
    handleRetry,
    handleContinueAnyway,
    resetSimulation,
  };
}
