import { useRef, useCallback, useEffect } from "react";
import styles from "./CloseButton.module.css";

export type CloseButtonPhase =
  | "ad-visible"
  | "escaping"
  | "playing"
  | "completed";

interface CloseButtonProps {
  phase: CloseButtonPhase;
  goalCellRef: React.RefObject<HTMLDivElement | null>;
  onEscapeStart: () => void;
  onEscapeComplete: () => void;
}

export function CloseButton({
  phase,
  goalCellRef,
  onEscapeStart,
  onEscapeComplete,
}: CloseButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleInteraction = useCallback(() => {
    if (phase === "ad-visible") {
      onEscapeStart();
    }
  }, [phase, onEscapeStart]);

  useEffect(() => {
    if (phase !== "escaping") return;

    const button = buttonRef.current;
    const goalCell = goalCellRef.current;
    if (!button || !goalCell) return;

    const buttonRect = button.getBoundingClientRect();
    const goalRect = goalCell.getBoundingClientRect();

    const dx =
      goalRect.left +
      goalRect.width / 2 -
      (buttonRect.left + buttonRect.width / 2);
    const dy =
      goalRect.top +
      goalRect.height / 2 -
      (buttonRect.top + buttonRect.height / 2);

    button.style.transform = `translate(${dx}px, ${dy}px)`;

    const handleTransitionEnd = () => {
      clearTimeout(timeout);
      onEscapeComplete();
    };

    button.addEventListener("transitionend", handleTransitionEnd, {
      once: true,
    });

    const timeout = setTimeout(() => {
      button.removeEventListener("transitionend", handleTransitionEnd);
      onEscapeComplete();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      button.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [phase, goalCellRef, onEscapeComplete]);

  const isAtGoal = phase === "playing" || phase === "completed";

  return (
    <button
      ref={buttonRef}
      className={`${styles.closeButton} ${phase === "escaping" ? styles.escaping : ""} ${isAtGoal ? styles.atGoal : ""}`}
      aria-label="Close"
      type="button"
      onMouseEnter={isAtGoal ? undefined : handleInteraction}
      onClick={isAtGoal ? undefined : handleInteraction}
      onTouchStart={isAtGoal ? undefined : handleInteraction}
      data-testid={isAtGoal ? "goal-marker" : undefined}
    >
      ✕
    </button>
  );
}
