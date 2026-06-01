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

  test("returns true after startTimer is called with future end_time", () => {
    const futureTime = Date.now() + 5000;
    startTimer(futureTime, () => {});
    expect(isRunning()).toBe(true);
  });

  test("returns false after stopTimer is called", () => {
    const futureTime = Date.now() + 5000;
    startTimer(futureTime, () => {});
    stopTimer();
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
    const futureTime = Date.now() + 3000;
    startTimer(futureTime, onExpire);
    jest.advanceTimersByTime(1000);
    stopTimer();
    jest.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});

// ── startTimer ────────────────────────────────────────────────────────────────

describe("startTimer", () => {
  test("calls onExpire after the specified duration", () => {
    const onExpire = jest.fn();
    const futureTime = Date.now() + 2000;
    startTimer(futureTime, onExpire);
    jest.advanceTimersByTime(2000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("does not call onExpire before time runs out", () => {
    const onExpire = jest.fn();
    const futureTime = Date.now() + 5000;
    startTimer(futureTime, onExpire);
    jest.advanceTimersByTime(4000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  test("calls onExpire immediately if end_time is in the past", () => {
    const onExpire = jest.fn();
    const pastTime = Date.now() - 1000;
    startTimer(pastTime, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  test("restarting stops the previous timer and starts a new one", () => {
    const onExpire1 = jest.fn();
    const onExpire2 = jest.fn();
    startTimer(Date.now() + 5000, onExpire1);
    startTimer(Date.now() + 3000, onExpire2);
    jest.advanceTimersByTime(5000);
    expect(onExpire1).not.toHaveBeenCalled();
    expect(onExpire2).toHaveBeenCalledTimes(1);
  });

  test("timer is not running after onExpire fires", () => {
    startTimer(Date.now() + 1000, () => {});
    jest.advanceTimersByTime(1000);
    expect(isRunning()).toBe(false);
  });

  test("stopTimer prevents onExpire from being called", () => {
    const onExpire = jest.fn();
    startTimer(Date.now() + 2000, onExpire);
    stopTimer();
    jest.advanceTimersByTime(3000);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
