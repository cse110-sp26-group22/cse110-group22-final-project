# /systems Overview

## game.js

### High-Level Responsibility
Central game engine. Owns the active `GameState` and `Profile`, coordinates all other modules, and exposes functions for `ui.js` to call. Handles the full game lifecycle and processes player input.

### Function Breakdowns

| Function | Description |
|---|---|
| `startLevel(levelNumber, category)` | Initializes a new level by loading questions via `level.js`, resetting state, and starting the timer |
| `nextQuestion()` | Advances to the next question in the current question set; triggers end-of-game if none remain |
| `onInput(key)` | Processes a single keypress from the player; updates `currentInput` and checks for correct answer |
| `endGame()` | Stops the timer, saves state and profile, and signals `ui.js` to display end screen |
| `pauseGame()` | Pauses the timer and suspends input handling |
| `resumeGame()` | Resumes the timer and re-enables input handling |

---

## level.js

### High-Level Responsibility
Defines hardcoded level configurations and handles level initialization. Fetches questions from a category JSON file, filters by difficulty, and shuffles them. Called by `game.js` at the start of each level.

### Level Configurations

| Level | Time Limit | Questions | Difficulty |
|---|---|---|---|
| 1 | 60s | 10 | Very Easy |
| 2 | 60s | 10 | Easy |
| 3 | 60s | 10 | Medium |
| 4 | 60s | 10 | Hard |
| 5 | 60s | 10 | Very Hard |

### Function Breakdowns

| Function | Description |
|---|---|
| `loadLevel(state, levelNumber, category)` | Fetches questions from `../data/{category}.json`, filters by the level's difficulty, shuffles, and slices to the configured question count. Mutates `state.questions`, `state.currentQuestionIndex`, `state.currentInput`, and `state.timeRemaining` |
| `getLevelCount()` | Returns the total number of available levels (currently 5) |

---

## storage.js

### High-Level Responsibility
I/O layer for `localStorage`. Manages a single player profile and a single game state. All other modules go through this file to persist or retrieve data — nothing else touches `localStorage` directly.

### Function Breakdowns

#### Profile

| Function | Description |
|---|---|
| `loadProfile()` | Loads and parses the profile from `localStorage`. Returns `defaultProfile()` if none exists |
| `saveProfile(profile)` | Serializes and saves the profile to `localStorage`. Returns `true` on success, `false` on failure |
| `clearProfile()` | Removes the profile from `localStorage` |

#### Game State

| Function | Description |
|---|---|
| `loadState()` | Loads and parses the game state from `localStorage`. Returns `defaultGameState()` if none exists |
| `saveState(state)` | Serializes and saves the game state. Resets `currentInput` to `""` before saving — partially typed input is not worth persisting. Returns `true` on success, `false` on failure |
| `clearState()` | Removes the game state from `localStorage` |

#### Utility

| Function | Description |
|---|---|
| `clearAll()` | Removes both the profile and game state from `localStorage` in one call |

---

## ui.js

### High-Level Responsibility
Handles all DOM interaction. Listens for user events and delegates to `game.js`, then updates the display based on the returned result. Never holds a direct reference to `GameState` — all state lives in `game.js`.

### Function Breakdowns

| Function | Description |
|---|---|
| `initEventListeners()` | Registers all event listeners on page load (keyboard input, button clicks, screen transitions) |
| `updateScore(score)` | Updates the score display in the DOM |
| `updateTimer(time)` | Updates the timer display in the DOM |
| `displayQuestion(word)` | Renders the current question/prompt for the player to type |
| `displayResult(correct)` | Shows feedback to the player after a submission (correct or incorrect) |
