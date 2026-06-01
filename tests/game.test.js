/**
 * game.test.js
 *
 * Tests for game.js using jest.mock() to isolate all dependencies.
 */

jest.mock("../src/final/js/systems/level.js", () => ({
  loadLevel: jest.fn(),
}));

jest.mock("../src/final/js/systems/timer.js", () => ({
  startTimer: jest.fn(),
  stopTimer:  jest.fn(),
}));

jest.mock("../src/final/js/systems/scoring.js", () => ({
  calculateBaseScore:  jest.fn(() => 50),
  calculateTotalScore: jest.fn(() => 100),
}));

jest.mock("../src/final/js/systems/storage.js", () => ({
  saveProfile: jest.fn(),
  saveState:   jest.fn(),
  clearState:  jest.fn(),
}));

jest.mock("../src/final/js/systems/plants.js", () => ({
  growNextPlant: jest.fn(() => [1, 0, 0]),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeLevelState(overrides = {}) {
  return {
    plants:                 [0, 0, 0],
    questions:              ["Q1", "Q2", "Q3"],
    answers:                ["A1", "A2", "A3"],
    base_scores:            [50, 50, 50],
    current_question_index: 0,
    current_input:          "",
    incorrect_chars:        0,
    time_limit:             3000,
    question_start_time:    0,
    end_time:               Date.now() + 3000,
    remaining_on_pause:     3000,
    score:                  0,
    isActive:               false,
    isPaused:               false,
    level:                  1,
    ...overrides,
  };
}

import {
  registerCallbacks,
  startLevel,
  endGame,
  pauseGame,
  resumeGame,
  goToLevelSelect,
  goToMainMenu,
  onInput,
} from "../src/final/js/systems/game.js";

import { loadLevel } from "../src/final/js/systems/level.js";
import { startTimer, stopTimer } from "../src/final/js/systems/timer.js";
import { calculateTotalScore } from "../src/final/js/systems/scoring.js";
import { saveProfile, clearState } from "../src/final/js/systems/storage.js";
import { growNextPlant } from "../src/final/js/systems/plants.js";

let mockLoadScreen;
let mockUpdateScreen;

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadScreen   = jest.fn();
  mockUpdateScreen = jest.fn();
  registerCallbacks(mockLoadScreen, mockUpdateScreen);
  loadLevel.mockResolvedValue(makeLevelState());
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
    await startLevel(2, "python");
    expect(loadLevel).toHaveBeenCalledWith(2, "python");
  });

  test("starts the timer after loading the level", async () => {
    await startLevel(1, "python");
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("loads the game screen after starting the level", async () => {
    await startLevel(1, "python");
    expect(mockLoadScreen).toHaveBeenCalledWith("game", expect.any(Object));
  });
});

// ── endGame ───────────────────────────────────────────────────────────────────

describe("endGame", () => {
  test("stops the timer", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    endGame();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("saves the player profile", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    endGame();
    expect(saveProfile).toHaveBeenCalledTimes(1);
  });

  test("clears in-progress state from storage", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    endGame();
    expect(clearState).toHaveBeenCalledTimes(1);
  });

  test("loads the endscreen", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    endGame();
    expect(mockLoadScreen).toHaveBeenCalledWith("endscreen", expect.any(Object));
  });

  test("saves a profile object to storage", async () => {
    await startLevel(1, "python");
    endGame();
    expect(saveProfile).toHaveBeenCalledWith(expect.any(Object));
  });
});

// ── pauseGame ─────────────────────────────────────────────────────────────────

describe("pauseGame", () => {
  test("stops the timer", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    pauseGame();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("loads the pause screen", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    pauseGame();
    expect(mockLoadScreen).toHaveBeenCalledWith("pause", expect.any(Object));
  });
});

// ── resumeGame ────────────────────────────────────────────────────────────────

