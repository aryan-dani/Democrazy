import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { quizQuestions } from "../data/simulationData";
import { useQuiz } from "../hooks/useQuiz";
import { useProgress } from "../hooks/useProgress";
import ProgressBar from "../components/ProgressBar";
import OptionButton from "../components/OptionButton";
import FeedbackPanel from "../components/FeedbackPanel";
import ShareSummaryCard from "../components/ShareSummaryCard";
import { BADGE_CATALOG } from "../utils/badges";
import { trackEvent } from "../utils/analytics";
import "./QuizPage.css";

export default function QuizPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromSim = params.get("from") === "sim";

  const startedAt = useRef(Date.now());
  const scoreRecorded = useRef(false);

  const {
    currentQuestion,
    selectedOption,
    isCorrect,
    showFeedback,
    score,
    isComplete,
    currentQuestionData,
    totalQuestions,
    handleOptionClick,
    handleNextQuestion,
    handleQuizRetryWrong,
    skipQuestionIncorrect,
    resetQuiz,
  } = useQuiz(quizQuestions);

  const { addQuizScore, progress } = useProgress();

  useEffect(() => {
    if (!isComplete || scoreRecorded.current) return;
    scoreRecorded.current = true;
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    addQuizScore(score, totalQuestions, {
      label: `Civics knowledge quiz (${totalQuestions} questions)`,
      durationSec,
    });
    trackEvent("quiz_complete", {
      score,
      total_questions: totalQuestions,
      duration_sec: durationSec,
    });
  }, [isComplete, score, totalQuestions, addQuizScore]);

  const resetRun = () => {
    scoreRecorded.current = false;
    startedAt.current = Date.now();
    resetQuiz();
  };

  const onNextCorrect = () => {
    handleNextQuestion();
  };

  const handleRetake = () => {
    resetRun();
  };

  if (isComplete) {
    const finalPercent = Math.round((score / totalQuestions) * 100);
    const badgeTitles = (progress.badges ?? [])
      .map((id) => BADGE_CATALOG[id]?.title)
      .filter(Boolean);
    return (
      <div className="quiz-page" id="quiz-page">
        <div className="quiz-complete">
          <div className="complete-icon-wrap">
            <span className="material-symbols-outlined dc-animate-check">
              {finalPercent >= 80 ? "emoji_events" : finalPercent >= 50 ? "thumb_up" : "school"}
            </span>
          </div>
          <h2>Quiz complete</h2>
          <div className="score-card">
            <span className="score-big">
              {score}/{totalQuestions}
            </span>
            <span className="score-percent">{finalPercent}%</span>
          </div>
          <p className="quiz-complete-blurb">
            {finalPercent >= 80
              ? "Strong work — you're building real election literacy."
              : finalPercent >= 50
                ? "Solid effort. Revisit the simulations to lock in the gaps."
                : "Keep practicing — every run makes the process less mysterious."}
          </p>
          {badgeTitles.length > 0 ? (
            <p className="quiz-badges-line">Badges in play: {badgeTitles.join(" · ")}</p>
          ) : null}

          <ShareSummaryCard
            title="Democrazy learner"
            headline="Civics quiz complete"
            scoreLabel={`${score}/${totalQuestions}`}
            sublabel={fromSim ? "Journey: simulation → quiz" : "Journey: quiz mode"}
            badges={badgeTitles}
          />

          <div className="complete-actions">
            <button className="btn-primary-hero" onClick={handleRetake} type="button">
              <span>Retake quiz</span>
            </button>
            <button className="btn-secondary-hero" onClick={() => navigate("/dashboard")} type="button">
              <span>View dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page" id="quiz-page">
      <div className="quiz-container">
        {fromSim ? (
          <p className="quiz-from-sim-banner" role="status">
            Quiz linked from your simulation — same learning path, quick check.
          </p>
        ) : null}

        <div className="quiz-header">
          <h1 className="quiz-title">Knowledge quiz</h1>
          <ProgressBar
            current={currentQuestion + (showFeedback ? 1 : 0)}
            total={totalQuestions}
            label="Quiz progress"
          />
        </div>

        <div className="quiz-question-card">
          <div className="question-number">
            Question {currentQuestion + 1} of {totalQuestions}
          </div>
          <h2 className="question-text">{currentQuestionData.question}</h2>

          <div className="quiz-options">
            {currentQuestionData.options.map((opt, i) => (
              <OptionButton
                key={i}
                text={opt.text}
                index={i}
                isSelected={selectedOption === i}
                isCorrect={opt.correct}
                showFeedback={showFeedback}
                disabled={showFeedback}
                onClick={handleOptionClick}
              />
            ))}
          </div>

          {showFeedback && (
            <FeedbackPanel
              variant="quiz"
              isCorrect={isCorrect}
              feedback={
                isCorrect
                  ? "Spot on — that answer matches how the process usually works."
                  : "Not quite — skim the learn-why note, then retry or move on."
              }
              explanation={currentQuestionData.explanation}
              onRetry={handleQuizRetryWrong}
              onNext={onNextCorrect}
              onContinueAnyway={isCorrect === false ? skipQuestionIncorrect : undefined}
              continueAnywayLabel="Next question (counts as missed)"
              nextLabel={currentQuestion + 1 >= totalQuestions ? "See results" : "Next question"}
            />
          )}
        </div>

        <div className="quiz-score-strip">
          <span className="material-symbols-outlined">scoreboard</span>
          <span>
            Score {score}/{totalQuestions} · answered {Math.min(currentQuestion + (showFeedback ? 1 : 0), totalQuestions)}/
            {totalQuestions}
          </span>
        </div>
      </div>
    </div>
  );
}
