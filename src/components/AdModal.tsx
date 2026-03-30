import { useEffect, useRef, useState } from "react";
import { useMazeGame } from "../hooks/useMazeGame";
import type { CloseButtonPhase } from "./CloseButton";
import { CloseButton } from "./CloseButton";
import { MazeBoard } from "./MazeBoard";
import { MobileControls } from "./MobileControls";
import { ModalOverlay } from "./ModalOverlay";
import styles from "./AdModal.module.css";

interface AdModalProps {
  onDismiss: () => void;
}

export function AdModal({ onDismiss }: AdModalProps) {
  const { phase, maze, playerPosition, startEscape, onEscapeAnimationEnd, move } =
    useMazeGame();
  const goalCellRef = useRef<HTMLDivElement>(null);
  const [dismissing, setDismissing] = useState(false);

  // Start fade-out when game is completed
  useEffect(() => {
    if (phase === "completed") {
      setDismissing(true);
    }
  }, [phase]);

  const handleFadeOutEnd = () => {
    if (dismissing) {
      onDismiss();
    }
  };

  // Map game phase to close button phase (idle is never reached in practice)
  const closeButtonPhase: CloseButtonPhase = phase === "idle" ? "ad-visible" : phase;

  return (
    <ModalOverlay>
      <div
        className={`${styles.adContainer} ${dismissing ? styles.fadeOut : ""}`}
        data-testid="ad-container"
        onAnimationEnd={handleFadeOutEnd}
      >
        <span className={styles.adLabel}>AD</span>
        <CloseButton
          phase={closeButtonPhase}
          goalCellRef={goalCellRef}
          onEscapeStart={startEscape}
          onEscapeComplete={onEscapeAnimationEnd}
        />
        <div className={styles.adHeader}>
          <h2 className={styles.adTitle}>迷路で脳トレ！</h2>
          <p className={styles.adSubtitle}>全世界1,000万DL突破の大人気パズル</p>
        </div>
        <div className={styles.mazeContent} data-testid="maze-content">
          {maze && (
            <MazeBoard
              maze={maze}
              playerPosition={playerPosition}
              goalCellRef={goalCellRef}
            />
          )}
          {phase !== "playing" && phase !== "completed" && (
            <div className={styles.mazeOverlay} data-testid="maze-overlay">
              <span className={styles.gameName}>Maze Master</span>
              <span className={styles.ctaButton}>今すぐ無料でプレイ！</span>
            </div>
          )}
        </div>
        <MobileControls move={move} visible={phase === "playing"} />
      </div>
    </ModalOverlay>
  );
}
