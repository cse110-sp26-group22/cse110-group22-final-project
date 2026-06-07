/**
 * game.js
 *
 * Central game engine. Owns the active GameState and Profile, coordinates
 * all other modules, and exposes functions for ui.js to call.
 *
 * Main responsibilities:
 * - Initialize and own GameState as single source of truth
 * - Handle game lifecycle: startLevel(), restartLevel(), pauseGame(), resumeGame()
 * - Process player input (onInput) and update state accordingly
 * - Coordinate modules: level.js, scoring.js, timer.js, storage.js
 * - Fire callbacks back to glue.js after each state change
 *
 * Architecture:
 * - glue.js registers loadScreen / updateScreen callbacks on init
 * - game.js never touches the DOM directly = all UI updates go through callbacks
 * - state is the single source of truth
 *
 * Current question/answer are accessed by index:
 *   state.questions[state.current_question_index]
 *   state.answers[state.current_question_index]
 *
 * Advancing a question = state.current_question_index++
 *
 * state.timer counts down from time_limit to 0 (seconds remaining).
 * Elapsed time = state.time_limit - state.timer.
 *
 * Dependencies:
 * - level.js         : loadLevel(levelNumber, category)
 * - timer.js         : startTimer(), stopTimer()
 * - scoring.js       : calculateTotalScore()
 * - storage.js       : saveProfile(),
 * - models/models.js : defaultGameState()
 *
 * Responses emitted via updateScreen():
 * - "correct"        → user entered a correct input
 * - "incorrect"      → user entered a wrong input
 * - "next-question"  → answer complete, next question ready
 * - "plant-growth"    → plant growth level increased
 *
 * Screens emitted via loadScreen():
 * - "game"           → switch to game screen (level just started or resumed)
 * - "pause"          → switch to pause screen
 * - "results"        → switch to results screen (all levels completed)
 * - "mainmenu"       → switch to main menu (player exits session)
 */

import { getLevelCount, loadLevel } from "./level.js";
import { startTimer, stopTimer } from "./timer.js";
import { calculateTotalScore } from "./scoring.js";
import { saveProfile } from "./storage.js";
import { defaultGameState, defaultProfile } from "../models/models.js";



// ── Module-level state ──────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Session state - reset each level via Object.assign(state, levelData).
 * @type {ReturnType<typeof defaultGameState>}
 */
let state = defaultGameState();

/**
 * Persistent player profile = survives between levels.
 * @type {ReturnType<typeof defaultProfile>}
 */
let player = defaultProfile();

/**
 * Callbacks registered by glue.js.
 * game.js fires these after processing each event.
 */
const callbacks = {
  /** @type {((screenName: string, data: object) => void)|null} */
  loadScreen: null,

  /** @type {((response: string, data: object) => void)|null} */
  updateScreen: null,
};

const MAX_PLANT_GROWTH_LEVEL = 2;

// ── Callback registration ───────────────────────────────────────────────────────────────────────────────────────────

/**
 * Registers the UI callbacks that game.js fires after state changes.
 * Must be called once by ui-core.js on page load, before any user action.
 *
 * @param {(screenName: string, data: object) => void} loadScreen
 *   Called when game.js wants to switch to a different screen.
 * @param {(response: string, data: object) => void} updateScreen
 *   Called when game.js wants to update the current screen in-place.
 */
export function registerCallbacks(loadScreen, updateScreen) {
  callbacks.loadScreen = loadScreen;
  callbacks.updateScreen = updateScreen;
  console.debug("Registered game.js callbacks");
}

// ── Lifecycle  ─────────────────────────────────────────────────────────────────────────────────────────────────────

// ── Called by [mainmenu] UI (exclusive) ──────────────────────────────────────

/**
 * Sets the language used for this game sequence
 * @param {string} category    - Question category (e.g. "python, javascript")
 */
export function setLanguage(category) {
  player.language = category;
}

// ── Called by [pause] UI (exclusive) ─────────────────────────────────────────

/**
 * Resumes the countdown timer using remaining time on pause, updates state, and loads the game screen.
 */
