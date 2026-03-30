import { useCallback, useEffect, useMemo, useState } from "react";
import { generateMaze, type MazeResult, type Position } from "../core/mazeGenerator";
import { usePlayerMovement, type Direction } from "./usePlayerMovement";

export type GamePhase = "idle" | "ad-visible" | "escaping" | "playing" | "completed";

export interface MazeGameState {
  phase: GamePhase;
  maze: MazeResult | null;
  playerPosition: Position | null;
  startEscape: () => void;
  onEscapeAnimationEnd: () => void;
  move: (direction: Direction) => void;
}

export function useMazeGame(): MazeGameState {
  const [phase, setPhase] = useState<GamePhase>("ad-visible");
  const maze = useMemo(() => generateMaze({ rows: 10, cols: 10 }), []);

  const isPlaying = phase === "playing";

  const { position: playerMovementPosition, move } = usePlayerMovement(
    maze.grid,
    maze.entrance,
    isPlaying
  );

  const playerPosition = isPlaying || phase === "completed" ? playerMovementPosition : null;

  const startEscape = useCallback(() => {
    setPhase((current) => {
      if (current === "ad-visible") return "escaping";
      return current;
    });
  }, []);

  const onEscapeAnimationEnd = useCallback(() => {
    setPhase((current) => {
      if (current === "escaping") return "playing";
      return current;
    });
  }, []);

  // Detect when player reaches the goal
  useEffect(() => {
    if (
      phase === "playing" &&
      playerMovementPosition.row === maze.goal.row &&
      playerMovementPosition.col === maze.goal.col
    ) {
      setPhase("completed");
    }
  }, [phase, playerMovementPosition, maze.goal]);

  return {
    phase,
    maze,
    playerPosition,
    startEscape,
    onEscapeAnimationEnd,
    move,
  };
}