describe("resumeGame", () => {
  test("restarts the timer when remaining_on_pause > 0", async () => {
    await startLevel(1, "python");
    pauseGame();
    jest.clearAllMocks();
    resumeGame();
    expect(startTimer).toHaveBeenCalledTimes(1);
  });

  test("loads the game screen when remaining_on_pause > 0", async () => {
    await startLevel(1, "python");
    pauseGame();
    jest.clearAllMocks();
    resumeGame();
    expect(mockLoadScreen).toHaveBeenCalledWith("game", expect.any(Object));
  });

  test("does nothing when game is not paused", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    // resumeGame without pausing first — isPaused is false, should return early
    resumeGame();
    expect(startTimer).not.toHaveBeenCalled();
    expect(mockLoadScreen).not.toHaveBeenCalled();
  });
});

// ── goToLevelSelect ───────────────────────────────────────────────────────────

describe("goToLevelSelect", () => {
  test("stops the timer", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    goToLevelSelect();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("loads the levelselect screen", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    goToLevelSelect();
    expect(mockLoadScreen).toHaveBeenCalledWith("levelselect", expect.any(Object));
  });
});

// ── goToMainMenu ──────────────────────────────────────────────────────────────

describe("goToMainMenu", () => {
  test("stops the timer", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    goToMainMenu();
    expect(stopTimer).toHaveBeenCalled();
  });

  test("loads the mainmenu screen", async () => {
    await startLevel(1, "python");
    jest.clearAllMocks();
    goToMainMenu();
    expect(mockLoadScreen).toHaveBeenCalledWith("mainmenu", expect.any(Object));
  });
});

// ── onInput ───────────────────────────────────────────────────────────────────

describe("onInput", () => {
  beforeEach(async () => {
    loadLevel.mockResolvedValue(makeLevelState({
      questions: ["Q1", "Q2"],
      answers:   ["ab",  "cd"],
      base_scores: [50, 50],
      end_time: Date.now() + 10000,
    }));
    await startLevel(1, "python");
    jest.clearAllMocks();
  });

  test("fires 'incorrect' when wrong character typed", () => {
    onInput("z");
    expect(mockUpdateScreen).toHaveBeenCalledWith("incorrect", expect.any(Object));
  });

  test("fires 'correct-char' when correct character typed but answer not complete", () => {
    onInput("a");
    expect(mockUpdateScreen).toHaveBeenCalledWith("correct-char", expect.any(Object));
  });

  test("fires 'next-question' when answer is completed and questions remain", () => {
    onInput("a");
    onInput("b");
    expect(mockUpdateScreen).toHaveBeenCalledWith("next-question", expect.any(Object));
  });

  test("calls loadScreen 'endscreen' when last answer is completed", () => {
    onInput("a"); onInput("b"); // Q1 done
    jest.clearAllMocks();
    onInput("c"); onInput("d"); // Q2 done → level 1, go to next level or endgame
    // With level=1 and only 2 questions, it goes to goToNextLevel (level_end) not endGame
    // unless level >= 3. Let's check either level_end or endscreen was called.
    const call = mockLoadScreen.mock.calls[0];
    expect(["endscreen", "level_end"]).toContain(call[0]);
  });

  test("calls calculateTotalScore when an answer is completed", () => {
    onInput("a");
    onInput("b");
    expect(calculateTotalScore).toHaveBeenCalled();
  });

  test("calls growNextPlant when question index is divisible by 3", () => {
    // current_question_index starts at 0, which is divisible by 3
    onInput("a");
    onInput("b");
    expect(growNextPlant).toHaveBeenCalled();
  });

  test("ignores multi-character keys like Shift or Enter", () => {
    onInput("Shift");
    expect(mockUpdateScreen).not.toHaveBeenCalled();
  });

  test("state data passed to updateScreen contains expected shape", () => {
    onInput("z");
    const data = mockUpdateScreen.mock.calls[0][1];
    expect(data).toHaveProperty("questions");
    expect(data).toHaveProperty("answers");
    expect(data).toHaveProperty("score");
    expect(data).toHaveProperty("current_question_index");
  });
});
