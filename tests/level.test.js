import { loadLevel, getLevelCount } from "../src/final/js/systems/level.js";

// Sample question pool matching the actual JSON structure used in the project
const MOCK_QUESTIONS = [
  { Question: "What is 1+1?", answers: "2",    Difficulty: 1, baseScore: 50 },
  { Question: "What is 2+2?", answers: "4",    Difficulty: 1, baseScore: 50 },
  { Question: "What is 3+3?", answers: "6",    Difficulty: 1, baseScore: 50 },
  { Question: "Hard q 1",     answers: "ans1", Difficulty: 2, baseScore: 100 },
  { Question: "Hard q 2",     answers: "ans2", Difficulty: 2, baseScore: 100 },
  { Question: "Hardest q 1",  answers: "ansA", Difficulty: 3, baseScore: 150 },
];

function mockFetch(questions) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(questions),
  });
}

beforeEach(() => {
  mockFetch(MOCK_QUESTIONS);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── getLevelCount ─────────────────────────────────────────────────────────────

describe("getLevelCount", () => {
  test("returns 3 (the number of configured levels)", () => {
    expect(getLevelCount()).toBe(3);
  });
});

// ── loadLevel ─────────────────────────────────────────────────────────────────

describe("loadLevel", () => {
  test("returns an object with questions and answers arrays", async () => {
    const state = await loadLevel(1, "python");
    expect(Array.isArray(state.questions)).toBe(true);
    expect(Array.isArray(state.answers)).toBe(true);
  });

  test("returns a base_scores array parallel to questions and answers", async () => {
    const state = await loadLevel(1, "python");
    expect(Array.isArray(state.base_scores)).toBe(true);
    expect(state.base_scores.length).toBe(state.questions.length);
  });

  test("filters questions by difficulty 1 for level 1", async () => {
    const state = await loadLevel(1, "python");
    expect(state.questions.length).toBeGreaterThan(0);
    expect(state.questions.length).toBeLessThanOrEqual(9);
  });

  test("filters questions by difficulty 2 for level 2", async () => {
    const state = await loadLevel(2, "python");
    expect(state.questions.length).toBe(2); // only 2 difficulty-2 questions in mock
  });

  test("filters questions by difficulty 3 for level 3", async () => {
    const state = await loadLevel(3, "python");
    expect(state.questions.length).toBe(1); // only 1 difficulty-3 question in mock
  });

  test("questions and answers arrays have the same length", async () => {
    const state = await loadLevel(1, "python");
    expect(state.questions.length).toBe(state.answers.length);
  });

  test("returns plants as [0, 0, 0]", async () => {
    const state = await loadLevel(1, "python");
    expect(state.plants).toEqual([0, 0, 0]);
  });

  test("returns current_question_index of 0", async () => {
    const state = await loadLevel(1, "python");
    expect(state.current_question_index).toBe(0);
  });

  test("returns empty current_input string", async () => {
    const state = await loadLevel(1, "python");
    expect(state.current_input).toBe("");
  });

  test("returns incorrect_chars of 0", async () => {
    const state = await loadLevel(1, "python");
    expect(state.incorrect_chars).toBe(0);
  });

  test("returns score of 0", async () => {
    const state = await loadLevel(1, "python");
    expect(state.score).toBe(0);
  });

  test("questions array contains strings, not objects", async () => {
    const state = await loadLevel(1, "python");
    state.questions.forEach((q) => expect(typeof q).toBe("string"));
  });

  test("answers array contains strings, not objects", async () => {
    const state = await loadLevel(1, "python");
    state.answers.forEach((a) => expect(typeof a).toBe("string"));
  });

  test("question and answer at the same index are paired correctly", async () => {
    const pool = [
      { Question: "P1", answers: "A1", Difficulty: 1, baseScore: 50 },
      { Question: "P2", answers: "A2", Difficulty: 1, baseScore: 50 },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(pool),
    });
    const state = await loadLevel(1, "test");
    for (let i = 0; i < state.questions.length; i++) {
      const original = pool.find((q) => q.Question === state.questions[i]);
      expect(state.answers[i]).toBe(original.answers);
    }
  });

  test("returns empty arrays when no questions match difficulty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });
    const state = await loadLevel(1, "empty");
    expect(state.questions.length).toBe(0);
    expect(state.answers.length).toBe(0);
  });

  test("returns the correct level number in state", async () => {
    const state = await loadLevel(2, "python");
    expect(state.level).toBe(2);
  });

  test("includes time_limit from the level config", async () => {
    const state = await loadLevel(1, "python");
    expect(typeof state.time_limit).toBe("number");
    expect(state.time_limit).toBeGreaterThan(0);
  });
});
