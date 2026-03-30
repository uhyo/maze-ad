import type { MazeResult, Position } from "../core/mazeGenerator";
import styles from "./MazeBoard.module.css";

interface MazeBoardProps {
  maze: MazeResult;
  playerPosition: Position | null;
  goalCellRef?: React.RefObject<HTMLDivElement | null>;
}

export function MazeBoard({ maze, playerPosition, goalCellRef }: MazeBoardProps) {
  const { grid, goal } = maze;
  const rows = grid.length;
  const cols = grid[0]!.length;

  return (
    <div
      className={styles.board}
      data-testid="maze-board"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
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
              {isGoal && <span className={styles.goal}>✕</span>}
            </div>
          );
        })
      )}
    </div>
  );
}
