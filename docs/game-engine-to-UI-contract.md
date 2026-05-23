# Game Engine ↔ Frontend Contract (UI API Spec)

This document defines the official interface between `game.js` (game engine) and the frontend UI layer (`ui-core`, `gameUI`).

It specifies:
- Frontend → engine function calls
- Engine → frontend event system
- Full payload field meanings
- Architectural rules

---

# 1. Frontend → Game Engine API

These are the ONLY functions the frontend is allowed to call.

---

## 1.1 initializeGame(callbacks)

Registers UI callback handlers used by the game engine.

### Parameters

callbacks object:

- loadPage (function)
- updatePage (function)

### Purpose

Creates the communication bridge between game engine and UI.

---

## 1.2 startLevel(levelNumber, category)

Starts a new gameplay session.

### Parameters

| Name         | Type   | Description |
|--------------|--------|-------------|
| levelNumber  | number | Selected level index (1-based) |
| category     | string | Question dataset category |

### Purpose

Initializes game state and loads the first question.

---

## 1.3 onInput(key)

Processes a single character input from the user.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| key  | string | Single character typed by user |

### Purpose

Validates input against current answer and advances game state if correct.

---

## 1.4 endGame()

Terminates the current session.

### Purpose

Stops timer, freezes game state, and triggers end screen.

---

# 2. Game Engine → Frontend Events

The game engine communicates via:

- loadPage(page, data)
- updatePage(event, data)

---

# 2.1 loadPage Events (Full Screen Transitions)

These replace the entire UI view.

---

## Event: gameplay

### Purpose
Initialize gameplay screen

### Payload

| Field | Type | Meaning |
|------|------|---------|
| word | string | Current question answer (ghost text) |
| score | number | Current total score |
| time | number | Remaining level time (seconds) |

---

## Event: endscreen

### Purpose
Show final results screen

### Payload

| Field | Type | Meaning |
|------|------|---------|
| score | number | Final score for the level |

---

# 2.2 updatePage Events (Incremental Updates)

These modify parts of the current screen.

---

## Event: timer

### Purpose
Update countdown timer display

### Payload

| Field | Type | Meaning |
|------|------|---------|
| time | number | Remaining level time (seconds) |

---

## Event: question

### Purpose
Advance to next question and refresh UI

### Payload

| Field | Type | Meaning |
|------|------|---------|
| word | string | Next question answer (ghost text) |
| score | number | Updated total score |

---

## Event: incorrect

### Purpose
Trigger incorrect input feedback

### Payload

None

### Meaning

Used only for UI effects:
- flash red input
- shake animation
- sound effects

No game state changes.

---

# 3. Internal Data Definitions

These values are produced by game.js and passed to UI.

---

## 3.1 word

Type: string

Meaning:
Correct answer for current question.

Used for:
- ghost text display
- input comparison reference

Example:
"function"

---

## 3.2 score

Type: number

Meaning:
Total accumulated score across completed questions.

Updated only when:
- a question is completed

Not updated during:
- typing
- incorrect input
- timer ticks

---

## 3.3 time

Type: number

Meaning:
Remaining time in current level (seconds)

Controlled by:
- timer.js
- synchronized via handleTick()

---

## 3.4 incorrect event

Type: event only

Meaning:
Signals incorrect character input

Does NOT affect:
- score
- input state
- question progression

Used for:
- visual feedback only

---

# 4. Data Flow Summary

---

## Level Start

UI → startLevel()
→ loadLevel()
→ game state initialized
→ loadPage("gameplay")

---

## User Input

UI → onInput(key)
→ validation in game engine
→ updatePage("incorrect") OR updatePage("question")

---

## Timer Tick

timer.js → handleTick()
→ updatePage("timer")

---

## Question Completion

onInput()
→ handleQuestionComplete()
→ scoring calculation
→ updatePage("question")

---

## Game End

timer expires OR level complete
→ endGame()
→ loadPage("endscreen")

---

# 5. Architectural Rules

---

## Game Engine MUST:
- Own all game logic
- Own state transitions
- Own scoring
- Own question progression

---

## UI MUST:
- Only render state
- Handle animations
- Forward input
- Never mutate game state

---

## Storage MUST:
- Persist profile only (progression, stats)
- NOT persist live session state (MVP rule)

---

# 6. Contract Stability Rule

Any change to:
- payload structure
- event names
- field meanings

must be reflected in BOTH:
- game.js
- frontend UI handlers

This contract is the integration boundary.