# Backend API for Frontend

## Documentation Metadata

| Field | Value |
|---|---|
| Sprint | Sprint 3 |
| Collaborators | Group 22 frontend/backend integration |
| Date pushed | May 25 2026 |
| Feature | Frontend-facing backend/system API documentation |
| Testing performed | Documentation review against current `src/final/js` modules and existing Jest/Puppeteer test coverage |

This project does not use a remote HTTP backend for the MVP. The frontend talks to the gameplay "backend" through local JavaScript modules in `src/final/js/systems` and `src/final/js/models`. Those modules own game state, scoring, level/question selection, timing, and browser storage.

Use this document as the frontend integration contract when replacing the temporary `backendEmulator()` in `src/final/js/ui/ui-core.js`.

## Integration Boundary

Frontend code should:
- Render DOM and listen for user actions.
- Send user input/results into the game systems.
- Re-render from returned state or event flags.

Backend/system code should:
- Own progression-related state changes.
- Calculate score, accuracy, time bonuses, level progress, and storage.
- Expose plain objects that UI components can render.

Frontend code should not directly mutate score, level, farm progression, completed questions, saved data, or timer internals.

## Module Map

| Module | Path | Purpose | Frontend Usage |
|---|---|---|---|
| `game.js` | `src/final/js/systems/game.js` | Central controller for the gameplay loop | Intended main entry point for UI calls; currently mostly documented/stubbed |
| `level.js` | `src/final/js/systems/level.js` | Loads level config and question pool | Use through `game.js` once controller is implemented |
| `questions.js` | `src/final/js/systems/questions.js` | Random non-repeating question selector | Use through `level.js` or `game.js` |
| `scoring.js` | `src/final/js/systems/scoring.js` | Pure score calculation helpers | Safe to call from controller; UI normally should not call directly |
| `timer.js` | `src/final/js/systems/timer.js` | Countdown timer service | Use through `game.js`; callbacks update UI state |
| `storage.js` | `src/final/js/systems/storage.js` | `localStorage` persistence | Use through `game.js`; UI should not call storage directly |
| `models.js` | `src/final/js/models/models.js` | Data constructors and default state shape | Import types/defaults only when needed for tests or bootstrapping |

## Data Contracts

### Question

Questions are loaded from JSON files such as `src/final/js/data/python.json`.

```js
{
  prompt: "Which line prints the word hello?",
  options: ["echo('hello')", "print('hello')", "log('hello')"],
  answer: "print('hello')",
  answerChoice: 2,
  difficulty: "very easy",
  category: "python"
}
```

Frontend fields:
- `prompt`: render in `PromptDisplay`.
- `answer`: pass into `CodeInputField.setGhostText(answer)` and compare against submitted input only until `game.js` owns answer validation.
- `options`: optional for multiple-choice UI; current typing UI does not render these.
- `difficulty` and `category`: backend selection metadata; frontend should not rely on these for rendering.

### QuestionResult

When a user submits an answer, the UI should package typing metrics into this shape for the controller.

```js
{
  questionID: 0,
  submittedAnswer: "print('hello')",
  timeElapsed: 12,
  incorrectChars: 1,
  totalChars: 14
}
```

Field notes:
- `questionID`: use the active question's id/index. The current JSON does not contain explicit ids, so the controller may need to assign indexes when loading.
- `submittedAnswer`: the raw value from `.code-input`.
- `timeElapsed`: seconds spent on the question.
- `incorrectChars`: count of incorrect keystrokes or character mismatches tracked by the UI.
- `totalChars`: expected answer length or total attempted characters, depending on final scoring choice.

### GameState

`defaultGameState()` returns the current state shape.

```js
{
  player: {
    username: "Guest",
    score: 0,
    level: 1,
    num_questions_answered: 0,
    language: "Python",
    farm: {
      plants: [{ type: "placeholder", growth_stage: 0 }],
      num_plants: 1
    }
  },
  completed_question_ids: [],
  current_question_id: 0,
  current_input: "",
  elapsed_time: 0,
  incorrect_chars: 0,
  time_limit: 60
}
```

Frontend should render from this state but avoid mutating it directly. Use returned flags for animations only; the actual UI should still reflect `gameState`.

### UI Event Flags

The controller should return optional flags alongside state changes.

```js
{
  state,
  flags: {
    correct: true,
    levelUp: false,
    plantGrowth: true,
    addPlant: false,
    gameOver: false
  }
}
```

Flags are temporary events for animations, notifications, and transitions. They are not the source of truth.

## Intended Controller API

`game.js` is the planned frontend-facing API. The file currently contains comments/stubs, so this section documents the contract the UI should expect once implemented.

### `startLevel(levelNumber, category)`

Starts a level, loads matching questions, resets runtime fields, and starts the timer.

```js
const result = await startLevel(1, "python");
```

Expected return:

```js
{
  state,
  question: {
    prompt: "Which line defines a function named greet?",
    answer: "def greet():"
  },
  flags: {
    levelStarted: true
  }
}
```

Frontend action:
- Render `question.prompt`.
- Set ghost text to `question.answer`.
- Reset input and per-question typing counters.
- Render score, progress, timer, and farm from `state`.

### `submitAnswer(questionResult)`

Recommended controller function to add. Processes a submitted answer, updates score/progression, saves state, and advances to the next question.

```js
const result = await submitAnswer({
  questionID: 0,
  submittedAnswer: input.value,
  timeElapsed,
  incorrectChars,
  totalChars
});
```

Expected return:

```js
{
  state,
  question: nextQuestionOrNull,
  flags: {
    correct: true,
    levelUp: false,
    plantGrowth: false,
    addPlant: true,
    gameOver: false
  }
}
```

