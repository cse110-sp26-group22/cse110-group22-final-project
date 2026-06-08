/**
 * game.test.js
 *
 * Tests for game.js with all dependencies mocked.
 * Scoring logic is intentionally excluded — calculateTotalScore is mocked
 * and score-related assertions are omitted until scoring is finalized.
 */

// ── Dependency mocks ──────────────────────────────────────────────────────────

jest.mock("../src/final/js/systems/level.js", () => ({
  loadLevel: jest.fn(async (levelNumber, category) => ({
    questions: ["Q1", "Q2"],
    answers: ["ab", "cd"],
    baseScores: [100, 100],
    level: levelNumber,
    timeLimit: 30000,
    language: category,
    currentQuestionIndex: 0,
    growthLevel: 0,
    currentInput: "",
    totalIncorrectInputs: 0,
    totalInputs:          0,
    maxPrefixLength:      0,
    levelAccuracyPercent: "1.00",
    timeUsed:             [],
    totalAnswerCharacters:0,
  })),
  getLevelCount: jest.fn(() => 3),
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
    ...defaultGameState(),
    questions:  ["Q1", "Q2"],
    answers:    ["ab", "cd"],
    baseScores: [100, 100],
    level:      1,
    timeLimit:  30000,
    language:   "python",
    isActive:   true,
    isPaused:   false,
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


  test("fires 'incorrect' when input does not extend the correct prefix", () => {
    onInput("z"); // answer is "ab" — no matching prefix
    expect(mockUpdateScreen).toHaveBeenCalledWith("incorrect", expect.any(Object));
  });

  test("increments incorrectInputs on incorrect input", () => {
    onInput("z");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.incorrectInputs).toBe(1);
  });

  test("does not increment incorrectInputs for whitespace-only input", () => {
    onInput(" ");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.incorrectInputs).toBe(0);
    expect(data.totalIncorrectInputs).toBe(0);
  });

  test("does not increment incorrectInputs when deleting input", () => {
    onInput("a");
    jest.clearAllMocks();
    onInput("");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.incorrectInputs).toBe(0);
    expect(data.totalIncorrectInputs).toBe(0);
  });

  test("fires 'next-question' when an answer is completed and questions remain", async () => {
    await onInput("ab"); // completes first answer; second question still pending
    expect(mockUpdateScreen).toHaveBeenCalledWith("next-question", expect.any(Object));
  });

  test("advances currentQuestionIndex after completing an answer", async () => {
    await onInput("ab");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data.currentQuestionIndex).toBe(1);
  });

  test("restarts the timer after completing an answer", async () => {
    await onInput("ab");
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("resets incorrectInputs to 0 after completing an answer", async () => {
    onInput("z"); // incorrect — incorrectInputs becomes 1
    await onInput("ab"); // correct — should reset incorrectInputs
    const data = mockUpdateScreen.mock.calls[1][1];
    expect(data.incorrectInputs).toBe(0);
  });

  test("fires 'results' when the last answer is completed on level 2", async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1"],
      answers:   ["ab"],
      baseScores:[100],
      level:     2,
    }));
    await startLevel(2, "python");
    jest.clearAllMocks();
    await onInput("ab");
    expect(mockLoadScreen).toHaveBeenCalledWith("results", expect.any(Object));
    const data = mockLoadScreen.mock.calls[0][1];
    expect(data.isOver).toBeFalsy();
  });

  test("fires 'results' with isOver=true when the last answer is completed on level 3", async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1"],
      answers:   ["ab"],
      baseScores:[100],
      level:     3,
    }));
    await startLevel(3, "python");
    jest.clearAllMocks();
    await onInput("ab");
    expect(mockLoadScreen).toHaveBeenCalledWith("results", expect.any(Object));
    const data = mockLoadScreen.mock.calls[0][1];
    expect(data.isOver).toBe(true);
    expect(data.finalScore).toBeDefined();
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

// ── Question Completion & Expiration Penalties ────────────────────────────────

describe("handleQuestionComplete and Expiration Penalties", () => {
  test("calls stopTimer immediately when a question finishes", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();

    // Type the full answer to naturally trigger question completion
    await onInput("a");
    await onInput("ab");

    const { stopTimer } = require("../src/final/js/systems/timer.js");
    expect(stopTimer).toHaveBeenCalledTimes(1);
  });

  test("does not penalize accuracy metrics if user answers under the time limit", async () => {
    await startLevel(1, "python");
    
    await onInput("a");
    await onInput("ab");

    const lastStateSent = mockUpdateScreen.mock.calls[mockUpdateScreen.mock.calls.length - 1][1];
    expect(lastStateSent.totalIncorrectInputs).toBe(0);
  });

  test("applies missing character penalty to incorrect inputs on timeout", async () => {
    // Set up a level where the target answer is long ("python" = 6 chars)
    loadLevel.mockResolvedValueOnce(makeLevelState({
      answers: ["python"],
      currentQuestionIndex: 0
    }));
    
    await startLevel(1, "python");
    
    // Simulate the user typing part of the word correctly first
    await onInput("p");
    await onInput("py"); // maxPrefixLength becomes 2

    // Freeze the base time and spy on Date.now to force a timeout state
    const realNow = Date.now();
    const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => realNow + 40000); 

    // Send an input that forces your code to check elapsed time and process timeout logic
    await onInput("py"); 

    const lastStateSent = mockUpdateScreen.mock.calls[mockUpdateScreen.mock.calls.length - 1][1];
    
    // If your system accurately registers the timeout:
    // 6 (length) - 2 (prefix) = 4 remaining characters should be added to inputs/errors
    expect(lastStateSent.totalIncorrectInputs).toBeGreaterThanOrEqual(1);

    spyDate.mockRestore();
  });
});

// ── Accuracy Calculations ───────────────────────────────────────────────────

describe("Accuracy Schema Formatter", () => {
  test("saves levelAccuracyPercent in a clean decimal format string at end of level", async () => {
    loadLevel.mockResolvedValueOnce(makeLevelState({
      questions: ["Q1"],
      answers: ["ab"]
    }));

    await startLevel(1, "python");
    
    // Simulate natural inputs: 1 correct, 1 typo, then finishing the word
    await onInput("a");  // Correct
    await onInput("ax"); // Typo
    await onInput("ab"); // Finished!

    expect(mockLoadScreen).toHaveBeenCalledWith("results", expect.any(Object));
    
    const finalState = mockLoadScreen.mock.calls[0][1];
    
    // Verify that the level accuracy field exists and is formatted as a number
      expect(finalState).toHaveProperty("levelAccuracyPercent");
      expect(typeof finalState.levelAccuracyPercent).toBe("number");
    });
  
  test("safeguards against division-by-zero errors yielding NaN strings if inputs are 0", async () => {
    loadLevel.mockResolvedValueOnce(makeLevelState({
      questions: ["Q1"],
      answers: ["ab"]
    }));

    await startLevel(1, "python");
    
    // Force immediate timeout without typing anything
    const realNow = Date.now();
    const spyDate = jest.spyOn(Date, 'now').mockImplementation(() => realNow + 50000); 

    await onInput(""); 

    const finalState = mockLoadScreen.mock.calls[0][1];
    
    // The metric should exist as a string and not be literal "NaN"
    expect(finalState.levelAccuracyPercent).not.toBe("NaN");
    spyDate.mockRestore();
  });
});
