import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { generateMaze } from "../core/mazeGenerator";
import type { MazeResult, Position } from "../core/mazeGenerator";
import { MazeBoard } from "./MazeBoard";

function createTestMaze(): MazeResult {
  return generateMaze({ rows: 5, cols: 5 });
}

describe("MazeBoard", () => {
  describe("5.1 - CSS Grid layout", () => {
    it("renders a grid container", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      expect(screen.getByTestId("maze-board")).toBeInTheDocument();
    });

    it("renders the correct number of cells", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const cells = screen.getAllByTestId(/^maze-cell-/);
      expect(cells).toHaveLength(25); // 5x5 = 25
    });

    it("renders cells with data attributes for row and col", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const cell = screen.getByTestId("maze-cell-0-0");
      expect(cell).toBeInTheDocument();
      const lastCell = screen.getByTestId("maze-cell-4-4");
      expect(lastCell).toBeInTheDocument();
    });

    it("applies wall borders based on cell wall state", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      // The entrance cell (0,0) should have a top wall (border on the outer edge)
      const entranceCell = screen.getByTestId("maze-cell-0-0");
      expect(entranceCell).toBeInTheDocument();
      // We check that cells have the wall data attributes for styling
      const cell = maze.grid[0]![0]!;
      if (cell.walls.top) {
        expect(entranceCell).toHaveAttribute("data-wall-top", "true");
      } else {
        expect(entranceCell).toHaveAttribute("data-wall-top", "false");
      }
    });

    it("sets grid template columns matching maze cols", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const board = screen.getByTestId("maze-board");
      expect(board.style.gridTemplateColumns).toBe("repeat(5, 1fr)");
    });
  });

  describe("5.2 - Player indicator and goal marker", () => {
    it("displays the player indicator at the given position", () => {
      const maze = createTestMaze();
      const playerPosition: Position = { row: 0, col: 0 };
      render(<MazeBoard maze={maze} playerPosition={playerPosition} />);
      const playerCell = screen.getByTestId("maze-cell-0-0");
      expect(playerCell).toHaveAttribute("data-player", "true");
    });

    it("does not display the player indicator when playerPosition is null", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const cells = screen.getAllByTestId(/^maze-cell-/);
      cells.forEach((cell) => {
        expect(cell).not.toHaveAttribute("data-player", "true");
      });
    });

    it("displays the goal marker at the maze goal position", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const goalCell = screen.getByTestId(
        `maze-cell-${maze.goal.row}-${maze.goal.col}`
      );
      expect(goalCell).toHaveAttribute("data-goal", "true");
    });

    it("renders a close button icon inside the goal cell", () => {
      const maze = createTestMaze();
      render(<MazeBoard maze={maze} playerPosition={null} />);
      const goalCell = screen.getByTestId(
        `maze-cell-${maze.goal.row}-${maze.goal.col}`
      );
      expect(goalCell.textContent).toContain("✕");
    });

    it("updates player indicator when position changes", () => {
      const maze = createTestMaze();
      const { rerender } = render(
        <MazeBoard maze={maze} playerPosition={{ row: 0, col: 0 }} />
      );
      expect(screen.getByTestId("maze-cell-0-0")).toHaveAttribute(
        "data-player",
        "true"
      );

      rerender(
        <MazeBoard maze={maze} playerPosition={{ row: 1, col: 0 }} />
      );
      expect(screen.getByTestId("maze-cell-0-0")).not.toHaveAttribute(
        "data-player",
        "true"
      );
      expect(screen.getByTestId("maze-cell-1-0")).toHaveAttribute(
        "data-player",
        "true"
      );
    });

    it("renders a player marker element inside the player cell", () => {
      const maze = createTestMaze();
      render(
        <MazeBoard maze={maze} playerPosition={{ row: 0, col: 0 }} />
      );
      expect(screen.getByTestId("player-marker")).toBeInTheDocument();
    });
  });
});
