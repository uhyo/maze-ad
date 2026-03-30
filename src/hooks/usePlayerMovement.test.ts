import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePlayerMovement } from "./usePlayerMovement";
import type { MazeGrid } from "../core/mazeGenerator";

/**
 * Helper: create a minimal 3x3 maze grid with all walls intact
 * then selectively remove walls to create known passages.
 */
function createTestGrid(): MazeGrid {
  const grid: MazeGrid = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => ({
      walls: { top: true, right: true, bottom: true, left: true },
    }))
  );
  return grid;
}

/**
 * Remove the wall between two adjacent cells.
 */
function carvePassage(
  grid: MazeGrid,
  r1: number,
  c1: number,
  r2: number,
  c2: number
) {
  if (r2 === r1 - 1) {
    grid[r1]![c1]!.walls.top = false;
    grid[r2]![c2]!.walls.bottom = false;
  } else if (r2 === r1 + 1) {
    grid[r1]![c1]!.walls.bottom = false;
    grid[r2]![c2]!.walls.top = false;
  } else if (c2 === c1 + 1) {
    grid[r1]![c1]!.walls.right = false;
    grid[r2]![c2]!.walls.left = false;
  } else if (c2 === c1 - 1) {
    grid[r1]![c1]!.walls.left = false;
    grid[r2]![c2]!.walls.right = false;
  }
}

describe("usePlayerMovement", () => {
  it("should initialize with the provided start position", () => {
    const grid = createTestGrid();
    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, true)
    );

    expect(result.current.position).toEqual({ row: 0, col: 0 });
  });

  it("should move right when there is no wall", () => {
    const grid = createTestGrid();
    carvePassage(grid, 0, 0, 0, 1); // open right passage from (0,0) to (0,1)

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, true)
    );

    act(() => {
      result.current.move("right");
    });

    expect(result.current.position).toEqual({ row: 0, col: 1 });
  });

  it("should move down when there is no wall", () => {
    const grid = createTestGrid();
    carvePassage(grid, 0, 0, 1, 0); // open bottom passage from (0,0) to (1,0)

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, true)
    );

    act(() => {
      result.current.move("down");
    });

    expect(result.current.position).toEqual({ row: 1, col: 0 });
  });

  it("should move left when there is no wall", () => {
    const grid = createTestGrid();
    carvePassage(grid, 1, 1, 1, 0); // open left passage from (1,1) to (1,0)

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 1, col: 1 }, true)
    );

    act(() => {
      result.current.move("left");
    });

    expect(result.current.position).toEqual({ row: 1, col: 0 });
  });

  it("should move up when there is no wall", () => {
    const grid = createTestGrid();
    carvePassage(grid, 1, 0, 0, 0); // open top passage from (1,0) to (0,0)

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 1, col: 0 }, true)
    );

    act(() => {
      result.current.move("up");
    });

    expect(result.current.position).toEqual({ row: 0, col: 0 });
  });

  it("should block movement into a wall", () => {
    const grid = createTestGrid(); // all walls intact

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 1, col: 1 }, true)
    );

    act(() => {
      result.current.move("right");
    });
    expect(result.current.position).toEqual({ row: 1, col: 1 });

    act(() => {
      result.current.move("left");
    });
    expect(result.current.position).toEqual({ row: 1, col: 1 });

    act(() => {
      result.current.move("up");
    });
    expect(result.current.position).toEqual({ row: 1, col: 1 });

    act(() => {
      result.current.move("down");
    });
    expect(result.current.position).toEqual({ row: 1, col: 1 });
  });

  it("should block movement out of grid boundaries", () => {
    const grid = createTestGrid();
    // Remove top wall of (0,0) — but there's no cell above, so movement should still be blocked
    grid[0]![0]!.walls.top = false;

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, true)
    );

    act(() => {
      result.current.move("up");
    });
    expect(result.current.position).toEqual({ row: 0, col: 0 });
  });

  it("should not process movement when isActive is false", () => {
    const grid = createTestGrid();
    carvePassage(grid, 0, 0, 0, 1);

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, false)
    );

    act(() => {
      result.current.move("right");
    });

    expect(result.current.position).toEqual({ row: 0, col: 0 });
  });

  it("should support sequential moves through a path", () => {
    const grid = createTestGrid();
    carvePassage(grid, 0, 0, 0, 1);
    carvePassage(grid, 0, 1, 1, 1);
    carvePassage(grid, 1, 1, 1, 2);

    const { result } = renderHook(() =>
      usePlayerMovement(grid, { row: 0, col: 0 }, true)
    );

    act(() => result.current.move("right"));
    expect(result.current.position).toEqual({ row: 0, col: 1 });

    act(() => result.current.move("down"));
    expect(result.current.position).toEqual({ row: 1, col: 1 });

    act(() => result.current.move("right"));
    expect(result.current.position).toEqual({ row: 1, col: 2 });
  });

  describe("keyboard arrow key handling", () => {
    it("should move player on ArrowRight keydown", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 0, 1);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, true)
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(result.current.position).toEqual({ row: 0, col: 1 });
    });

    it("should move player on ArrowDown keydown", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 1, 0);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, true)
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown" })
        );
      });

      expect(result.current.position).toEqual({ row: 1, col: 0 });
    });

    it("should move player on ArrowLeft keydown", () => {
      const grid = createTestGrid();
      carvePassage(grid, 1, 1, 1, 0);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 1, col: 1 }, true)
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowLeft" })
        );
      });

      expect(result.current.position).toEqual({ row: 1, col: 0 });
    });

    it("should move player on ArrowUp keydown", () => {
      const grid = createTestGrid();
      carvePassage(grid, 1, 0, 0, 0);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 1, col: 0 }, true)
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowUp" })
        );
      });

      expect(result.current.position).toEqual({ row: 0, col: 0 });
    });

    it("should prevent default on arrow keys when active", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 0, 1);

      renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, true)
      );

      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        cancelable: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(true);
    });

    it("should not respond to non-arrow keys", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 0, 1);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, true)
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      });

      expect(result.current.position).toEqual({ row: 0, col: 0 });
    });

    it("should not respond to arrow keys when isActive is false", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 0, 1);

      const { result } = renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, false)
      );

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      expect(result.current.position).toEqual({ row: 0, col: 0 });
    });

    it("should clean up the event listener on unmount", () => {
      const grid = createTestGrid();
      carvePassage(grid, 0, 0, 0, 1);

      const { result, unmount } = renderHook(() =>
        usePlayerMovement(grid, { row: 0, col: 0 }, true)
      );

      unmount();

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight" })
        );
      });

      // Position should not have changed after unmount
      expect(result.current.position).toEqual({ row: 0, col: 0 });
    });
  });
});
