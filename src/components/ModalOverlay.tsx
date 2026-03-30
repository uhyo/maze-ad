import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ModalOverlay.module.css";

interface ModalOverlayProps {
  children: ReactNode;
}

export function ModalOverlay({ children }: ModalOverlayProps) {
  const previousOverflow = useRef("");

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, []);

  return (
    <div className={styles.overlay} data-testid="modal-overlay">
      {children}
    </div>
  );
}
