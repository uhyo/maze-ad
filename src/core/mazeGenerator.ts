export interface Cell {
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}

export type MazeGrid = Cell[][];

export interface MazeConfig {
  rows: number;
  cols: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface MazeResult {
  grid: MazeGrid;
  entrance: Position;
  goal: Position;
}

type WallKey = "top" | "right" | "bottom" | "left";

const oppositeWall: Record<WallKey, WallKey> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

const directionOffsets: { wall: WallKey; dr: number; dc: number }[] = [
  { wall: "top", dr: -1, dc: 0 },
  { wall: "right", dr: 0, dc: 1 },
  { wall: "bottom", dr: 1, dc: 0 },
  { wall: "left", dr: 0, dc: -1 },
];

function createGrid(rows: number, cols: number): MazeGrid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      walls: { top: true, right: true, bottom: true, left: true },
    }))
  );
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

/**
 * Generate a solvable maze using iterative DFS (recursive backtracker).
 * Entrance is placed at top-left (0,0), goal at bottom-right (rows-1, cols-1).
 */
export function generateMaze(config: MazeConfig): MazeResult {
  const rows = Math.max(config.rows, 5);
  const cols = Math.max(config.cols, 5);

  const grid = createGrid(rows, cols);
  const visited = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false)
  );

  // Iterative DFS with explicit stack
  const stack: Position[] = [{ row: 0, col: 0 }];
  visited[0]![0] = true;

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!;
    const neighbors = shuffle([...directionOffsets]).filter((dir) => {
      const nr = current.row + dir.dr;
      const nc = current.col + dir.dc;
      return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr]![nc];
    });

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const chosen = neighbors[0]!;
    const nr = current.row + chosen.dr;
    const nc = current.col + chosen.dc;

    // Remove walls between current cell and chosen neighbor
    grid[current.row]![current.col]!.walls[chosen.wall] = false;
    grid[nr]![nc]!.walls[oppositeWall[chosen.wall]] = false;

    visited[nr]![nc] = true;
    stack.push({ row: nr, col: nc });
  }

  return {
    grid,
    entrance: { row: 0, col: 0 },
    goal: { row: rows - 1, col: cols - 1 },
  };
}
