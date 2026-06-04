/**
 * game.test.js
 *
 * Tests for game.js with all dependencies mocked.
 * Scoring logic is intentionally excluded — calculateTotalScore is mocked
 * and score-related assertions are omitted until scoring is finalized.
 */

// ── Dependency mocks ──────────────────────────────────────────────────────────

jest.mock("../src/final/js/systems/level.js", () => ({
  loadLevel: jest.fn(),
}));

jest.mock("../src/final/js/systems/timer.js", () => ({
  startTimer: jest.fn(),
  stopTimer:  jest.fn(),
}));

jest.mock("../src/final/js/systems/scoring.js", () => ({
  calculateTotalScore: jest.fn(() => 0),
}));

jest.mock("../src/final/js/systems/storage.js", () => ({
  saveProfile: jest.fn(),
  clearState:  jest.fn(),
}));



// ── Imports ───────────────────────────────────────────────────────────────────

import {
  registerCallbacks,
  startLevel,
  pauseGame,
  resumeGame,
  goToMainMenu,
  onInput,
} from "../src/final/js/systems/game.js";

import { loadLevel }                      from "../src/final/js/systems/level.js";
import { startTimer, stopTimer }          from "../src/final/js/systems/timer.js";
import { defaultGameState }               from "../src/final/js/models/models.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a complete state object shaped like what loadLevel returns, plus the
 * fields game.js reads directly (currentQuestionIndex, plants, etc.) that
 * loadLevel does not currently populate.  game.js does `state = await
 * loadLevel(...)` so these must be present for the module to function.
 */
function makeLevelState(overrides = {}) {
  return {
    ...defaultGameState(),   // picks up any new GameState fields automatically
    questions:  ["Q1", "Q2"],
    answers:    ["ab", "cd"],
    baseScores: [100, 100],
    level:      1,
    timeLimit:  30000,
    language:   "python",
    ...overrides,
  };
}

// ── Shared setup ──────────────────────────────────────────────────────────────

let mockLoadScreen;
let mockUpdateScreen;

beforeEach(() => {
  jest.clearAllMocks();

  mockLoadScreen   = jest.fn();
  mockUpdateScreen = jest.fn();
  registerCallbacks(mockLoadScreen, mockUpdateScreen);

  loadLevel.mockResolvedValue(makeLevelState());
  startTimer.mockReturnValue(Date.now() + 30000); // fake endTime
});

// ── registerCallbacks ─────────────────────────────────────────────────────────

describe("registerCallbacks", () => {
  test("does not throw when called with two functions", () => {
    expect(() => registerCallbacks(() => {}, () => {})).not.toThrow();
  });
});

// ── startLevel ────────────────────────────────────────────────────────────────

