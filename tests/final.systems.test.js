const {
  calculateAccuracyMultiplier,
  calculateTimeMultiplier,
  calculateTotalScore,
} = require("../src/final/js/systems/scoring.js");
const { QuestionSelector } = require("../src/final/js/systems/questions.js");
const {
  Farm,
  Plant,
  defaultGameState,
  defaultPlayer,
} = require("../src/final/js/models/models.js");
const {
  isRunning,
  startTimer,
  stopTimer,
} = require("../src/final/js/systems/timer.js");

describe("final scoring system", () => {
  test("calculates accuracy multiplier from incorrect and total characters", () => {
    expect(calculateAccuracyMultiplier(0, 10)).toBe(1);
    expect(calculateAccuracyMultiplier(2, 10)).toBe(0.8);
    expect(calculateAccuracyMultiplier(9, 10)).toBe(0.5);
    expect(calculateAccuracyMultiplier(1, 0)).toBe(1);
  });

  test("calculates time multiplier with lower and upper bounds", () => {
    expect(calculateTimeMultiplier(15, 60)).toBe(1.3);
    expect(calculateTimeMultiplier(45, 60)).toBe(1.25);
    expect(calculateTimeMultiplier(90, 60)).toBe(0.7);
    expect(calculateTimeMultiplier(10, 0)).toBe(1);
  });

  test("combines base score, accuracy, and time into a rounded total score", () => {
    expect(calculateTotalScore(100, 0, 10, 45, 60)).toBe(125);
    expect(calculateTotalScore(100, 2, 10, 45, 60)).toBe(100);
  });
});

describe("final question selector", () => {
  test("returns each question once before reporting that the pool is empty", () => {
    const questions = [
      { prompt: "one" },
      { prompt: "two" },
      { prompt: "three" },
    ];
    const selector = new QuestionSelector(questions);
    const selectedPrompts = new Set();

    selectedPrompts.add(selector.getNextQuestion().prompt);
    selectedPrompts.add(selector.getNextQuestion().prompt);
    selectedPrompts.add(selector.getNextQuestion().prompt);

    expect(selectedPrompts).toEqual(new Set(["one", "two", "three"]));
    expect(selector.getNextQuestion()).toBeNull();
    expect(selector.used).toHaveLength(3);
    expect(selector.remaining).toHaveLength(0);
  });

  test("reset restores all questions to the available pool", () => {
    const questions = [{ prompt: "one" }, { prompt: "two" }];
    const selector = new QuestionSelector(questions);

    selector.getNextQuestion();
    selector.reset();

    expect(selector.remaining).toEqual(questions);
    expect(selector.used).toEqual([]);
  });
});

describe("final models", () => {
  test("plant growth stops at the mature stage", () => {
    const plant = new Plant("carrot", 0);

    plant.grow();
    plant.grow();
    plant.grow();

    expect(plant.get_type()).toBe("carrot");
    expect(plant.get_growth_stage()).toBe(2);
  });

  test("farm grows every plant it contains", () => {
    const farm = new Farm();
    farm.num_plants = 2;
    farm.plant_seed(new Plant("tomato", 1));

    farm.grow_plants();

    expect(farm.plants.map((plant) => plant.get_growth_stage())).toEqual([1, 2]);
  });

  test("default player and game state contain the expected starting values", () => {
    const player = defaultPlayer();
    const state = defaultGameState();

    expect(player.username).toBe("Guest");
    expect(player.level).toBe(1);
    expect(player.language).toBe("Python");
    expect(player.farm).toBeInstanceOf(Farm);

    expect(state.player.username).toBe("Guest");
    expect(state.completed_question_ids).toEqual([]);
    expect(state.current_input).toBe("");
    expect(state.time_limit).toBe(60);
  });
});

describe("final timer system", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    stopTimer();
  });

  afterEach(() => {
    stopTimer();
    jest.useRealTimers();
  });

  test("ticks down every second and expires at zero", () => {
    const onTick = jest.fn();
    const onExpire = jest.fn();

    startTimer(2, onTick, onExpire);

    expect(isRunning()).toBe(true);

    jest.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenLastCalledWith(1);
    expect(onExpire).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenLastCalledWith(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(isRunning()).toBe(false);
  });

  test("stopTimer cancels future ticks", () => {
    const onTick = jest.fn();

    startTimer(5, onTick, jest.fn());
    stopTimer();
    jest.advanceTimersByTime(5000);

    expect(onTick).not.toHaveBeenCalled();
    expect(isRunning()).toBe(false);
  });
});
