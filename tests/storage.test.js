import {
  loadProfile,
  saveProfile,
  clearProfile,
  loadState,
  saveState,
  clearState,
  clearAll,
  saveAll,
} from "../src/final/js/systems/storage.js";

import { defaultGameState } from "../src/final/js/models/models.js";

// ── localStorage mock ─────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key) => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear:      () => { store = {}; },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorage.clear();
});

// ── Profile ───────────────────────────────────────────────────────────────────
// Profile shape from defaultProfile(): { username, score, level,
//   current_question_index, language, isInitialized }

describe("saveProfile / loadProfile", () => {
  test("saves and reloads a profile", () => {
    const profile = { username: "Alice", score: 200, level: 3, current_question_index: 10, language: "Python", isInitialized: true };
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  test("loadProfile returns default profile when nothing is saved", () => {
    const profile = loadProfile();
    expect(profile.username).toBe("Guest");
    expect(profile.score).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.current_question_index).toBe(0);
    expect(profile.language).toBe("python");
    expect(profile.isInitialized).toBe(false);
  });

  test("saveProfile overwrites a previous save", () => {
    saveProfile({ username: "Alice", score: 100, level: 1, current_question_index: 5,  language: "python",     isInitialized: true });
    saveProfile({ username: "Bob",   score: 999, level: 5, current_question_index: 50, language: "javaScript", isInitialized: true });
    expect(loadProfile().username).toBe("Bob");
    expect(loadProfile().score).toBe(999);
  });

  test("saveProfile returns true on success", () => {
    expect(saveProfile({ username: "Test", score: 0, level: 1, current_question_index: 0, language: "python", isInitialized: false })).toBe(true);
  });
});

describe("clearProfile", () => {
  test("removes the saved profile", () => {
    saveProfile({ username: "Alice", score: 0, level: 1, current_question_index: 0, language: "python", isInitialized: true });
    clearProfile();
    expect(loadProfile().username).toBe("Guest");
  });

  test("is safe to call when no profile is saved", () => {
    expect(() => clearProfile()).not.toThrow();
  });
});

// ── Game State ────────────────────────────────────────────────────────────────
// State shape from defaultGameState(): { plants, questions, answers, baseScores,
//   language, level, currentQuestionIndex, maxPrefixLength, incorrectInputs,
//   timeLimit, questionStartTime, endTime, remainingOnPause, score,
//   isActive, isPaused, isOver }
//
// NOTE: saveState currently contains a bug — line 85 references `snapshot`
// instead of `state`, causing it to always throw and return false without
// persisting anything. The roundtrip tests below will fail until that is fixed.

const sampleState = {
  ...defaultGameState(),   // picks up any new GameState fields automatically
  plants:               [1, 0, 0],
  questions:            ["Q1", "Q2"],
  answers:              ["A1", "A2"],
  baseScores:           [100, 100],
  language:             "python",
  level:                1,
  currentQuestionIndex: 1,
  maxPrefixLength:      3,
  incorrectInputs:      2,
  timeLimit:            30000,
  questionStartTime:    1000,
  endTime:              31000,
  remainingOnPause:     0,
  score:                50,
  isActive:             true,
  isPaused:             false,
  isOver:               false,
};

describe("saveState / loadState", () => {
  test("saves and reloads game state", () => {
    saveState(sampleState);
    const loaded = loadState();
    expect(loaded.plants).toEqual([1, 0, 0]);
    expect(loaded.currentQuestionIndex).toBe(1);
    expect(loaded.timeLimit).toBe(30000);
    expect(loaded.score).toBe(50);
  });

  test("loadState returns default state when nothing is saved", () => {
    const state = loadState();
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual([]);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.timeLimit).toBe(600000);
  });

  test("saveState returns true on success", () => {
    expect(saveState(sampleState)).toBe(true);
  });
});

describe("clearState", () => {
  test("removes the saved game state", () => {
    saveState(sampleState);
    clearState();
    expect(loadState().score).toBe(0);
    expect(loadState().timeLimit).toBe(600000);
  });

  test("is safe to call when no state is saved", () => {
    expect(() => clearState()).not.toThrow();
  });
});

// ── Nuclear options ───────────────────────────────────────────────────────────

describe("clearAll", () => {
  test("removes both profile and state", () => {
    saveProfile({ username: "Alice", score: 0, level: 1, current_question_index: 0, language: "python", isInitialized: true });
    saveState(sampleState);
    clearAll();
    expect(loadProfile().username).toBe("Guest");
    expect(loadState().score).toBe(0);
  });
});

describe("saveAll", () => {
  test("saves both profile and state", () => {
    const profile = { username: "Eve", score: 50, level: 2, current_question_index: 5, language: "python", isInitialized: true };
    saveAll(profile, sampleState);
    expect(loadProfile().username).toBe("Eve");
    expect(loadState().score).toBe(50);
  });

  test("returns true on success", () => {
    const profile = { username: "Test", score: 0, level: 1, current_question_index: 0, language: "python", isInitialized: false };
    expect(saveAll(profile, sampleState)).toBe(true);
  });
});
