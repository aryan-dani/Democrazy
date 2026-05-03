import { useState, useCallback } from "react";

/**
 * Custom hook to manage the quiz progression, scoring, and feedback state.
 * @param {Array} questions - Array of quiz question objects.
 */
export function useQuiz(questions) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleOptionClick = useCallback(
    (optionIndex) => {
      if (showFeedback) return;
      const option = questions[currentQuestion].options[optionIndex];
      setSelectedOption(optionIndex);
      setIsCorrect(option.correct);
      setShowFeedback(true);
      if (option.correct) {
        setScore((prev) => prev + 1);
      }
    },
    [currentQuestion, showFeedback, questions],
  );

  const commitAndAdvance = useCallback(() => {
    if (selectedOption === null || isCorrect === null) return;
    const q = questions[currentQuestion];
    setAnswers((prev) => [
      ...prev,
      {
        questionId: q.id,
        selectedOption,
        correct: Boolean(isCorrect),
      },
    ]);
    const next = currentQuestion + 1;
    if (next >= questions.length) {
      setIsComplete(true);
    } else {
      setCurrentQuestion(next);
    }
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentQuestion, selectedOption, isCorrect, questions]);

  /** Wrong answer only: clears selection without advancing; no score mutation. */
  const handleQuizRetryWrong = useCallback(() => {
    if (!showFeedback || isCorrect !== false) return;
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [showFeedback, isCorrect]);

  /**
   * Wrong answer: record as incorrect for this question and move on (0 points preserved).
   * Score rule: only correct picks increment score; skips keep score flat.
   */
  const skipQuestionIncorrect = useCallback(() => {
    if (!showFeedback || isCorrect !== false || selectedOption === null) return;
    commitAndAdvance();
  }, [showFeedback, isCorrect, selectedOption, commitAndAdvance]);

  const handleNextQuestion = useCallback(() => {
    if (!showFeedback || isCorrect !== true) return;
    commitAndAdvance();
  }, [showFeedback, isCorrect, commitAndAdvance]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
  }, []);

  return {
    currentQuestion,
    selectedOption,
    isCorrect,
    showFeedback,
    score,
    answers,
    isComplete,
    currentQuestionData: questions[currentQuestion] || null,
    totalQuestions: questions.length,
    progress: Math.round(((currentQuestion + (showFeedback ? 1 : 0)) / questions.length) * 100),
    percentage: Math.round((score / questions.length) * 100),
    handleOptionClick,
    handleNextQuestion,
    handleQuizRetryWrong,
    skipQuestionIncorrect,
    resetQuiz,
  };
}
