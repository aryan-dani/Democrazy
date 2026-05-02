import "./OptionButton.css";

export default function OptionButton({
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
    >
      <span className="option-letter">{letter}</span>
      <span className="option-text">{text}</span>
      {!isAgentVariant && showFeedback && isSelected && (
        <span className="material-symbols-outlined option-icon">
          {isCorrect ? "check_circle" : "cancel"}
        </span>
      )}
    </button>
  );
}