export function resumeGame() {
  if (!state.isPaused) return;
  state.isPaused = false;
  state.isActive = true;
  state.isOver = false;
  startTimer( { ...state }, _onExpire);
  state.questionEndTime = Date.now() + state.remainingOnPause;
  state.remainingOnPause = 0;
  callbacks.loadScreen("game", { ...state });
}

/**
 * Restarts the current level with a fresh set of questions.
 * Resets all state except for player profile and language selection.
 * Note: may be replaced by an isolated call to startLevel(); this is intended for code readability purposes
 */
export function restartLevel() {
  if(state.isPaused || state.isOver || !state.isActive){ return; }
  state.isPaused = false;
  state.isActive = true;
  state.isOver = false;
  startLevel(state.level, state.language);
}

// ── Called by [game] UI (exclusive) ──────────────────────────────────────────

/**
 * Pauses the active countdown timer and, saves time remaining for questionm and loads the pause screen.
 */
export function pauseGame() {
  if (state.isPaused) return;
  state.isPaused = true;
  state.isActive = true;
  state.isOver = false;
  state.remainingOnPause = Math.max(0, state.questionEndTime - Date.now());
  stopTimer();
  callbacks.loadScreen("pause", { ...state });
}

/**
 * Recieves user text input, updates GameState, returns responses,
 * Checks the current input against the current prompt answer.
 *
 * Responses fired:
 * - "incorrect"     → prefix length of current input is not larger than max prefix length.
 * - "correct"       → prefix length of current input is larger than max prefix length.
 * - "next-question" → answer complete, index advanced to next question
 * - (endGame)       → answer complete and no more questions remain
 *
 * @param {string} input - Input entered by Player 
 */
export async function onInput(input) {
  if (!state.isActive || state.isPaused || state.isOver) return;

  // Determine if input is valid and should be counted
  const previousInput = state.currentInput;
  const isDeletion = input.length < previousInput.length;
  const addedText = input.length > previousInput.length ? input.slice(previousInput.length) : "";
  const isWhitespaceOnlyInput = addedText.length > 0 && addedText.trim() === "";
  const shouldCountInput = !isDeletion && !isWhitespaceOnlyInput;
  state.currentInput = input;
  if (shouldCountInput) state.totalInputs++;

  // Calculate input prefix length
  const answer = state.answers[state.currentQuestionIndex];
  if (!answer) return;
  let prefixLength = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] != answer[i]) {
      break;
    }
    prefixLength++;
  }

  // If input is correct and typed answer is complete, run completed answer behavior
  if (input === answer) {
    console.debug("Answer complete for question index", state.currentQuestionIndex);
    await handleQuestionComplete();
    return;
  } 

  // If input is incorrect, apply state penalites and update UI 
  if (prefixLength <= state.maxPrefixLength) {
    if (shouldCountInput) {
      state.incorrectInputs++;
      state.totalIncorrectInputs++;
    }
    state.combo = 0;
    callbacks.updateScreen("incorrect", { ...state });
    return;
  }

  // If input is correct and typed answer is incomplete, apply bonuses to state and update UI
  state.maxPrefixLength = prefixLength;
  state.combo++;
  callbacks.updateScreen("correct", { ...state });
  return;
}

// ── Called by [mainmenu, pause, results] UI ──────────────────────────────

/**
 * Starts a level. Fetches and shuffles questions via level.js, merges the
 * result into state (replacing only level-specific fields), starts the timer,
 * and signals glue.js to show the game screen.
 *
 * @param {number} levelNumber - 1-indexed level number
 * @param {string} category    - Question category slug, e.g. "python"
 */
export async function startLevel(levelNumber, category) {
  player.language = category;
  state = await loadLevel(levelNumber, category);
  state.questionEndTime = startTimer( { ...state }, _onExpire);
  callbacks.loadScreen("game", { ...state });
}

// ── Called by [pause, results] UI ────────────────────────────────────────

/**
 * Exits the current session and returns to the main menu.
 * Stops the timer and discards in-progress state without saving.
 * Called when the player presses the main menu button.
 */
