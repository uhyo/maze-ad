import { useCallback, useEffect, useState } from "react";
import type { Cell, MazeGrid, Position } from "../core/mazeGenerator";

export type Direction = "up" | "down" | "left" | "right";

export interface PlayerMovementState {
  position: Position;
  move: (direction: Direction) => void;
}

const directionDelta: Record<Direction, { dr: number; dc: number; wall: keyof Cell["walls"] }> = {
  up: { dr: -1, dc: 0, wall: "top" },
  down: { dr: 1, dc: 0, wall: "bottom" },
  left: { dr: 0, dc: -1, wall: "left" },
  right: { dr: 0, dc: 1, wall: "right" },
};

export function usePlayerMovement(
  maze: MazeGrid,
  startPosition: Position,
  isActive: boolean
): PlayerMovementState {
  const [position, setPosition] = useState<Position>(startPosition);

  const move = useCallback(
    (direction: Direction) => {
      if (!isActive) return;

      setPosition((current) => {
        const { dr, dc, wall } = directionDelta[direction];
        const cell = maze[current.row]?.[current.col];
        if (!cell) return current;

        // Check wall in the requested direction
        if (cell.walls[wall]) return current;

        const newRow = current.row + dr;
        const newCol = current.col + dc;

        // Check grid boundaries
        if (
          newRow < 0 ||
          newRow >= maze.length ||
          newCol < 0 ||
          newCol >= (maze[0]?.length ?? 0)
        ) {
          return current;
        }

        return { row: newRow, col: newCol };
      });
    },
    [maze, isActive]
  );

  // Keyboard arrow key handling
  useEffect(() => {
    if (!isActive) return;

    const keyToDirection: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = keyToDirection[e.key];
      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, move]);

  return { position, move };
}
