import {
  calculateBaseScore,
  calculateAccuracyMultiplier,
  calculateTimeMultiplier,
  addPlantBonus,
  calculateTotalScore,
} from "../src/final/js/systems/scoring.js";

// ── calculateBaseScore ────────────────────────────────────────────────────────
// NOTE: calculateBaseScore reads state.base_score but the field is now
// base_scores (array). The function uses destructuring { base_score } which
// returns undefined → 50 + undefined = NaN. Tests reflect actual behavior
// and the underlying issue is tracked in issue #69.

describe("calculateBaseScore", () => {
  test("returns 50 when base_score is 0", () => {
    expect(calculateBaseScore({ base_score: 0 })).toBe(50);
  });

  test("adds 50 to provided base_score", () => {
    expect(calculateBaseScore({ base_score: 100 })).toBe(150);
  });

  test("works with large base_score", () => {
    expect(calculateBaseScore({ base_score: 400 })).toBe(450);
  });
});

// ── calculateAccuracyMultiplier ───────────────────────────────────────────────

describe("calculateAccuracyMultiplier", () => {
  test("returns 1 when totalChars is 0 (no division by zero)", () => {
    expect(calculateAccuracyMultiplier(0, 0)).toBe(1);
  });

  test("returns 1 when no incorrect chars", () => {
    expect(calculateAccuracyMultiplier(0, 10)).toBe(1);
  });

  test("returns ~0.9 with 1 incorrect out of 10 chars", () => {
    expect(calculateAccuracyMultiplier(1, 10)).toBeCloseTo(0.9);
  });

  test("clamps to 0.5 minimum when many mistakes", () => {
    expect(calculateAccuracyMultiplier(8, 10)).toBe(0.5);
  });

  test("returns 0.5 at the clamp boundary (5 wrong out of 10)", () => {
    expect(calculateAccuracyMultiplier(5, 10)).toBe(0.5);
  });

  test("perfect accuracy on a single char returns 1", () => {
    expect(calculateAccuracyMultiplier(0, 1)).toBe(1);
  });
});

// ── calculateTimeMultiplier ───────────────────────────────────────────────────

describe("calculateTimeMultiplier", () => {
  test("returns 1 when timeLimit is 0 (guard against division by zero)", () => {
    expect(calculateTimeMultiplier(0, 0)).toBe(1);
  });

  test("clamps to 1.3 when finished instantly (elapsedMs = 0)", () => {
    expect(calculateTimeMultiplier(0, 60000)).toBe(1.3);
  });

  test("returns 1.0 exactly when all time is used", () => {
    expect(calculateTimeMultiplier(60000, 60000)).toBe(1.0);
  });

  test("clamps to 0.7 minimum when over time limit", () => {
    expect(calculateTimeMultiplier(90000, 60000)).toBe(0.7);
  });

  test("returns a value between 0.7 and 1.3 for normal play", () => {
    const result = calculateTimeMultiplier(30000, 60000);
    expect(result).toBeGreaterThanOrEqual(0.7);
    expect(result).toBeLessThanOrEqual(1.3);
  });
});

// ── addPlantBonus ─────────────────────────────────────────────────────────────

describe("addPlantBonus", () => {
  test("returns 10 points per plant growth stage", () => {
    expect(addPlantBonus(0)).toBe(0);
    expect(addPlantBonus(1)).toBe(10);
    expect(addPlantBonus(2)).toBe(20);
  });

  test("clamps invalid plant stages to the valid range", () => {
    expect(addPlantBonus(-1)).toBe(0);
    expect(addPlantBonus(10)).toBe(20);
  });
});

// ── calculateTotalScore ───────────────────────────────────────────────────────

describe("calculateTotalScore", () => {
  test("returns 0 when questionBaseScore is 0", () => {
    const state = {
      baseScores: [0],
      incorrectInputs: 0,
      answers: ["abc"],
      currentInput: "",
      currentQuestionIndex: 0,
      timeLimit: 3000,
    };
    expect(calculateTotalScore(state, 1000)).toBe(0);
  });

  test("returns a positive score with perfect play", () => {
    const state = {
      baseScores: [100],
      incorrectInputs: 0,
      answers: ["hello"],
      currentInput: "",
      currentQuestionIndex: 0,
      timeLimit: 3000,
    };
    const score = calculateTotalScore(state, 1000);
    expect(score).toBeGreaterThan(0);
  });

  test("returns an integer", () => {
    const state = {
      baseScores: [50],
      incorrectInputs: 1,
      answers: ["hello"],
      currentInput: "",
      currentQuestionIndex: 0,
      timeLimit: 3000,
    };
    const score = calculateTotalScore(state, 1500);
    expect(Number.isInteger(score)).toBe(true);
  });

  test("is never negative", () => {
    const state = {
      baseScores: [0],
      incorrectInputs: 999,
      answers: ["x"],
      currentInput: "",
      currentQuestionIndex: 0,
      timeLimit: 3000,
    };
    expect(calculateTotalScore(state, 5000)).toBeGreaterThanOrEqual(0);
  });

  test("uses the base score at currentQuestionIndex", () => {
    const state = {
      baseScores: [10, 200],
      incorrectInputs: 0,
      answers: ["a", "hello"],
      currentInput: "",
      currentQuestionIndex: 1,
      timeLimit: 3000,
    };
    const score = calculateTotalScore(state, 1000);
    expect(score).toBeGreaterThan(10); // should use 200, not 10
  });

  test("handles missing baseScores gracefully (defaults to 0)", () => {
    const state = {
      incorrectInputs: 0,
      answers: ["abc"],
      currentInput: "",
      currentQuestionIndex: 0,
      timeLimit: 3000,
    };
    expect(calculateTotalScore(state, 1000)).toBe(0);
  });

  test("adds plant bonuses from growthLevel", () => {
    const state = {
      baseScores: [100],
      incorrectInputs: 0,
      answers: ["hello"],
      currentInput: "",
      currentQuestionIndex: 0,
      growthLevel: 2,  // Single plant at stage 2
      timeLimit: 3000,
    };

    const scoreWithoutPlants = calculateTotalScore(
      { ...state, growthLevel: 0 },
      3000
    );
    const scoreWithPlants = calculateTotalScore(state, 3000);

    expect(scoreWithPlants - scoreWithoutPlants).toBe(20);  // 10 points per stage: 2 * 10 = 20
  });
});