describe("startLevel", () => {
  test("calls loadLevel with the given levelNumber and category", async () => {
    await startLevel(2, "unix");
    expect(loadLevel).toHaveBeenCalledWith(2, "unix");
  });

  test("calls startTimer once after loading the level", async () => {
    await startLevel(1, "python");
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("loads the game screen", async () => {
    await startLevel(1, "python");
    expect(mockLoadScreen).toHaveBeenCalledWith("game", expect.any(Object));
  });

  test("passes a state object to loadScreen", async () => {
    await startLevel(1, "python");
    const data = mockLoadScreen.mock.calls[0][1];
    expect(data).toHaveProperty("questions");
    expect(data).toHaveProperty("answers");
    expect(data).toHaveProperty("currentQuestionIndex");
  });
});

// ── pauseGame ─────────────────────────────────────────────────────────────────

describe("pauseGame", () => {
  beforeEach(async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
  });

  test("stops the timer", () => {
    pauseGame();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("loads the pause screen", () => {
    pauseGame();
    expect(mockLoadScreen).toHaveBeenCalledWith("pause", expect.any(Object));
  });

  test("does nothing if already paused", () => {
    pauseGame();
    jest.clearAllMocks();
    pauseGame(); // second call — should be a no-op
    expect(stopTimer).not.toHaveBeenCalled();
    expect(mockLoadScreen).not.toHaveBeenCalled();
  });
});

// ── resumeGame ────────────────────────────────────────────────────────────────

describe("resumeGame", () => {
  beforeEach(async () => {
    await startLevel(1, "python");
    pauseGame();
    jest.clearAllMocks();
  });

  test("restarts the timer", () => {
    resumeGame();
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("loads the game screen", () => {
    resumeGame();
    expect(mockLoadScreen).toHaveBeenCalledWith("game", expect.any(Object));
  });

  test("does nothing if the game is not paused", () => {
    resumeGame(); // un-pause
    jest.clearAllMocks();
    resumeGame(); // second call — should be a no-op
    expect(startTimer).not.toHaveBeenCalled();
    expect(mockLoadScreen).not.toHaveBeenCalled();
  });
});

// ── goToMainMenu ──────────────────────────────────────────────────────────────

describe("goToMainMenu", () => {
  beforeEach(async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
  });

  test("stops the timer", () => {
    goToMainMenu();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("loads the mainmenu screen", () => {
    goToMainMenu();
    expect(mockLoadScreen).toHaveBeenCalledWith("mainmenu", expect.any(Object));
  });
});

// ── onInput ───────────────────────────────────────────────────────────────────

describe("onInput", () => {
  beforeEach(async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1", "Q2"],
      answers:   ["ab", "cd"],
    }));
    await startLevel(1, "python");
    jest.clearAllMocks();
  });

  test("does nothing when the game is not active", () => {
    goToMainMenu(); // sets isActive = false
    jest.clearAllMocks();
    onInput("a");
    expect(mockUpdateScreen).not.toHaveBeenCalled();
  });

  test("does nothing when the game is paused", () => {
    pauseGame(); // sets isPaused = true
    jest.clearAllMocks();
    onInput("a");
    expect(mockUpdateScreen).not.toHaveBeenCalled();
  });

  test("does nothing when the answers array is empty", async () => {
    loadLevel.mockResolvedValue(makeLevelState({ questions: [], answers: [] }));
    await startLevel(1, "python");
    jest.clearAllMocks();
    onInput("a");
    expect(mockUpdateScreen).not.toHaveBeenCalled();
    expect(mockLoadScreen).not.toHaveBeenCalled();
  });

  test("fires 'incorrect' when input does not extend the correct prefix", () => {
    onInput("z"); // answer is "ab" — no matching prefix
    expect(mockUpdateScreen).toHaveBeenCalledWith("incorrect", expect.any(Object));
  });

  test("increments incorrectInputs on incorrect input", () => {
    onInput("z");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.incorrectInputs).toBe(1);
  });

  test("fires 'next-question' when an answer is completed and questions remain", () => {
    onInput("ab"); // completes first answer; second question still pending
    expect(mockUpdateScreen).toHaveBeenCalledWith("next-question", expect.any(Object));
  });

  test("advances currentQuestionIndex after completing an answer", () => {
    onInput("ab");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.currentQuestionIndex).toBe(1);
  });

  test("restarts the timer after completing an answer", () => {
    onInput("ab");
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("resets incorrectInputs to 0 after completing an answer", () => {
    onInput("z"); // incorrect — incorrectInputs becomes 1
    onInput("ab"); // correct — should reset incorrectInputs
    const data = mockUpdateScreen.mock.calls[1][1];
    expect(data.incorrectInputs).toBe(0);
  });

  test("fires 'endscreen' when the last answer is completed on level 3", async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1"],
      answers:   ["ab"],
      baseScores:[100],
      level:     3,
    }));
    await startLevel(3, "python");
    jest.clearAllMocks();
    onInput("ab");
    expect(mockLoadScreen).toHaveBeenCalledWith("endscreen", expect.any(Object));
  });

  test("fires 'level_end' when the last answer is completed on level 1", async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1"],
      answers:   ["ab"],
      baseScores:[100],
      level:     1,
    }));
    await startLevel(1, "python");
    jest.clearAllMocks();
    onInput("ab");
    expect(mockLoadScreen).toHaveBeenCalledWith("results", expect.any(Object));
  });

  test("fires 'level_end' when the last answer is completed on level 2", async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1"],
      answers:   ["ab"],
      baseScores:[100],
      level:     2,
    }));
    await startLevel(2, "python");
    jest.clearAllMocks();
    onInput("ab");
    expect(mockLoadScreen).toHaveBeenCalledWith("results", expect.any(Object));
  });

  test("state passed to updateScreen contains expected fields", () => {
    onInput("z"); // incorrect
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data).toHaveProperty("questions");
    expect(data).toHaveProperty("answers");
    expect(data).toHaveProperty("currentQuestionIndex");
    expect(data).toHaveProperty("incorrectInputs");
  });

  test("fires 'correct' when input extends the correct prefix", () => {
    onInput("a"); // first char of "ab" — grows the prefix
    expect(mockUpdateScreen).toHaveBeenCalledWith("correct", expect.any(Object));
  });

  test("updates maxPrefixLength when input extends the correct prefix", () => {
    onInput("a");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.maxPrefixLength).toBe(1);
  });

  test("fires 'incorrect' when input regresses to a shorter prefix", () => {
    onInput("a");              // maxPrefixLength becomes 1
    jest.clearAllMocks();
    onInput("z");              // prefixLength 0 <= maxPrefixLength 1 → incorrect
    expect(mockUpdateScreen).toHaveBeenCalledWith("incorrect", expect.any(Object));
  });
});
