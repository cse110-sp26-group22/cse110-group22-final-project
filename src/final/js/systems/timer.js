/**
 * timer.js
 *
 * Manages the countdown timer for an active game session.
 * Tracks time internally — does not read or write state directly.
 * Returns updated time through onTick each second for game.js to handle.
 *
 * Imported by:
 * - game.js: calls startTimer() when a level begins, stopTimer() on pause or game end
 */
let timeoutId = null;
/**
 * Starts a timer that expires at a specific timestamp
 * @param {object} state - A copy of game state; reads state.timer as starting seconds
 * @param {function(number): void} onTick - Called every second with the updated time
 * @param {function(): void} onExpire - Called when the timer reaches 0
 */
export function startTimer(state, onExpire) {
  stopTimer();
  
  const timeRemaining = state.remainingOnPause > 0 ? state.remainingOnPause : state.timeLimit;

  timeoutId = setTimeout(() => {
    timeoutId = null;
    onExpire();
  }, timeRemaining);

  return Date.now() + state.timeLimit;
}

/**
 * Stops the countdown timer without triggering onExpire.
 * Safe to call even if the timer is not running.
 */
export function stopTimer() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

/**
 * Returns whether the timer is currently running.
 * @returns {boolean}
 */
export function isRunning() {
  return timeoutId !== null;
}