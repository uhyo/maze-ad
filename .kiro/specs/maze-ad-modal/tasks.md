# Implementation Plan

- [ ] 1. Set up Vite + React + TypeScript project
  - Initialize a new Vite project with React and TypeScript template
  - Configure TypeScript strict mode and CSS Modules support
  - Set up the basic application entry point and root component
  - Verify the dev server runs and renders a placeholder page
  - _Requirements: 1.1_

- [ ] 2. Implement maze generation algorithm
- [ ] 2.1 (P) Build the core maze generator using DFS recursive backtracker
  - Implement the maze data model: grid of cells, each cell tracking its four wall states (top, right, bottom, left)
  - Implement the iterative stack-based DFS algorithm that carves passages through the grid
  - Place the entrance in the top-left region and the goal in the bottom-right region
  - Ensure wall consistency: when a passage is carved between two adjacent cells, both cells update their shared wall
  - Accept a configuration specifying rows and columns (minimum 5 each) and return the grid, entrance position, and goal position
  - _Requirements: 4.4_
  - _Contracts: MazeGenerator Service_

- [ ] 2.2 (P) Verify maze generation correctness
  - Write unit tests verifying grid dimensions match the requested configuration
  - Test that entrance and goal positions are within bounds and placed in the expected regions
  - Test that a valid path exists from entrance to goal (BFS/DFS path-finding check)
  - Test wall consistency between adjacent cells (shared walls are symmetrical)
  - Test edge case: minimum grid size (5x5) produces a valid maze
  - _Requirements: 4.4_

- [ ] 3. Build article page with scroll-triggered modal activation
- [ ] 3.1 (P) Create the article page with scrollable placeholder content
  - Build the root article page component rendering placeholder text long enough to require scrolling
  - Style the page as a readable article layout
  - _Requirements: 1.1, 1.2_
  - _Contracts: ArticlePage_

- [ ] 3.2 Implement scroll detection hook using IntersectionObserver
  - Create a hook that places a sentinel element at approximately 30% down the article
  - Use IntersectionObserver to detect when the sentinel enters the viewport
  - Track trigger state (triggered vs. not triggered) and dismissal state
  - Prevent re-triggering after the modal has been dismissed (session-level flag)
  - Provide a dismiss callback and a ref for the sentinel element
  - Conditionally render the ad modal component when triggered and not yet dismissed
  - _Requirements: 2.1, 6.2, 6.3_
  - _Contracts: useScrollTrigger State_

- [ ] 4. Build the modal overlay with ad-style presentation
- [ ] 4.1 Create the fullscreen modal overlay with background scroll lock
  - Build a fixed-position overlay component that covers the entire viewport
  - Lock body scroll on mount by setting `overflow: hidden` on the body element
  - Restore body scroll on unmount
  - Block pointer events on the article content behind the overlay
  - _Requirements: 2.2_
  - _Contracts: ModalOverlay_

- [ ] 4.2 Style the modal to look like a casual game advertisement
  - Design the modal interior with ad-like visual styling (border, background, heading text like "Play Now!" or similar)
  - Place a visible close button ("X") at the top-right corner of the modal
  - Display the maze as the main visual content area of the ad, rendered as a static visual in this phase
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 5. Render the maze board with CSS Grid
- [ ] 5.1 Build the maze board component using CSS Grid layout
  - Render the maze grid as a CSS Grid where each cell is a grid item
  - Apply conditional border styles to each cell to represent its walls (thick/visible border for walls, no border for passages)
  - Style the grid to fit within the modal content area
  - _Requirements: 2.5_
  - _Contracts: MazeBoard_

- [ ] 5.2 Display the player indicator and goal marker on the maze board
  - Highlight the cell at the player's current position with a distinct visual indicator (e.g., colored circle)
  - Display the close button icon ("X") at the goal cell position
  - Ensure both indicators update visually when positions change
  - _Requirements: 4.1, 4.5, 4.6, 3.3_

- [ ] 6. Implement player movement with keyboard controls
- [ ] 6.1 Build the player movement hook with wall collision detection
  - Create a hook that manages the player's current position within the maze
  - Expose a move function that accepts a direction (up, down, left, right)
  - Before moving, check the current cell's wall state in the requested direction; block movement if a wall exists
  - Update position only when the move is valid (no wall blocking)
  - Only process movement when the game is in the active playing phase
  - _Requirements: 4.2, 4.3_
  - _Contracts: usePlayerMovement State_

- [ ] 6.2 Add keyboard arrow key event handling
  - Listen for keydown events on arrow keys (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
  - Map each arrow key to the corresponding direction and call the move function
  - Prevent default browser behavior for arrow keys while the game is active (avoid scrolling)
  - Clean up the event listener on unmount
  - _Requirements: 4.2_

- [ ] 7. Implement the close button escape animation
- [ ] 7.1 Trigger the escape animation on hover, click, or tap
  - In the ad-visible phase, attach hover (mouseenter), click, and touch (touchstart) event handlers to the close button
  - When any of these events fires, initiate the escape sequence by transitioning the game phase to "escaping"
  - _Requirements: 3.1, 3.2_

- [ ] 7.2 Animate the close button from its corner position into the maze goal cell
  - Calculate the close button's current position and the goal cell's position using getBoundingClientRect
  - Apply a CSS transition on the transform property to animate the button from its corner to the goal cell
  - On transition end (or after a 1-second timeout fallback), notify the game state to transition from "escaping" to "playing"
  - Place the player indicator at the maze entrance when the playing phase begins
  - _Requirements: 3.1, 3.2, 3.3, 4.1_

- [ ] 8. Build mobile on-screen controls
- [ ] 8.1 (P) Create the on-screen D-pad directional buttons
  - Build a control component with four arrow buttons arranged in a D-pad layout (up on top, left and right on sides, down on bottom)
  - Each button calls the move function with the corresponding direction, identical to keyboard input
  - Size buttons at minimum 44x44px for comfortable touch targets
  - Apply touch-action: manipulation to prevent double-tap zoom
  - Show the controls only during the active playing phase
  - _Requirements: 5.1, 5.2, 5.3_
  - _Contracts: MobileControls_

- [ ] 9. Wire up game orchestration and complete the integration
- [ ] 9.1 Implement the game state machine hook
  - Create the central game orchestration hook managing phase transitions: idle → ad-visible → escaping → playing → completed
  - Generate the maze when the modal first appears (transition to ad-visible)
  - Detect when the player position matches the goal position and transition to "completed"
  - _Requirements: 3.2, 4.4, 6.1_
  - _Contracts: useMazeGame State_

- [ ] 9.2 Integrate all components in the AdModal container
  - Wire the modal overlay, close button, maze board, and mobile controls together inside the AdModal component
  - Pass game state and callbacks from useMazeGame to each child component
  - When the game phase reaches "completed", call the dismiss callback from useScrollTrigger to close the modal
  - Verify the article page restores to its previous scroll position after dismissal
  - Verify the modal does not re-trigger after dismissal within the same session
  - _Requirements: 1.2, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_

- [ ]* 10. End-to-end verification of the complete flow
  - Walk through the full user journey: load page → scroll → modal appears → interact with close button → close button escapes into maze → navigate maze with keyboard → reach goal → modal dismissed → continue reading
  - Verify the mobile flow: same journey using on-screen arrow buttons instead of keyboard
  - Confirm the modal does not re-appear after dismissal when scrolling again
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_