Frontend action:
- If `flags.correct`, show success feedback and render any plant updates.
- If `question` is not `null`, render the next prompt/answer.
- If `flags.gameOver`, transition to an end screen.
- Always re-render score, level, progress, timer, and farm from `state`.

### `nextQuestion()`

Advances to another unused question from the current selector.

Expected return:

```js
{
  state,
  question: nextQuestionOrNull,
  flags: {
    gameOver: false
  }
}
```

### `pauseGame()` and `resumeGame()`

Pause/resume the active timer and input handling.

Expected return:

```js
{
  state,
  flags: {
    paused: true
  }
}
```

### `endGame()`

Stops the timer, saves state/profile, and tells the UI to show final results.

Expected return:

```js
{
  state,
  flags: {
    gameOver: true
  }
}
```

## Implemented Supporting APIs

### `loadLevel(levelNumber, category)`

Path: `src/final/js/systems/level.js`

```js
import { loadLevel } from "../systems/level.js";

const session = await loadLevel(1, "python");
```

Returns:

```js
{
  levelNumber: 1,
  levelConfig: {
    levelNumber: 1,
    timeLimit: 60,
    questionCount: 9,
    difficulty: "1"
  },
  selector,
  currentQuestion,
  currentInput: "",
  timeRemaining: 60,
  score: 0
}
```

Known integration notes:
- The current import is `./question.js`, but the existing file is `questions.js`.
- The current filter checks `q.level`, but `python.json` uses `difficulty` strings such as `"very easy"`.
- Resolve those mismatches before calling `loadLevel()` from production UI.

### `QuestionSelector`

Path: `src/final/js/systems/questions.js`

```js
import { QuestionSelector } from "../systems/questions.js";

const selector = new QuestionSelector(questions);
const question = selector.getNextQuestion();
selector.reset();
```

Behavior:
- `getNextQuestion()` returns one random unused question.
- Returns `null` when all questions have been used.
- `reset()` restores the full question pool.

### Scoring Helpers

Path: `src/final/js/systems/scoring.js`

```js
calculateAccuracyMultiplier(incorrectChars, totalChars);
calculateTimeMultiplier(timeElapsed, timeLimit);
calculateTotalScore(baseScore, incorrectChars, totalChars, timeElapsed, timeLimit);
```

Rules:
- Accuracy multiplier bottoms out at `0.5`.
- Time multiplier is clamped between `0.7` and `1.3`.
- Total score is rounded and never below `0`.

Example:

```js
calculateTotalScore(100, 2, 10, 45, 60); // 100
```

### Timer

Path: `src/final/js/systems/timer.js`

```js
startTimer(60, onTick, onExpire);
stopTimer();
isRunning();
```

Contract:
- `onTick(timeRemaining)` is called every second.
- `onExpire()` is called once when time reaches `0`.
- `stopTimer()` cancels the interval without calling `onExpire()`.

### Storage

Path: `src/final/js/systems/storage.js`

```js
loadProfile();
saveProfile(profile);
clearProfile();
loadState();
saveState(state);
clearState();
clearAll();
saveAll(profile, state);
```

Storage keys:
- `profile`
- `state`

Notes:
- `saveState(state)` clears `currentInput` before saving, but the current `GameState` field is named `current_input`.
- Align those names before relying on persisted current input behavior.
- `storage.js` imports `defaultProfile`, but `models.js` currently exports `defaultPlayer` and `defaultGameState`.

## Suggested UI Wiring

Replace the current emulator in `ui-core.js` with controller calls once `game.js` is implemented.

```js
async function main() {
  const gameDisplayElement = assertHTMLElement(document.querySelector("#game-ui"));
  gameUI = new GameUI(gameDisplayElement);

  const result = await startLevel(1, "python");
  gameUI.renderState(result.state);
  gameUI.sendQuestion(result.question.prompt, result.question.answer);
}
```

For submit:

```js
async function handleAnswer(answer) {
  const result = await submitAnswer({
    questionID: currentQuestionId,
    submittedAnswer: answer,
    timeElapsed,
    incorrectChars,
    totalChars: currentAnswer.length
  });

  gameUI.renderState(result.state);

  if (result.question) {
    gameUI.sendQuestion(result.question.prompt, result.question.answer);
  }
}
```

## Current Frontend Emulator

`src/final/js/ui/ui-core.js` currently uses:

```js
function backendEmulator() {
  return ["Print \"Hello, World!\" in Python", "print(\"Hello, World!\")"];
}
```

This is only a temporary stand-in. The real integration should call `game.js`, receive a question object, and render `prompt` plus `answer`.

## Open Backend Tasks Before Full Integration

- Implement `game.js` exports: `startLevel`, `submitAnswer` or `onInput`, `nextQuestion`, `pauseGame`, `resumeGame`, and `endGame`.
- Fix `level.js` import from `./question.js` to `./questions.js`.
- Align level filtering with `python.json` (`difficulty` strings) or update the JSON to include numeric `level`.
- Add stable question ids or assign indexes during load.
- Align naming across modules: `currentInput` vs `current_input`.
- Align profile naming: `defaultProfile` vs `defaultPlayer`.
- Decide whether UI submits full answers or individual keystrokes; document final choice in `game.js`.

## Testing Notes

Existing tests cover:
- Scoring helper behavior.
- Non-repeating question selection.
- Model defaults and plant growth.
- Timer callbacks.
- Current UI emulator flow and plant rendering.

After wiring the UI to `game.js`, update tests to assert that `GameUI` receives questions from the controller instead of `backendEmulator()`.
