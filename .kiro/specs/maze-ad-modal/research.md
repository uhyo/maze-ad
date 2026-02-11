# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.
---

## Summary
- **Feature**: `maze-ad-modal`
- **Discovery Scope**: New Feature (greenfield — no existing source code)
- **Key Findings**:
  - DFS recursive backtracker is the simplest maze generation algorithm, producing long winding corridors ideal for a casual game
  - DOM-based CSS Grid rendering is sufficient for modal-sized mazes (up to ~20x20) and simpler than Canvas
  - IntersectionObserver is the recommended scroll detection approach — zero throttling needed, better performance than scroll event listeners

## Research Log

### Maze Generation Algorithms
- **Context**: Need a solvable maze generation algorithm for a small in-browser casual game
- **Sources Consulted**: Wikipedia (maze generation), Jamis Buck's maze generation series, htmlmaze.online
- **Findings**:
  - **DFS Recursive Backtracker**: Simplest to implement, creates long winding corridors with few dead-ends, aesthetically pleasing. Stack-based approach avoids recursion depth issues.
  - **Prim's Algorithm**: More "organic" look but creates many short dead-ends ("spiky"). More complex implementation.
  - **Kruskal's Algorithm**: Requires union-find data structure. Overkill for a small casual game.
- **Implications**: DFS recursive backtracker selected — simplicity and long corridors make it ideal for a casual game where the user navigates to a goal.

### Maze Data Representation
- **Context**: Need a TypeScript-friendly data structure for the maze grid
- **Findings**:
  - Cell-based 2D array with wall flags (top/right/bottom/left booleans) is the simplest and most intuitive representation
  - Easy to serialize, query, and render
- **Implications**: Use `Cell[][]` grid where each cell tracks its four wall states

### Maze Rendering: DOM Grid vs Canvas
- **Context**: Rendering a maze inside a modal overlay in React
- **Findings**:
  - **DOM (CSS Grid)**: Sufficient for small mazes (up to ~20x20 cells), built-in accessibility, easy CSS styling, simple event handling
  - **Canvas**: Better for large mazes (30x30+), but adds complexity for interactions and accessibility
- **Implications**: DOM-based rendering with CSS Grid chosen — modal-sized maze will be small enough, and DOM approach integrates naturally with React component model

### Scroll Detection
- **Context**: Trigger modal when user scrolls past a threshold
- **Findings**:
  - **IntersectionObserver**: Uses ~23% main thread vs ~49% for scroll listeners. Fires only on threshold crossings. No throttling/debouncing needed.
  - **Scroll event listener**: Simpler mental model but requires manual optimization.
- **Implications**: IntersectionObserver selected — place a sentinel element at the trigger point and observe it

### Modal Overlay & Scroll Lock
- **Context**: Fullscreen modal that blocks background interaction
- **Findings**:
  - `overflow: hidden` on `<body>` is the simplest and most reliable approach for modern browsers (iOS 16.3+)
  - Can wrap in a custom hook for clean mounting/unmounting
- **Implications**: Simple body overflow lock — no external modal library needed

### Close Button Escape Animation
- **Context**: Animate the close button from its corner position into the maze
- **Findings**:
  - **CSS transitions + transform: translate()**: Simple, GPU-accelerated, zero dependencies
  - **FLIP technique**: More powerful for dynamic position calculations, but more complex
  - For this feature, the start position (modal corner) and end position (maze goal cell) can be calculated with `getBoundingClientRect`, then animated with CSS transition on `transform`
- **Implications**: Use CSS transition with calculated translate values. FLIP-style position calculation may be needed to bridge the close button's initial DOM position to its goal position within the maze grid.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Component-based with hooks | React components + custom hooks for state | Natural React pattern, simple state flow, easy to test hooks independently | State complexity if not structured well | Best fit for small single-page app |
| State machine | Formal state machine for modal lifecycle | Explicit transitions, prevents invalid states | Adds library dependency or boilerplate | Overkill for 3-state lifecycle |

## Design Decisions

### Decision: Maze Generation Algorithm
- **Context**: Need a simple, solvable maze for a casual game
- **Alternatives Considered**:
  1. DFS Recursive Backtracker — simple, long corridors
  2. Prim's — organic look, many dead-ends
  3. Kruskal's — requires union-find, complex
- **Selected Approach**: DFS Recursive Backtracker (iterative stack-based variant)
- **Rationale**: Simplest to implement, creates engaging long paths, guaranteed solvable
- **Trade-offs**: Less branching than Prim's, but long corridors suit the "navigate to goal" gameplay
- **Follow-up**: Determine optimal maze size for the modal viewport during implementation

### Decision: Rendering Strategy
- **Context**: How to render the maze visually in the modal
- **Alternatives Considered**:
  1. CSS Grid DOM elements — simple, accessible, sufficient for small grids
  2. HTML Canvas — performant, but complex interaction handling
- **Selected Approach**: CSS Grid with DOM elements
- **Rationale**: Modal-sized maze (~15x15) is well within DOM performance limits. Easier to style, animate, and integrate with React.
- **Trade-offs**: Would not scale to very large mazes, but that is outside scope
- **Follow-up**: Benchmark render performance during implementation if needed

### Decision: Scroll Detection Mechanism
- **Context**: Trigger modal appearance when user scrolls to a threshold
- **Alternatives Considered**:
  1. IntersectionObserver with sentinel element
  2. Scroll event listener with throttle
- **Selected Approach**: IntersectionObserver
- **Rationale**: Better performance, no manual throttling, native API
- **Trade-offs**: Slightly more complex API than scroll listener, but cleaner overall
- **Follow-up**: None

## Risks & Mitigations
- **Maze too small or too large for modal**: Mitigate by calculating grid size based on viewport dimensions with min/max constraints
- **Close button animation jank**: Mitigate by using GPU-accelerated CSS transforms only
- **Mobile touch events interfering with maze controls**: Mitigate by preventing default touch behaviors on the maze container and providing dedicated on-screen buttons
- **Keyboard arrow keys scrolling the page behind modal**: Mitigate by preventing default on arrow key events while maze game is active

## References
- [Maze Generation - Wikipedia](https://en.wikipedia.org/wiki/Maze_generation_algorithm)
- [Jamis Buck - Recursive Backtracking](https://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking)
- [IntersectionObserver vs Scroll Events Performance](https://itnext.io/1v1-scroll-listener-vs-intersection-observers-469a26ab9eb6)
- [FLIP Animation Technique](https://aerotwist.com/blog/flip-your-animations/)
- [MDN: CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using)
