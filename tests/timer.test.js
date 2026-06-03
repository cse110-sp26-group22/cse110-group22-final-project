import { startTimer, stopTimer, isRunning } from "../src/final/js/systems/timer.js";

beforeEach(() => {
  jest.useFakeTimers();
  stopTimer();
});

afterEach(() => {
  stopTimer();
  jest.useRealTimers();
});

// ── isRunning ─────────────────────────────────────────────────────────────────

describe("isRunning", () => {
  test("returns false before any timer is started", () => {
    expect(isRunning()).toBe(false);
  });

  test("returns true after startTimer is called", () => {
    startTimer({ timeLimit: 5000 }, () => {});
    expect(isRunning()).toBe(true);
  });

  test("returns false after stopTimer is called", () => {
    startTimer({ timeLimit: 5000 }, () => {});
    stopTimer();
    expect(isRunning()).toBe(false);
  });

  test("returns false once onExpire fires", () => {
    startTimer({ timeLimit: 1000 }, () => {});
    jest.advanceTimersByTime(1000);
    expect(isRunning()).toBe(false);
  });
});

// ── stopTimer ─────────────────────────────────────────────────────────────────

describe("stopTimer", () => {
  test("is safe to call when timer is not running", () => {
    expect(() => stopTimer()).not.toThrow();
  });

  test("prevents onExpire from firing after stopTimer", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 3000 }, onExpire);
    jest.advanceTimersByTime(1000);
    stopTimer();
    jest.advanceTimersByTime(3000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});

// ── startTimer ────────────────────────────────────────────────────────────────

describe("startTimer", () => {
  test("calls onExpire after state.timeLimit ms", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 3000 }, onExpire);
    jest.advanceTimersByTime(3000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("does not call onExpire before time runs out", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 5000 }, onExpire);
    jest.advanceTimersByTime(4999);
    expect(onExpire).not.toHaveBeenCalled();
  });

  test("calls onExpire exactly once even with extra time elapsed", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 2000 }, onExpire);
    jest.advanceTimersByTime(5000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("uses remainingOnPause as duration when it is > 0", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 5000, remainingOnPause: 2000 }, onExpire);
    jest.advanceTimersByTime(2000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("uses timeLimit as duration when remainingOnPause is 0", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 3000, remainingOnPause: 0 }, onExpire);
    jest.advanceTimersByTime(3000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("restarting cancels the previous timer", () => {
    const onExpire = jest.fn();
    startTimer({ timeLimit: 5000 }, onExpire);
    jest.advanceTimersByTime(2000);
    startTimer({ timeLimit: 5000 }, onExpire);
    jest.advanceTimersByTime(2000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  test("returns Date.now() + state.timeLimit", () => {
    const now = Date.now();
    const timeLimit = 5000;
    const result = startTimer({ timeLimit }, () => {});
    expect(result).toBe(now + timeLimit);
  });
});