export function goToMainMenu() {
  state.isActive = false;
  state.isPaused = false;
  stopTimer();
  player = defaultProfile();
  callbacks.loadScreen("mainmenu", { ...state });
}

// ── Called internally ────────────────────────────────────────────────────

/**
 * Handles end of level behavior. Stops the timer, saves player data,
 * and advances UI to "results" screen
 */
function goToResults() {
  state.isActive = false;
  state.isPaused = false;
  stopTimer();
  savePlayerData();
  callbacks.loadScreen("results", { ...state });
}

/**
 * Handles all state updates after the current question ends.
 *
 * This function:
 * - Stops the active question timer.
 * - Records time used for the question.
 * - Applies timeout penalties or awards score for a completed answer.
 * - Advances the question index.
 * - Updates plant growth when the player reaches a progress milestone.
 * - Either starts the next question, shows level results, or ends the game.
 */
async function handleQuestionComplete() {
  if(state.isPaused || state.isOver || !state.isActive){ return; }

  // Stop timer to prevent unintentional UI advancement
  stopTimer();

  // Record timing and answer data for this
  const timeRemaining = Math.max(0, state.questionEndTime - Date.now());
  const elapsedTime = Math.max(0, state.timeLimit - timeRemaining);
  const answer = state.answers[state.currentQuestionIndex] ?? "";
  state.timeUsed.push(elapsedTime);
  state.totalAnswerCharacters += answer.length; 

  // If question timed out, do not update score and add penalties to state
  if (elapsedTime > state.timeLimit) {
    const remainingCharacters = answer.length - state.maxPrefixLength;
    state.totalInputs += remainingCharacters;
    state.totalIncorrectInputs += remainingCharacters;
  }
  // If question finished normally, calculate new score and increment counter for correct questions
  else {
    state.score += calculateTotalScore({ ...state }, elapsedTime);
    state.numCorrectQuestions++;
  }

  // Set state to next question
  state.currentQuestionIndex++;

  // Calculate plant growth level and update UI with new plant growth value
  if (elapsedTime <= state.timeLimit && state.numCorrectQuestions % 3 === 0) {
    if(state.growthLevel < MAX_PLANT_GROWTH_LEVEL) {
      state.growthLevel++;
      callbacks.updateScreen("plant-growth", { ...state });
    }
  }

  // If there are still question left in this level, reset the per-question state
  // and advance UI to next question
  if (state.currentQuestionIndex < state.questions.length) {
    state.maxPrefixLength = 0;
    state.currentInput = "";   
    state.incorrectInputs = 0;
    state.combo = 0;
    state.questionStartTime = Date.now();
    state.questionEndTime = startTimer( { ...state }, _onExpire);
    callbacks.updateScreen("next-question", { ...state });
    return;
  }

  // If the level is complete but more levels exist, add score to player total
  // and advance UI to level results screen
  if (state.currentQuestionIndex >= state.questions.length && state.level < getLevelCount()) {
    player.score += state.score;
    const accuracyPercentage = (1 - (state.totalIncorrectInputs / state.totalInputs));
    state.levelAccuracyPercent = accuracyPercentage.toFixed(2);
    goToResults();
    return;
  }

  // If the level is complete and no more levels exist, set game state to "gameover",
  // calculate final score, and advance UI to level results screen
  state.isOver = true;
  state.finalScore = player.score;
  const accuracyPercentage = (1 - (state.totalIncorrectInputs / state.totalInputs));
  state.levelAccuracyPercent = accuracyPercentage.toFixed(2);
  goToResults();
  return;
}

// ── Timer callbacks (internal) ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Fired by timer.js when the countdown reaches 0.
 */
function _onExpire() {
  handleQuestionComplete();
}

// ── Profile management handling ─────────────────────────────────────────────────────────────────────────────────────

/** 
 * Save relevant session data in the player profile
*/
function savePlayerData(){
  player.score += state.score; 
  player.level = state.level;
  saveProfile(player);
}
