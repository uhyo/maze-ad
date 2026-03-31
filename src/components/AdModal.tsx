import { useCallback, useEffect, useRef, useState } from "react";
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

let glassFlashKey = 0;

export function AdModal({ onDismiss }: AdModalProps) {
  const { phase, maze, playerPosition, startEscape, onEscapeAnimationEnd, move } =
    useMazeGame();
  const goalCellRef = useRef<HTMLDivElement>(null);
  const [dismissing, setDismissing] = useState(false);
  const [glassFlash, setGlassFlash] = useState<number | null>(null);

  const handleMazeClick = useCallback(() => {
    if (phase !== "playing") return;
    setGlassFlash(++glassFlashKey);
  }, [phase]);

  const handleGlassAnimEnd = useCallback(() => {
    setGlassFlash(null);
  }, []);

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
        <div
          className={`${styles.mazeContent} ${phase === "playing" || phase === "completed" ? styles.mazeContentPlaying : ""}`}
          data-testid="maze-content"
          onClick={handleMazeClick}
        >
          {maze && (
            <MazeBoard
              maze={maze}
              playerPosition={playerPosition}
              goalCellRef={goalCellRef}
            />
          )}
          <div
            className={`${styles.mazeOverlay} ${phase === "playing" || phase === "completed" ? styles.overlayHide : ""}`}
            data-testid="maze-overlay"
          >
            <span className={styles.gameName}>Maze Master</span>
            <a
              className={styles.ctaButton}
              href="https://github.com/uhyo/maze-ad"
              target="_blank"
              rel="noopener noreferrer"
            >今すぐ無料でプレイ！</a>
          </div>
          {glassFlash !== null && (
            <span
              key={glassFlash}
              className={styles.glassReflection}
              onAnimationEnd={handleGlassAnimEnd}
            />
          )}
        </div>
        <MobileControls move={move} visible={phase === "playing"} />
      </div>
    </ModalOverlay>
  );
}
