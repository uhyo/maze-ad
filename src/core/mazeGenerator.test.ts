import { describe, expect, it } from "vitest";
import {
  generateMaze,
  type MazeGrid,
  type Position,
} from "./mazeGenerator";

/** BFS to check if a path exists between two positions in the maze */
function hasPath(grid: MazeGrid, from: Position, to: Position): boolean {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visited = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  const queue: Position[] = [from];
  visited[from.row]![from.col] = true;

  const directions = [
    { dr: -1, dc: 0, wall: "top" as const, opposite: "bottom" as const },
    { dr: 0, dc: 1, wall: "right" as const, opposite: "left" as const },
    { dr: 1, dc: 0, wall: "bottom" as const, opposite: "top" as const },
    { dr: 0, dc: -1, wall: "left" as const, opposite: "right" as const },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.row === to.row && current.col === to.col) {
      return true;
    }

    for (const dir of directions) {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr]![nc]) continue;

      const currentCell = grid[current.row]![current.col]!;
      if (!currentCell.walls[dir.wall]) {
        visited[nr]![nc] = true;
        queue.push({ row: nr, col: nc });
      }
    }
  }

  return false;
}

/** Count all reachable cells from a starting position */
function countReachable(grid: MazeGrid, from: Position): number {
  const rows = grid.length;
  const cols = grid[0]!.length;
  const visited = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  const queue: Position[] = [from];
  visited[from.row]![from.col] = true;
  let count = 1;

  const directions = [
    { dr: -1, dc: 0, wall: "top" as const },
    { dr: 0, dc: 1, wall: "right" as const },
    { dr: 1, dc: 0, wall: "bottom" as const },
    { dr: 0, dc: -1, wall: "left" as const },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const dir of directions) {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr]![nc]) continue;

      const currentCell = grid[current.row]![current.col]!;
      if (!currentCell.walls[dir.wall]) {
        visited[nr]![nc] = true;
        queue.push({ row: nr, col: nc });
        count++;
      }
    }
  }

  return count;
}

describe("generateMaze", () => {
  describe("grid dimensions", () => {
    it("returns a grid matching the requested rows and columns", () => {
      const result = generateMaze({ rows: 10, cols: 8 });
      expect(result.grid).toHaveLength(10);
      for (const row of result.grid) {
        expect(row).toHaveLength(8);
      }
    });

    it("works with minimum grid size 5x5", () => {
      const result = generateMaze({ rows: 5, cols: 5 });
      expect(result.grid).toHaveLength(5);
      for (const row of result.grid) {
        expect(row).toHaveLength(5);
      }
    });

    it("works with non-square grids", () => {
      const result = generateMaze({ rows: 7, cols: 12 });
      expect(result.grid).toHaveLength(7);
      for (const row of result.grid) {
        expect(row).toHaveLength(12);
      }
    });
  });

  describe("entrance and goal placement", () => {
    it("places entrance within the top-left region", () => {
      const result = generateMaze({ rows: 10, cols: 10 });
      expect(result.entrance.row).toBeLessThan(Math.ceil(10 / 2));
      expect(result.entrance.col).toBeLessThan(Math.ceil(10 / 2));
    });

    it("places goal within the bottom-right region", () => {
      const result = generateMaze({ rows: 10, cols: 10 });
      expect(result.goal.row).toBeGreaterThanOrEqual(Math.floor(10 / 2));
      expect(result.goal.col).toBeGreaterThanOrEqual(Math.floor(10 / 2));
    });

    it("places entrance and goal within grid bounds", () => {
      const result = generateMaze({ rows: 8, cols: 6 });
      expect(result.entrance.row).toBeGreaterThanOrEqual(0);
      expect(result.entrance.row).toBeLessThan(8);
      expect(result.entrance.col).toBeGreaterThanOrEqual(0);
      expect(result.entrance.col).toBeLessThan(6);
      expect(result.goal.row).toBeGreaterThanOrEqual(0);
      expect(result.goal.row).toBeLessThan(8);
      expect(result.goal.col).toBeGreaterThanOrEqual(0);
      expect(result.goal.col).toBeLessThan(6);
    });
  });

  describe("path solvability", () => {
    it("has a valid path from entrance to goal", () => {
      const result = generateMaze({ rows: 10, cols: 10 });
      expect(hasPath(result.grid, result.entrance, result.goal)).toBe(true);
    });

    it("all cells are reachable from the entrance", () => {
      const result = generateMaze({ rows: 10, cols: 10 });
      const totalCells = 10 * 10;
      expect(countReachable(result.grid, result.entrance)).toBe(totalCells);
    });

    it("has a solvable path for minimum 5x5 grid", () => {
      const result = generateMaze({ rows: 5, cols: 5 });
      expect(hasPath(result.grid, result.entrance, result.goal)).toBe(true);
      expect(countReachable(result.grid, result.entrance)).toBe(25);
    });
  });

  describe("wall consistency", () => {
    it("maintains symmetrical walls between adjacent cells", () => {
      const result = generateMaze({ rows: 8, cols: 8 });
      const { grid } = result;

      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r]!.length; c++) {
          const cell = grid[r]![c]!;

          // Check right wall consistency
          if (c < grid[r]!.length - 1) {
            const rightNeighbor = grid[r]![c + 1]!;
            expect(cell.walls.right).toBe(rightNeighbor.walls.left);
          }

          // Check bottom wall consistency
          if (r < grid.length - 1) {
            const bottomNeighbor = grid[r + 1]![c]!;
            expect(cell.walls.bottom).toBe(bottomNeighbor.walls.top);
          }
        }
      }
    });

    it("has walls on all outer edges of the grid", () => {
      const result = generateMaze({ rows: 6, cols: 6 });
      const { grid } = result;
      const rows = grid.length;
      const cols = grid[0]!.length;

      // Top edge
      for (let c = 0; c < cols; c++) {
        expect(grid[0]![c]!.walls.top).toBe(true);
      }
      // Bottom edge
      for (let c = 0; c < cols; c++) {
        expect(grid[rows - 1]![c]!.walls.bottom).toBe(true);
      }
      // Left edge
      for (let r = 0; r < rows; r++) {
        expect(grid[r]![0]!.walls.left).toBe(true);
      }
      // Right edge
      for (let r = 0; r < rows; r++) {
        expect(grid[r]![cols - 1]!.walls.right).toBe(true);
      }
    });
  });

  describe("cell structure", () => {
    it("every cell has a walls object with four boolean properties", () => {
      const result = generateMaze({ rows: 5, cols: 5 });
      for (const row of result.grid) {
        for (const cell of row) {
          expect(cell.walls).toBeDefined();
          expect(typeof cell.walls.top).toBe("boolean");
          expect(typeof cell.walls.right).toBe("boolean");
          expect(typeof cell.walls.bottom).toBe("boolean");
          expect(typeof cell.walls.left).toBe("boolean");
        }
      }
    });
  });
});
