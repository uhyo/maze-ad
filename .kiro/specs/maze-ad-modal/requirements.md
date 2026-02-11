# Requirements Document

## Introduction
This specification defines the requirements for a Vite + React front-end application that displays an article page with a scroll-triggered fake advertisement modal. The modal presents a maze game where the close button escapes into the maze when clicked, forcing the user to navigate the maze to reach and press the close button in order to dismiss the modal and continue reading.

## Requirements

### Requirement 1: Article Page
**Objective:** As a user, I want to see an article page with readable content, so that I have something to scroll through and read.

#### Acceptance Criteria
1. The Application shall render a page containing an article with enough content to require scrolling.
2. While the ad modal is not displayed, the Application shall allow the user to scroll through the article freely.

### Requirement 2: Scroll-Triggered Ad Modal
**Objective:** As a user, I want the ad modal to appear when I scroll down, so that the fake advertisement experience is triggered naturally during reading.

#### Acceptance Criteria
1. When the user scrolls down past a defined threshold on the article page, the Application shall display a modal overlay that covers the page content.
2. While the ad modal is displayed, the Application shall prevent the user from scrolling or interacting with the article content behind the modal.
3. The Application shall display the modal styled to visually imitate a casual advertisement.
4. The modal shall contain a visible close button (e.g., an "X" button) in its initial state.
5. The modal shall display a maze as its main visual content, styled to look like a casual maze game advertisement.

### Requirement 3: Close Button Escape into Maze
**Objective:** As a user, when I try to close the ad, I want the close button to escape into the maze, so that I am drawn into the maze game.

#### Acceptance Criteria
1. When the user hovers over, clicks, or taps the close button on the ad modal, the Application shall animate the close button moving into the maze and positioning it at a specific location within the maze (the goal).
2. When the close button escapes into the maze, the Application shall transition the modal into the maze game mode.
3. The close button shall become the goal target within the maze that the user must navigate to reach.

### Requirement 4: Maze Game Mechanics
**Objective:** As a user, I want to navigate through the maze to reach the close button, so that I can dismiss the modal and return to reading.

#### Acceptance Criteria
1. When the maze game starts, the Application shall place a player indicator at the maze entrance.
2. When the user presses an arrow key (Up, Down, Left, Right) on the keyboard, the Application shall move the player indicator one step in the corresponding direction within the maze.
3. If the player attempts to move into a wall, the Application shall keep the player at the current position.
4. The Application shall generate or display a solvable maze with walls and paths connecting the entrance to the goal (close button location).
5. While the maze game is active, the Application shall display the player's current position within the maze.
6. While the maze game is active, the Application shall display the goal (close button) at its location within the maze.

### Requirement 5: Mobile Controls
**Objective:** As a mobile user, I want on-screen arrow buttons to navigate the maze, so that I can play the game without a physical keyboard.

#### Acceptance Criteria
1. The Application shall display on-screen directional arrow buttons (Up, Down, Left, Right) during the maze game.
2. When the user taps an on-screen arrow button, the Application shall move the player indicator one step in the corresponding direction, identical to keyboard arrow key behavior.
3. The on-screen arrow buttons shall be sized and positioned for comfortable touch interaction on mobile devices.

### Requirement 6: Game Completion and Modal Dismissal
**Objective:** As a user, I want the modal to close when I reach the close button in the maze, so that I can continue reading the article.

#### Acceptance Criteria
1. When the player indicator reaches the goal (close button location) in the maze, the Application shall dismiss the ad modal.
2. When the ad modal is dismissed after game completion, the Application shall restore the article page to its previous scroll position and allow the user to continue reading.
3. When the ad modal is dismissed, the Application shall not trigger the ad modal again for the remainder of the session.
