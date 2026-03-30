import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useMazeGame } from "./useMazeGame";

// Mock maze generator to produce deterministic results
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

describe("useMazeGame", () => {
  it("starts in ad-visible phase with a generated maze", () => {
    const { result } = renderHook(() => useMazeGame());

    expect(result.current.phase).toBe("ad-visible");
    expect(result.current.maze).not.toBeNull();
    expect(result.current.maze!.grid.length).toBe(5);
    expect(result.current.maze!.entrance).toEqual({ row: 0, col: 0 });
    expect(result.current.maze!.goal).toEqual({ row: 4, col: 4 });
  });

  it("has null playerPosition in ad-visible phase", () => {
    const { result } = renderHook(() => useMazeGame());
    expect(result.current.playerPosition).toBeNull();
  });

  it("transitions to escaping phase when startEscape is called", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });

    expect(result.current.phase).toBe("escaping");
  });

  it("transitions to playing phase on onEscapeAnimationEnd", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    expect(result.current.phase).toBe("playing");
  });

  it("sets playerPosition to entrance when playing phase begins", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    expect(result.current.playerPosition).toEqual({ row: 0, col: 0 });
  });

  it("exposes a move function", () => {
    const { result } = renderHook(() => useMazeGame());
    expect(typeof result.current.move).toBe("function");
  });

  it("allows movement during playing phase", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    // All walls are false in our mock, so movement should work
    act(() => {
      result.current.move("right");
    });

    expect(result.current.playerPosition).toEqual({ row: 0, col: 1 });
  });

  it("transitions to completed when player reaches goal", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    // Move from (0,0) to (4,4) — all walls are open in mock
    for (let r = 0; r < 4; r++) {
      act(() => {
        result.current.move("down");
      });
    }
    for (let c = 0; c < 4; c++) {
      act(() => {
        result.current.move("right");
      });
    }

    expect(result.current.playerPosition).toEqual({ row: 4, col: 4 });
    expect(result.current.phase).toBe("completed");
  });

  it("does not allow movement after completed phase", () => {
    const { result } = renderHook(() => useMazeGame());

    act(() => {
      result.current.startEscape();
    });
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    // Reach goal
    for (let r = 0; r < 4; r++) {
      act(() => {
        result.current.move("down");
      });
    }
    for (let c = 0; c < 4; c++) {
      act(() => {
        result.current.move("right");
      });
    }

    expect(result.current.phase).toBe("completed");

    // Try to move after completion
    act(() => {
      result.current.move("left");
    });

    // Position should not change
    expect(result.current.playerPosition).toEqual({ row: 4, col: 4 });
  });

  it("does not transition phases out of order", () => {
    const { result } = renderHook(() => useMazeGame());

    // Can't skip directly to playing without escaping first
    act(() => {
      result.current.onEscapeAnimationEnd();
    });

    // Should still be ad-visible since we didn't start escape first
    expect(result.current.phase).toBe("ad-visible");
  });
});
