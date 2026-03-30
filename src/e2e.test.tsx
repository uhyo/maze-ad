import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { App } from "./App";

// Mock maze generator for deterministic tests — all walls open
vi.mock("./core/mazeGenerator", () => ({
  generateMaze: vi.fn(() => ({
    grid: Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({
        walls: { top: false, right: false, bottom: false, left: false },
      }))
    ),
    entrance: { row: 0, col: 0 },
    goal: { row: 4, col: 4 },
  })),
}));

function setScrollState(scrollY: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: 2000,
    writable: true,
    configurable: true,
  });
}

function triggerScrollPastThreshold() {
  // threshold = min((2000-800)*0.2, 100) = 100
  setScrollState(100);
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

function clickCloseButton() {
  const closeButton = screen.getByRole("button", { name: /close/i });
  fireEvent.click(closeButton);
}

function advancePastEscapeAnimation() {
  act(() => {
    vi.advanceTimersByTime(1000);
  });
}

function pressArrowKey(key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

function navigateToGoal() {
  // Move from (0,0) to (4,4) — all walls open
  for (let i = 0; i < 4; i++) pressArrowKey("ArrowDown");
  for (let i = 0; i < 4; i++) pressArrowKey("ArrowRight");
}

function completeFadeOut() {
  fireEvent.animationEnd(screen.getByTestId("ad-container"));
}

describe("End-to-end: complete user journey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("keyboard flow", () => {
    it("full journey: load → scroll → modal → escape → navigate → fade out → dismiss → continue reading", () => {
      // 1. Load page — article is visible
      render(<App />);
      expect(screen.getByRole("article")).toBeInTheDocument();
      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();

      // 2. Scroll past threshold — modal appears
      triggerScrollPastThreshold();
      expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();
      expect(screen.getByTestId("maze-board")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();

      // 3. Body scroll is locked while modal is open
      expect(document.body.style.overflow).toBe("hidden");

      // 4. Interact with close button — starts escape
      clickCloseButton();

      // 5. Escape animation completes (timeout fallback)
      advancePastEscapeAnimation();

      // 6. Game is now in playing phase — player and mobile controls visible
      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
      expect(screen.getByTestId("mobile-controls")).toBeVisible();

      // 7. Navigate maze with keyboard to reach goal
      navigateToGoal();

      // 8. Modal is still showing during fade-out
      expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();

      // 9. Fade-out animation completes
      completeFadeOut();

      // 10. Modal is dismissed — article is readable again
      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();
      expect(screen.getByRole("article")).toBeInTheDocument();

      // 11. Body scroll is restored
      expect(document.body.style.overflow).toBe("");
    });

    it("arrow keys move the player during the game", () => {
      render(<App />);
      triggerScrollPastThreshold();
      clickCloseButton();
      advancePastEscapeAnimation();

      // Player starts at entrance (0,0)
      const entranceCell = screen.getByTestId("maze-cell-0-0");
      expect(entranceCell.getAttribute("data-player")).toBe("true");

      // Move right
      pressArrowKey("ArrowRight");
      const nextCell = screen.getByTestId("maze-cell-0-1");
      expect(nextCell.getAttribute("data-player")).toBe("true");
      expect(entranceCell.getAttribute("data-player")).toBeNull();
    });

    it("non-arrow keys are ignored during the game", () => {
      render(<App />);
      triggerScrollPastThreshold();
      clickCloseButton();
      advancePastEscapeAnimation();

      const entranceCell = screen.getByTestId("maze-cell-0-0");
      expect(entranceCell.getAttribute("data-player")).toBe("true");

      // Press a non-arrow key
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
      });

      // Player should not have moved
      expect(entranceCell.getAttribute("data-player")).toBe("true");
    });
  });

  describe("mobile flow", () => {
    it("full journey using on-screen arrow buttons instead of keyboard", () => {
      render(<App />);

      // Scroll to trigger modal
      triggerScrollPastThreshold();
      expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();

      // Start escape
      clickCloseButton();
      advancePastEscapeAnimation();

      // Mobile controls are visible
      expect(screen.getByTestId("mobile-controls")).toBeVisible();

      // Navigate using D-pad buttons: (0,0) → (4,0) → (4,4)
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByTestId("dpad-down"));
      }
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByTestId("dpad-right"));
      }

      // Fade-out, then dismiss
      completeFadeOut();
      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();
      expect(screen.getByRole("article")).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
    });

    it("D-pad buttons are touch-friendly (minimum 44x44px)", () => {
      render(<App />);
      triggerScrollPastThreshold();
      clickCloseButton();
      advancePastEscapeAnimation();

      const buttons = ["dpad-up", "dpad-down", "dpad-left", "dpad-right"];
      for (const testId of buttons) {
        const button = screen.getByTestId(testId);
        expect(button).toBeInTheDocument();
        expect(button.tagName).toBe("BUTTON");
      }
    });
  });

  describe("re-trigger prevention", () => {
    it("modal does not re-appear after dismissal when scrolling again", () => {
      render(<App />);

      // Complete the full flow
      triggerScrollPastThreshold();
      expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();

      clickCloseButton();
      advancePastEscapeAnimation();
      navigateToGoal();
      completeFadeOut();

      // Modal is dismissed
      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();

      // Scroll again — modal should NOT re-appear
      triggerScrollPastThreshold();
      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();
    });

    it("does not trigger when scroll is below threshold", () => {
      render(<App />);

      setScrollState(50);
      act(() => {
        window.dispatchEvent(new Event("scroll"));
      });

      expect(screen.queryByTestId("modal-overlay")).not.toBeInTheDocument();
    });
  });

  describe("modal state", () => {
    it("displays maze as ad visual content before game starts", () => {
      render(<App />);
      triggerScrollPastThreshold();

      // Maze board is visible as ad content
      expect(screen.getByTestId("maze-board")).toBeInTheDocument();
      // Close button is visible
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
      // Mobile controls are in DOM but hidden
      expect(screen.getByTestId("mobile-controls")).not.toBeVisible();
      // Player marker is NOT visible yet
      expect(screen.queryByTestId("player-marker")).not.toBeInTheDocument();
    });

    it("close button is hidden after escape animation completes", () => {
      render(<App />);
      triggerScrollPastThreshold();

      clickCloseButton();
      advancePastEscapeAnimation();

      // Close button should be removed from DOM in playing phase
      expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    });

    it("ad heading is visible when modal is shown", () => {
      render(<App />);
      triggerScrollPastThreshold();

      expect(screen.getByText(/迷路で脳トレ/)).toBeInTheDocument();
    });
  });
});
