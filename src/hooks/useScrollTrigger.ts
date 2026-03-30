import { useCallback, useEffect, useRef, useState } from "react";

export interface ScrollTriggerState {
  isTriggered: boolean;
  isDismissed: boolean;
  dismiss: () => void;
}

export function useScrollTrigger(): ScrollTriggerState {
  const [isTriggered, setIsTriggered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    setIsTriggered(false);
    setIsDismissed(true);
    dismissedRef.current = true;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissedRef.current) return;

      const maxScrollTop =
        document.documentElement.scrollHeight - window.innerHeight;
      const threshold = Math.min(maxScrollTop * 0.2, 100);

      if (window.scrollY >= threshold) {
        setIsTriggered(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isTriggered, isDismissed, dismiss };
}
