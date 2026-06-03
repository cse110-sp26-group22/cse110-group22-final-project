import { loadLevel, getLevelCount } from "../src/final/js/systems/level.js";

// ── Mock helpers ──────────────────────────────────────────────────────────────

function makeMockPool(count, difficulty, baseScore = 100) {
  return Array.from({ length: count }, (_, i) => ({
    prompt:     `Prompt ${i + 1}`,
    answer:     `Answer ${i + 1}`,
    baseScore,
    difficulty,
    category:   "test",
  }));
}

function mockFetch(questions, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(questions),
  });
}

// Mixed pool: 10 difficulty-1, 10 difficulty-2, 10 difficulty-3
const MIXED_POOL = [
  ...makeMockPool(10, 1, 100),
  ...makeMockPool(10, 2, 150),
  ...makeMockPool(10, 3, 200),
];

beforeEach(() => {
  mockFetch(MIXED_POOL);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ── getLevelCount ─────────────────────────────────────────────────────────────

describe("getLevelCount", () => {
  test("returns 3", () => {
    expect(getLevelCount()).toBe(3);
  });
});

// ── loadLevel — fetch behaviour ───────────────────────────────────────────────

describe("loadLevel — fetch", () => {
  test("fetches from ../data/<category>.json", async () => {
    await loadLevel(1, "python");
    expect(global.fetch).toHaveBeenCalledWith("../data/python.json");
  });

  test("uses the category slug in the URL", async () => {
    await loadLevel(1, "unix");
    expect(global.fetch).toHaveBeenCalledWith("../data/unix.json");
  });

  test("throws when response.ok is false", async () => {
    mockFetch([], false);
    await expect(loadLevel(1, "python")).rejects.toThrow("Failed to load questions for python");
  });
});

// ── loadLevel — return shape ──────────────────────────────────────────────────

describe("loadLevel — return shape", () => {
  test("returns questions as an array of strings", async () => {
    const { questions } = await loadLevel(1, "test");
    expect(Array.isArray(questions)).toBe(true);
    questions.forEach(q => expect(typeof q).toBe("string"));
  });

  test("returns answers as an array of strings", async () => {
    const { answers } = await loadLevel(1, "test");
    expect(Array.isArray(answers)).toBe(true);
    answers.forEach(a => expect(typeof a).toBe("string"));
  });

  test("returns baseScores as an array of numbers", async () => {
    const { baseScores } = await loadLevel(1, "test");
    expect(Array.isArray(baseScores)).toBe(true);
    baseScores.forEach(s => expect(typeof s).toBe("number"));
  });

  test("questions, answers, and baseScores all have the same length", async () => {
    const { questions, answers, baseScores } = await loadLevel(1, "test");
    expect(answers.length).toBe(questions.length);
    expect(baseScores.length).toBe(questions.length);
  });

  test("returns level equal to the levelNumber argument", async () => {
    expect((await loadLevel(1, "test")).level).toBe(1);
    expect((await loadLevel(2, "test")).level).toBe(2);
    expect((await loadLevel(3, "test")).level).toBe(3);
  });

  test("returns timeLimit of 30000 for level 1", async () => {
    expect((await loadLevel(1, "test")).timeLimit).toBe(30000);
  });

  test("returns timeLimit of 25000 for level 2", async () => {
    expect((await loadLevel(2, "test")).timeLimit).toBe(25000);
  });

  test("returns timeLimit of 20000 for level 3", async () => {
    expect((await loadLevel(3, "test")).timeLimit).toBe(20000);
  });

  test("returns language equal to the category argument", async () => {
    expect((await loadLevel(1, "python")).language).toBe("python");
    expect((await loadLevel(1, "unix")).language).toBe("unix");
  });
});

// ── loadLevel — filtering ─────────────────────────────────────────────────────

describe("loadLevel — difficulty filtering", () => {
  test("level 1 only returns difficulty-1 questions", async () => {
    const pool = [
      { prompt: "Easy Q", answer: "Easy A", baseScore: 100, difficulty: 1 },
      { prompt: "Hard Q", answer: "Hard A", baseScore: 200, difficulty: 3 },
    ];
    mockFetch(pool);
    const { questions } = await loadLevel(1, "test");
    expect(questions).toEqual(["Easy Q"]);
  });

  test("level 2 only returns difficulty-2 questions", async () => {
    const pool = [
      { prompt: "D1", answer: "A1", baseScore: 100, difficulty: 1 },
      { prompt: "D2", answer: "A2", baseScore: 150, difficulty: 2 },
      { prompt: "D3", answer: "A3", baseScore: 200, difficulty: 3 },
    ];
    mockFetch(pool);
    const { questions } = await loadLevel(2, "test");
    expect(questions).toEqual(["D2"]);
  });

  test("level 3 only returns difficulty-3 questions", async () => {
    const pool = [
      { prompt: "D1", answer: "A1", baseScore: 100, difficulty: 1 },
      { prompt: "D3", answer: "A3", baseScore: 200, difficulty: 3 },
    ];
    mockFetch(pool);
    const { questions } = await loadLevel(3, "test");
    expect(questions).toEqual(["D3"]);
  });

  test("returns empty arrays when no questions match the difficulty", async () => {
    mockFetch([]);
    const { questions, answers, baseScores } = await loadLevel(1, "test");
    expect(questions.length).toBe(0);
    expect(answers.length).toBe(0);
    expect(baseScores.length).toBe(0);
  });

  test("caps results at 9 questions when the pool is larger", async () => {
    const bigPool = makeMockPool(12, 1);
    mockFetch(bigPool);
    const { questions } = await loadLevel(1, "test");
    expect(questions.length).toBe(9);
  });

  test("returns all questions when pool is smaller than questionCount", async () => {
    const smallPool = makeMockPool(5, 1);
    mockFetch(smallPool);
    const { questions } = await loadLevel(1, "test");
    expect(questions.length).toBe(5);
  });
});

// ── loadLevel — question/answer pairing ──────────────────────────────────────

describe("loadLevel — pairing", () => {
  test("each question is paired with its original answer after shuffle", async () => {
    const pool = [
      { prompt: "P1", answer: "A1", baseScore: 100, difficulty: 1 },
      { prompt: "P2", answer: "A2", baseScore: 100, difficulty: 1 },
      { prompt: "P3", answer: "A3", baseScore: 100, difficulty: 1 },
    ];
    mockFetch(pool);
    const { questions, answers } = await loadLevel(1, "test");
    for (let i = 0; i < questions.length; i++) {
      const original = pool.find(q => q.prompt === questions[i]);
      expect(answers[i]).toBe(original.answer);
    }
  });

  test("each question is paired with its original baseScore after shuffle", async () => {
    const pool = [
      { prompt: "P1", answer: "A1", baseScore: 111, difficulty: 1 },
      { prompt: "P2", answer: "A2", baseScore: 222, difficulty: 1 },
      { prompt: "P3", answer: "A3", baseScore: 333, difficulty: 1 },
    ];
    mockFetch(pool);
    const { questions, baseScores } = await loadLevel(1, "test");
    for (let i = 0; i < questions.length; i++) {
      const original = pool.find(q => q.prompt === questions[i]);
      expect(baseScores[i]).toBe(original.baseScore);
    }
  });
});
