import { useMemo, useRef } from "react";
import type { MazeResult, Position } from "../core/mazeGenerator";
import styles from "./MazeBoard.module.css";

interface MazeBoardProps {
  maze: MazeResult;
  playerPosition: Position | null;
  goalCellRef?: React.RefObject<HTMLDivElement | null>;
}

function buildStatusText(maze: MazeResult, pos: Position | null): string {
  if (!pos) return "";
  const cell = maze.grid[pos.row]?.[pos.col];
  if (!cell) return "";

  const walls: string[] = [];
  if (cell.walls.top) walls.push("上");
  if (cell.walls.right) walls.push("右");
  if (cell.walls.bottom) walls.push("下");
  if (cell.walls.left) walls.push("左");

  const wallText = walls.length > 0 ? `壁: ${walls.join("、")}` : "壁なし";
  return `x=${pos.col + 1}, y=${pos.row + 1}。${wallText}`;
}

export function MazeBoard({ maze, playerPosition, goalCellRef }: MazeBoardProps) {
  const { grid, goal } = maze;
  const cols = grid[0]!.length;

  const hadPlayerRef = useRef(false);
  const statusText = useMemo(() => {
    if (!playerPosition) return "";
    const base = buildStatusText(maze, playerPosition);
    if (!hadPlayerRef.current) {
      hadPlayerRef.current = true;
      return `ゲームが始まりました。あなたは迷路の中にいます。${base}`;
    }
    return base;
  }, [maze, playerPosition]);

  return (
    <div
      className={styles.board}
      data-testid="maze-board"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        data-testid="maze-status"
      >
        {statusText}
      </div>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isPlayer =
            playerPosition !== null &&
            playerPosition.row === rowIndex &&
            playerPosition.col === colIndex;
          const isGoal = goal.row === rowIndex && goal.col === colIndex;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={styles.cell}
              data-testid={`maze-cell-${rowIndex}-${colIndex}`}
              data-wall-top={String(cell.walls.top)}
              data-wall-right={String(cell.walls.right)}
              data-wall-bottom={String(cell.walls.bottom)}
              data-wall-left={String(cell.walls.left)}
              data-player={isPlayer ? "true" : undefined}
              data-goal={isGoal ? "true" : undefined}
              ref={isGoal ? goalCellRef : undefined}
              style={{
                borderTop: cell.walls.top ? undefined : "none",
                borderRight: cell.walls.right ? undefined : "none",
                borderBottom: cell.walls.bottom ? undefined : "none",
                borderLeft: cell.walls.left ? undefined : "none",
              }}
            >
              {isPlayer && (
                <span className={styles.player} data-testid="player-marker" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
