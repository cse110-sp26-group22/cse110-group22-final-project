/**
 * game.js
 *
 * Central game engine. Owns the active GameState and Profile, coordinates
 * all other modules, and exposes functions for ui.js to call.
 *
 * Main responsibilities:
 * - Initialize and own GameState and Profile
 * - Handle game lifecycle (startLevel, nextQuestion, endGame, pauseGame)
 * - Process player input (onInput) and update state accordingly
 * - Coordinate modules: level.js, scoring.js, timer.js, storage.js
 * - Return results to ui.js after each state change
 *
 * Dependencies:
 * - level.js: loadLevel()
 * - timer.js: startTimer(), stopTimer()
 * - scoring.js: calculateScore()
 * - storage.js: loadProfile(), saveProfile(), loadState(), saveState()
 * - models.js: defaultGameState(), defaultProfile()
 *
 * Exports:
 * - startLevel(levelNumber, category)
 * - nextQuestion()
 * - onInput(key)
 * - endGame()
 * - pauseGame() / resumeGame()
 */

/** @typedef {import('./models.js').Profile} Profile */
/** @typedef {import('./models.js').GameState} GameState */

import { defaultGameState, defaultProfile } from './models.js';
import { loadLevel, getLevelCount } from './level.js';
import { loadProfile, saveProfile, loadState, saveState } from './storage.js';

// Game state variables
/** @type {GameState} */
let state = defaultGameState();

/** @type {Profile} */
let profile = defaultProfile();

let isGameActive = false;
let isPaused = false;

/**
 * Initializes the game on startup.
 * Loads profile and state from storage.
 * @returns {void}
 */
export function initGame() {
  profile = loadProfile();
  state = loadState();
}

/**
 * Starts a new level.
 * @param {number} levelNumber - The level to start (1-indexed)
 * @param {string} category - The category of questions (e.g. "python", "unix")
 * @returns {Promise<GameState>}
 */
export async function startLevel(levelNumber, category) {
  if (levelNumber < 1 || levelNumber > getLevelCount()) {
    throw new Error(`Invalid level: ${levelNumber}`);
  }

  state = defaultGameState();
  await loadLevel(state, levelNumber, category);
  isGameActive = true;
  isPaused = false;
  saveState(state);
  return state;
}

/**
 * Advances to the next question.
 * @returns {GameState} The updated game state
 */
export function nextQuestion() {
  if (!isGameActive) return state;

  state.currentQuestionIndex++;
  state.currentInput = "";

  // Check if all questions answered
  if (state.currentQuestionIndex >= state.questions.length) {
    endGame();
  }

  saveState(state);
  return state;
}

/**
 * Processes player input.
 * @param {string} input - The input provided by the player
 * @returns {GameState} The updated game state
 */
export function onInput(input) {
  if (!isGameActive || isPaused) return state;

  state.currentInput = input;
  saveState(state);
  return state;
}

/**
 * Ends the current game.
 * Updates high score if necessary and saves profile.
 * @returns {GameState} The final game state
 */
export function endGame() {
  isGameActive = false;
  // High score logic would go here if scoring module is implemented
  saveProfile(profile);
  saveState(state);
  return state;
}

/**
 * Pauses the game.
 * @returns {GameState}
 */
export function pauseGame() {
  isPaused = true;
  saveState(state);
  return state;
}

/**
 * Resumes the game.
 * @returns {GameState}
 */
export function resumeGame() {
  isPaused = false;
  saveState(state);
  return state;
}

/**
 * Returns the current game state.
 * @returns {GameState}
 */
export function getState() {
  return state;
}

/**
 * Returns the current profile.
 * @returns {Profile}
 */
export function getProfile() {
  return profile;
}
