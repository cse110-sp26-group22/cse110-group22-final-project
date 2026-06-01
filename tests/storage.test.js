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

describe("saveProfile / loadProfile", () => {
  test("saves and reloads a profile", () => {
    const profile = { username: "Alice", score: 200, level: 3, language: "Python", isInitialized: true, plants: [1, 2, 3] };
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  test("loadProfile returns default profile when nothing is saved", () => {
    const profile = loadProfile();
    expect(profile.username).toBe("Guest");
    expect(profile.score).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.language).toBe("Python");
    expect(profile.isInitialized).toBe(false);
  });

  test("saveProfile overwrites a previous save", () => {
    saveProfile({ username: "Alice", score: 100, level: 1, language: "Python", isInitialized: true, plants: [0,0,0] });
    saveProfile({ username: "Bob",   score: 999, level: 5, language: "JavaScript", isInitialized: true, plants: [3,3,3] });
    expect(loadProfile().username).toBe("Bob");
    expect(loadProfile().score).toBe(999);
  });

  test("saveProfile returns true on success", () => {
    expect(saveProfile({ username: "Test", score: 0, level: 1, language: "Python", isInitialized: false, plants: [0,0,0] })).toBe(true);
  });
});

describe("clearProfile", () => {
  test("removes the saved profile and falls back to default", () => {
    saveProfile({ username: "Alice", score: 0, level: 1, language: "Python", isInitialized: true, plants: [0,0,0] });
    clearProfile();
    expect(loadProfile().username).toBe("Guest");
  });

  test("is safe to call when no profile is saved", () => {
    expect(() => clearProfile()).not.toThrow();
  });
});

// ── Game State ────────────────────────────────────────────────────────────────

describe("saveState / loadState", () => {
  const sampleState = {
    plants: [1, 0, 0],
    questions: ["Q1", "Q2"],
    answers: ["A1", "A2"],
    base_scores: [50, 100],
    level: 1,
    current_question_index: 1,
    current_input: "partial",
    incorrect_chars: 2,
    time_limit: 3000,
    question_start_time: 0,
    end_time: 0,
    remaining_on_pause: 60,
    score: 50,
    isActive: true,
    isPaused: false,
  };

  test("saves and reloads game state", () => {
    saveState(sampleState);
    const loaded = loadState();
    expect(loaded.plants).toEqual([1, 0, 0]);
    expect(loaded.current_question_index).toBe(1);
    expect(loaded.score).toBe(50);
    expect(loaded.base_scores).toEqual([50, 100]);
  });

  test("resets current_input to empty string on save", () => {
    saveState(sampleState);
    expect(loadState().current_input).toBe("");
  });

  test("loadState returns default state when nothing is saved", () => {
    const state = loadState();
    expect(state.questions).toEqual([]);
    expect(state.answers).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.current_question_index).toBe(0);
  });

  test("saveState returns true on success", () => {
    expect(saveState(sampleState)).toBe(true);
  });

  test("does not mutate the original state object", () => {
    saveState(sampleState);
    expect(sampleState.current_input).toBe("partial");
  });
});

describe("clearState", () => {
  test("removes the saved game state and falls back to default", () => {
    saveState({ plants: [1,0,0], questions: [], answers: [], base_scores: [], level: 1,
      current_question_index: 0, current_input: "", incorrect_chars: 0,
      time_limit: 3000, question_start_time: 0, end_time: 0,
      remaining_on_pause: 60, score: 99, isActive: false, isPaused: false });
    clearState();
    expect(loadState().score).toBe(0);
  });

  test("is safe to call when no state is saved", () => {
    expect(() => clearState()).not.toThrow();
  });
});

// ── Nuclear options ───────────────────────────────────────────────────────────

describe("clearAll", () => {
  test("removes both profile and state", () => {
    saveProfile({ username: "Alice", score: 0, level: 1, language: "Python", isInitialized: true, plants: [0,0,0] });
    saveState({ plants: [0,0,0], questions: [], answers: [], base_scores: [], level: 1,
      current_question_index: 0, current_input: "", incorrect_chars: 0,
      time_limit: 3000, question_start_time: 0, end_time: 0,
      remaining_on_pause: 60, score: 0, isActive: false, isPaused: false });
    clearAll();
    expect(loadProfile().username).toBe("Guest");
    expect(loadState().score).toBe(0);
  });
});

describe("saveAll", () => {
  test("saves both profile and state atomically", () => {
    const profile = { username: "Eve", score: 50, level: 2, language: "Python", isInitialized: true, plants: [2,0,0] };
    const state = { plants: [2,0,0], questions: ["Q"], answers: ["A"], base_scores: [50], level: 2,
      current_question_index: 0, current_input: "", incorrect_chars: 0,
      time_limit: 3000, question_start_time: 0, end_time: 0,
      remaining_on_pause: 60, score: 50, isActive: false, isPaused: false };
    saveAll(profile, state);
    expect(loadProfile().username).toBe("Eve");
    expect(loadState().score).toBe(50);
  });

  test("returns true on success", () => {
    const profile = { username: "Test", score: 0, level: 1, language: "Python", isInitialized: false, plants: [0,0,0] };
    const state = { plants: [0,0,0], questions: [], answers: [], base_scores: [], level: 1,
      current_question_index: 0, current_input: "", incorrect_chars: 0,
      time_limit: 3000, question_start_time: 0, end_time: 0,
      remaining_on_pause: 60, score: 0, isActive: false, isPaused: false };
    expect(saveAll(profile, state)).toBe(true);
  });
});
