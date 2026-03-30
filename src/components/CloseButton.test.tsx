import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { CloseButton } from "./CloseButton";

describe("CloseButton", () => {
  describe("7.1 - Trigger escape on hover, click, or tap", () => {
    it("renders a close button in ad-visible phase", () => {
      render(
        <CloseButton
          phase="ad-visible"
          goalCellRef={{ current: null }}
          onEscapeStart={() => {}}
          onEscapeComplete={() => {}}
        />
      );
      expect(
        screen.getByRole("button", { name: /close/i })
      ).toBeInTheDocument();
    });

    it("calls onEscapeStart on mouseenter in ad-visible phase", () => {
      const onEscapeStart = vi.fn();
      render(
        <CloseButton
          phase="ad-visible"
          goalCellRef={{ current: null }}
          onEscapeStart={onEscapeStart}
          onEscapeComplete={() => {}}
        />
      );
      fireEvent.mouseEnter(screen.getByRole("button", { name: /close/i }));
      expect(onEscapeStart).toHaveBeenCalledTimes(1);
    });

    it("calls onEscapeStart on click in ad-visible phase", () => {
      const onEscapeStart = vi.fn();
      render(
        <CloseButton
          phase="ad-visible"
          goalCellRef={{ current: null }}
          onEscapeStart={onEscapeStart}
          onEscapeComplete={() => {}}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(onEscapeStart).toHaveBeenCalledTimes(1);
    });

    it("calls onEscapeStart on touchstart in ad-visible phase", () => {
      const onEscapeStart = vi.fn();
      render(
        <CloseButton
          phase="ad-visible"
          goalCellRef={{ current: null }}
          onEscapeStart={onEscapeStart}
          onEscapeComplete={() => {}}
        />
      );
      fireEvent.touchStart(screen.getByRole("button", { name: /close/i }));
      expect(onEscapeStart).toHaveBeenCalledTimes(1);
    });

    it("does not call onEscapeStart when phase is escaping", () => {
      const onEscapeStart = vi.fn();
      vi.useFakeTimers();
      const goalCell = document.createElement("div");
      document.body.appendChild(goalCell);

      render(
        <CloseButton
          phase="escaping"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={onEscapeStart}
          onEscapeComplete={() => {}}
        />
      );
      const button = screen.getByRole("button", { name: /close/i });
      fireEvent.click(button);
      fireEvent.mouseEnter(button);
      fireEvent.touchStart(button);
      expect(onEscapeStart).not.toHaveBeenCalled();

      document.body.removeChild(goalCell);
      vi.useRealTimers();
    });
  });

  describe("7.2 - Escape animation", () => {
    let goalCell: HTMLDivElement;

    beforeEach(() => {
      vi.useFakeTimers();
      goalCell = document.createElement("div");
      document.body.appendChild(goalCell);
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
      document.body.removeChild(goalCell);
      vi.useRealTimers();
    });

    it("applies CSS transform to animate toward goal cell in escaping phase", () => {
      render(
        <CloseButton
          phase="escaping"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={() => {}}
        />
      );
      const button = screen.getByRole("button", { name: /close/i });
      expect(button.style.transform).toContain("translate");
    });

    it("calls onEscapeComplete on transitionend event", () => {
      const onEscapeComplete = vi.fn();
      render(
        <CloseButton
          phase="escaping"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={onEscapeComplete}
        />
      );
      const button = screen.getByRole("button", { name: /close/i });
      fireEvent.transitionEnd(button);
      expect(onEscapeComplete).toHaveBeenCalledTimes(1);
    });

    it("calls onEscapeComplete via timeout fallback after 1 second", () => {
      const onEscapeComplete = vi.fn();
      render(
        <CloseButton
          phase="escaping"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={onEscapeComplete}
        />
      );
      expect(onEscapeComplete).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onEscapeComplete).toHaveBeenCalledTimes(1);
    });

    it("does not double-call onEscapeComplete if transitionend fires before timeout", () => {
      const onEscapeComplete = vi.fn();
      render(
        <CloseButton
          phase="escaping"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={onEscapeComplete}
        />
      );
      const button = screen.getByRole("button", { name: /close/i });
      fireEvent.transitionEnd(button);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onEscapeComplete).toHaveBeenCalledTimes(1);
    });

    it("does not render the button in playing phase", () => {
      render(
        <CloseButton
          phase="playing"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={() => {}}
        />
      );
      expect(
        screen.queryByRole("button", { name: /close/i })
      ).not.toBeInTheDocument();
    });

    it("does not render the button in completed phase", () => {
      render(
        <CloseButton
          phase="completed"
          goalCellRef={{ current: goalCell }}
          onEscapeStart={() => {}}
          onEscapeComplete={() => {}}
        />
      );
      expect(
        screen.queryByRole("button", { name: /close/i })
      ).not.toBeInTheDocument();
    });
  });
});
