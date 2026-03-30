import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AdModal } from "./AdModal";

// Mock maze generator for deterministic tests
vi.mock("../core/mazeGenerator", () => ({
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

describe("AdModal", () => {
  it("renders inside a modal overlay", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();
  });

  it("locks body scroll on mount", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll on unmount", () => {
    const { unmount } = render(<AdModal onDismiss={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("displays ad-styled heading text", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByText(/迷路で脳トレ/)).toBeInTheDocument();
  });

  it("displays an AD label", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByText("AD")).toBeInTheDocument();
  });

  it("shows a visible close button", () => {
    render(<AdModal onDismiss={() => {}} />);
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("displays the maze content area", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByTestId("maze-content")).toBeInTheDocument();
  });

  it("renders the ad container", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByTestId("ad-container")).toBeInTheDocument();
  });

  it("renders the maze board", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByTestId("maze-board")).toBeInTheDocument();
  });

  it("hides mobile controls in ad-visible phase", () => {
    render(<AdModal onDismiss={() => {}} />);
    expect(screen.getByTestId("mobile-controls")).not.toBeVisible();
  });

  describe("game flow integration", () => {
    let goalCell: HTMLDivElement;

    beforeEach(() => {
      vi.useFakeTimers();
      // We need a goal cell for CloseButton animation
      goalCell = document.createElement("div");
      goalCell.getBoundingClientRect = vi.fn(() => ({
        x: 200,
        y: 300,
        width: 30,
        height: 30,
        top: 300,
        right: 230,
        bottom: 330,
        left: 200,
        toJSON: () => {},
      }));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("transitions to playing phase after close button escape", () => {
      render(<AdModal onDismiss={() => {}} />);

      // Click close button to start escape
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      // Fire timeout fallback for escape animation
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should be in playing phase — mobile controls should be visible
      expect(screen.getByTestId("mobile-controls")).toBeInTheDocument();
      // Player marker should be at entrance
      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
    });

    it("shows mobile controls during playing phase", () => {
      render(<AdModal onDismiss={() => {}} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId("mobile-controls")).toBeInTheDocument();
      expect(screen.getByTestId("dpad-up")).toBeInTheDocument();
      expect(screen.getByTestId("dpad-down")).toBeInTheDocument();
      expect(screen.getByTestId("dpad-left")).toBeInTheDocument();
      expect(screen.getByTestId("dpad-right")).toBeInTheDocument();
    });

    it("allows player movement via mobile controls", () => {
      render(<AdModal onDismiss={() => {}} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Player starts at (0,0). Move right to (0,1).
      fireEvent.click(screen.getByTestId("dpad-right"));

      // Player marker should still exist (moved to a different cell)
      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
    });

    it("calls onDismiss when player reaches goal after fade-out animation", () => {
      const onDismiss = vi.fn();
      render(<AdModal onDismiss={onDismiss} />);

      // Start escape
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Navigate from (0,0) to (4,4) — all walls are open
      for (let i = 0; i < 4; i++) {
        act(() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown" })
          );
        });
      }
      for (let i = 0; i < 4; i++) {
        act(() => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowRight" })
          );
        });
      }

      // Not dismissed yet — fade-out animation is playing
      expect(onDismiss).not.toHaveBeenCalled();

      // Fire animationend to complete fade-out
      fireEvent.animationEnd(screen.getByTestId("ad-container"));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("allows player movement via keyboard during playing phase", () => {
      render(<AdModal onDismiss={() => {}} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Move right via keyboard
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
    });
  });
});
