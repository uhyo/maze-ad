import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ModalOverlay.module.css";

interface ModalOverlayProps {
  children: ReactNode;
}

export function ModalOverlay({ children }: ModalOverlayProps) {
  const previousOverflow = useRef("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Safari ignores overflow:hidden on body — block touch scrolling on the overlay
    const overlay = overlayRef.current;
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    overlay?.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow.current;
      overlay?.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  return (
    <div ref={overlayRef} className={styles.overlay} data-testid="modal-overlay">
      {children}
    </div>
  );
}
