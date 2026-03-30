import type { Direction } from "../hooks/usePlayerMovement";
import styles from "./MobileControls.module.css";

interface MobileControlsProps {
  move: (direction: Direction) => void;
  visible: boolean;
}

export function MobileControls({ move, visible }: MobileControlsProps) {
  return (
    <div
      className={`${styles.controls} ${visible ? styles.visible : ""}`}
      data-testid="mobile-controls"
      style={visible ? undefined : { visibility: "hidden" }}
    >
      <div className={styles.row}>
        <button
          className={styles.button}
          data-testid="dpad-up"
          aria-label="Up"
          onClick={() => move("up")}
        >
          ▲
        </button>
      </div>
      <div className={styles.row}>
        <button
          className={styles.button}
          data-testid="dpad-left"
          aria-label="Left"
          onClick={() => move("left")}
        >
          ◀
        </button>
        <div className={styles.spacer} />
        <button
          className={styles.button}
          data-testid="dpad-right"
          aria-label="Right"
          onClick={() => move("right")}
        >
          ▶
        </button>
      </div>
      <div className={styles.row}>
        <button
          className={styles.button}
          data-testid="dpad-down"
          aria-label="Down"
          onClick={() => move("down")}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
