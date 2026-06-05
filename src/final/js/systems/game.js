/**
 * game.js
 *
 * Central game engine. Owns the active GameState and Profile, coordinates
 * all other modules, and exposes functions for ui.js to call.
 *
 * Main responsibilities:
 * - Initialize and own GameState as single source of truth
 * - Handle game lifecycle: startLevel(), pauseGame(), resumeGame()
 * - Process player input (onInput) and update state accordingly
 * - Coordinate modules: level.js, scoring.js, timer.js, storage.js
 * - Fire callbacks back to ui-core.js after each state change
 *
 * Architecture:
 * - ui-core.js registers loadScreen / updateScreen callbacks on init
 * - game.js never touches the DOM directly — all UI updates go through callbacks
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



// ── Module-level state ────────────────────────────────────────────────────────

/**
 * Session state — reset each level via Object.assign(state, levelData).
 * @type {ReturnType<typeof defaultGameState>}
 */
let state = defaultGameState();

/**
 * Persistent player profile — survives between levels.
 * Loaded from storage on init; saved to storage on endGame.
 * @type {ReturnType<typeof defaultProfile>}
 */
let player = defaultProfile();

/**
 * Callbacks registered by ui-core.js.
 * game.js fires these after processing each event.
 */
const callbacks = {
  /** @type {((screenName: string, data: object) => void)|null} */
  loadScreen: null,

  /** @type {((response: string, data: object) => void)|null} */
  updateScreen: null,
};

const MAX_PLANT_GROWTH_LEVEL = 2;

function copyState() {
  return {
    ...state,
    growthLevel: [...state.growthLevel],
    timeUsed: [...state.timeUsed],
  };
}

function growActivePlant() {
  if (state.growthLevel.length === 0) state.growthLevel.push(0);

  const activePlantIndex = state.growthLevel.length - 1;
  if (state.growthLevel[activePlantIndex] < MAX_PLANT_GROWTH_LEVEL) {
    state.growthLevel[activePlantIndex]++;
    return;
  }

  state.growthLevel.push(0);
}

// ── Callback registration ─────────────────────────────────────────────────────

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

// ── Lifecycle  ───────────────────────────────────────────────────────────────

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
 * Resumes the countdown timer and loads the game screen.
 */
export function resumeGame() {
  if (!state.isPaused) return;
  
  state.isPaused = false;
  state.isActive = true;

  const timeRemaining = state.remainingOnPause > 0 ? state.remainingOnPause : state.timeLimit;
  startTimer( { ...state }, _onExpire);
  state.questionEndTime = Date.now() + timeRemaining;
  state.remainingOnPause = 0;
  
  callbacks.loadScreen("game", copyState());
}

// ── Called by [game] UI (exclusive) ──────────────────────────────────────────

/**
 * Pauses the active countdown timer and loads the pause screen.
 */
export function pauseGame() {
  if (state.isPaused) return;

  state.isPaused = true;
  state.isActive = true;

  state.remainingOnPause = Math.max(0, state.questionEndTime - Date.now());

  stopTimer();

  callbacks.loadScreen("pause", copyState());
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
  if (!state.isActive || state.isPaused) return;

  const previousInput = state.currentInput;  // TODO: Replace. Depreciated value. Does not work with front-end. Likely maxPrefixLength should be used in scoring.
  const isDeletion = input.length < previousInput.length;
  const addedText = input.length > previousInput.length
    ? input.slice(previousInput.length)
    : "";
  const isWhitespaceOnlyInput = addedText.length > 0 && addedText.trim() === "";
  const shouldCountInput = !isDeletion && !isWhitespaceOnlyInput;
  state.currentInput = input;                // TODO: Replace. Depreciated value. Does not work with front-end. Likely maxPrefixLength should be used in scoring.

  if (shouldCountInput) state.totalInputs++;

  const answer = state.answers[state.currentQuestionIndex];
  if (!answer) return;

  // Calculate input prefix length
  let prefixLength = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] != answer[i]) {
      break;
    }
    prefixLength++;
  }

  // Correct input + Completed answer 
  if (input === answer) {
    console.debug("Answer complete for question index", state.currentQuestionIndex);
    await handleQuestionComplete(true);
    return;
  } 

  // Incorrect input
  if (prefixLength <= state.maxPrefixLength) {
    if (shouldCountInput) {
      state.incorrectInputs++;
      state.totalIncorrectInputs++;
    }
    state.combo = 0;
    callbacks.updateScreen("incorrect", copyState());
    return;
  }

  // Correct input
  state.maxPrefixLength = prefixLength;
  state.combo++;
  callbacks.updateScreen("correct", copyState());
  return;
}

