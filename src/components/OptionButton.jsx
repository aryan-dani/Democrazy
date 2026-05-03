import { memo } from "react";
import "./OptionButton.css";

/**
 * Reusable button for quiz and simulation options.
 * Handles styling for selected, correct, and incorrect states.
 *
 * @param {Object} props
 * @param {string} props.text - The text of the option.
 * @param {number} props.index - The index of the option (used for letter mapping A, B, etc).
 * @param {boolean} props.isSelected - Whether the user has selected this option.
 * @param {boolean} [props.isCorrect] - Whether the option is correct (classic/quiz modes).
 * @param {boolean} props.showFeedback - Whether to show correctness feedback.
 * @param {boolean} props.disabled - Whether the button is disabled.
 * @param {Function} props.onClick - Click handler, receives the index.
 * @param {"classic"|"agent"} [props.variant="classic"] - The visual variant to use.
 */
const OptionButton = memo(function OptionButton({
  text,
  index,
  isSelected,
  isCorrect,
  showFeedback,
  disabled,
  onClick,
  variant = "classic",
}) {
  const letter = String.fromCharCode(65 + index);
  const isAgentVariant = variant === "agent";

  let stateClass = "";
  if (isAgentVariant) {
    stateClass = isSelected ? "option-agent-active" : "";
  } else if (showFeedback && isSelected) {
    stateClass = isCorrect ? "option-correct dc-animate-pop" : "option-wrong dc-animate-shake";
  } else if (showFeedback && !isSelected && isCorrect) {
    stateClass = "option-was-correct";
  }

  return (
    <button
      className={`option-button ${stateClass} ${disabled ? "option-disabled" : ""}`}
      onClick={() => onClick(index)}
      disabled={disabled}
      id={`option-button-${index}`}
      type="button"
      aria-label={`Option ${letter}: ${text}`}
      aria-pressed={isSelected}
    >
      <span className="option-letter" aria-hidden>
        {letter}
      </span>
      <span className="option-text" aria-hidden>
        {text}
      </span>
      {!isAgentVariant && showFeedback && isSelected && (
        <span className="material-symbols-outlined option-icon" aria-hidden>
          {isCorrect ? "check_circle" : "cancel"}
        </span>
      )}
    </button>
  );
});

export default OptionButton;