// ── Called by [mainmenu, pause, results] UI ────────────────────────────────

/**
 * Starts a level. Fetches and shuffles questions via level.js, merges the
 * result into state (replacing only level-specific fields), starts the timer,
 * and signals ui-core to show the game screen.
 *
 * @param {number} levelNumber - 1-indexed level number
 * @param {string} category    - Question category slug, e.g. "python"
 */
export async function startLevel(levelNumber, category) {
  
  // Refresh state, load level data to state, start timer, set flags
  state = defaultGameState();
  player.language = category;
  Object.assign(state, await loadLevel(levelNumber, category));
  state.totalQuestions = state.questions.length;
  state.questionStartTime = Date.now();
  state.questionEndTime = startTimer( { ...state }, _onExpire);
  state.language = category;
  state.isActive = true;
  state.isPaused = false;

  // Transition to the game screen
  callbacks.loadScreen("game", copyState());
}

/**
 * TODO: Remove. Depreciated handler.
 */
export function goToLevelSelect() {
  return;
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

  callbacks.loadScreen("mainmenu", copyState());
}

// ── Called internally ────────────────────────────────────────────────────

function goToResults() {
  state.isActive = false;
  state.isPaused = false;

  stopTimer();

  savePlayerData();

  callbacks.loadScreen("results", copyState());
}

/**
 * Handles the end of a question
 */
async function handleQuestionComplete(answeredCorrectly = false) {

  // Calculate post-question score
  const timeRemaining = Math.max(0, state.questionEndTime - Date.now());
  const elapsedTime = Math.max(0, state.timeLimit - timeRemaining);
  const answer = state.answers[state.currentQuestionIndex] ?? "";
  state.timeUsed.push(elapsedTime);
  state.totalAnswerCharacters += answer.length;
  const answeredWithinTime = answeredCorrectly && elapsedTime <= state.timeLimit;

  if (answeredWithinTime) {
    state.score += calculateTotalScore(copyState(), elapsedTime);
    state.numCorrectQuestions++;
  }
  else{
    state.score += 0;
  }

  // Increment current question
  state.currentQuestionIndex++;

  // Grow plant every 3rd question answered within time limit
  if (answeredWithinTime && state.numCorrectQuestions % 3 === 0) {
    growActivePlant();
    callbacks.updateScreen("plant-growth", copyState());
  }

  // If more questions exist -> Go to next question
  if (state.currentQuestionIndex < state.questions.length) {
    state.maxPrefixLength = 0;
    state.currentInput = "";    // TODO: Replace. Depreciated value. Does not work with front-end. Likely maxPrefixLength should be used in scoring.
    state.incorrectInputs = 0;
    state.questionStartTime = Date.now();
    state.questionEndTime = startTimer( { ...state }, _onExpire);
    callbacks.updateScreen("next-question", { ...state });
    return;
  }

  // If no more questions AND more levels exist -> Go to results
  if (state.currentQuestionIndex >= state.questions.length && state.level < getLevelCount()) {
    player.score += state.score;
    goToResults();
    return;
  }

  // If no more questions AND no more levels exist -> Go to results + Gameover state updates
  state.isOver = true;
  state.finalScore = player.score;
  goToResults();
  return;
}

// ── Timer callbacks (internal) ────────────────────────────────────────────────

/**
 * Fired by timer.js when the countdown reaches 0.
 */
function _onExpire() {
  handleQuestionComplete(false);
}

// ── Profile management handling ────────────────────────────────────────────────

/** 
 * Save relevant session data in the player profile
*/
function savePlayerData(){
  player.score += state.score; 
  player.level = state.level;
  saveProfile(player);
}
