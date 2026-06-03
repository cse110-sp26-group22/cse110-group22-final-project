/**
 * game.js
 *
 * Central game engine. Owns the active GameState and Profile, coordinates
 * all other modules, and exposes functions for ui.js to call.
 *
 * Main responsibilities:
 * - Initialize and own GameState as single source of truth
 * - Handle game lifecycle: startLevel(), endGame(), pauseGame(), resumeGame()
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
 * - level.js      : loadLevel(levelNumber, category)
 * - timer.js      : startTimer(), stopTimer()
 * - scoring.js    : calculateTotalScore()
 * - storage.js    : saveProfile(), saveState()
 * - models/models.js : defaultGameState()
 *
 * Responses emitted via updateScreen():
 * - "correct-char"   → user typed a correct character 
 * - "incorrect"      → user typed a wrong character 
 * - "next-question"  → answer complete, next question ready
 * - "tick"           → timer fired, update timer display
 *
 * Screens emitted via loadScreen():
 * - "game"           → switch to game screen (level just started or resumed)
 * - "pause"          → switch to pause screen
 * - "endscreen"      → switch to end screen (time up or all questions done)
 * - "levelselect"    → switch to level select screen (player exits session)
 * - "mainmenu"       → switch to main menu (player exits session)
 */

import { loadLevel } from "./level.js";
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
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

/**
 * Starts a level. Fetches and shuffles questions via level.js, merges the
 * result into state (replacing only level-specific fields), starts the timer,
 * and signals ui-core to show the game screen.
 *
 * Called by the level-select UI when the user picks a level.
 *
 * @param {number} levelNumber - 1-indexed level number
 * @param {string} category    - Question category slug, e.g. "python"
 */
export async function startLevel(levelNumber, category) {
  
  // Refresh state, load level data to state, start timer, set flags
  state = defaultGameState();
  state = await loadLevel(levelNumber, category);
  state.endTime = startTimer( { ...state }, _onExpire);
  state.isActive = true;
  state.isPaused = false;

  // Transition to the game screen
  callbacks.loadScreen("game", { ...state });
}

/**
 * Ends the current game session: stops the timer, accumulates session results
 * into the player profile, persists both, clears in-progress state, and
 * signals ui-core to show the end screen.
 *
 * Called internally (all questions done, or timer expired) or by ui.js (quit).
 */
export function endGame() {
  state.isActive = false;
  state.isPaused = false;

  stopTimer();

  // Persist profile, clear in-progress session state
  saveProfile(player);

  callbacks.loadScreen("endscreen", {...state });
}

export function goToNextLevel() {
  state.isActive = true;
  state.isPaused = false;

  stopTimer();

  savePlayerData();

  callbacks.loadScreen("level_end", {...state });
  // ui will call startLevel(state.level + 1, player.language) if the user clicks "Next Level"
}

/**
 * Pauses the active countdown timer and loads the pause screen.
 */
export function pauseGame() {
  if (state.isPaused) return;

  state.isPaused = true;
  state.isActive = true;

  state.remainingOnPause = state.endTime - Date.now();

  stopTimer();

  callbacks.loadScreen("pause", { ...state });
}

/**
 * Resumes the countdown timer and loads the game screen.
 */
export function resumeGame() {
  if (!state.isPaused) return;
  
  state.isPaused = false;
  state.isActive = true;

  state.endTime = startTimer( { ...state }, _onExpire);
  state.remainingOnPause = 0;
  
  callbacks.loadScreen("game", { ...state });
}

/**
 * Exits the current session and returns to the level select screen.
 * Stops the timer and discards in-progress state without saving.
 * Called when the player presses the level select button.
 */
export function goToLevelSelect() { // UI does not presently have a level selection feature, nor is this used anywhere right now
  state.isActive = false;
  state.isPaused = false;
  stopTimer();
  callbacks.loadScreen("levelselect", { ...state });
}

/**
 * Exits the current session and returns to the main menu.
 * Stops the timer and discards in-progress state without saving.
 * Called when the player presses the main menu button.
 */
export function goToMainMenu() {
  state.isActive = false;
  state.isPaused = false;
  stopTimer();
  callbacks.loadScreen("mainmenu", { ...state });
}

// ── Game Input handling ────────────────────────────────────────────────────────────

/**
 * Called on every input in the code input field.
 * Checks the current input against the current prompt answer.
 *
 * ui.js wires this up like:
 *   inputEl.addEventListener("___", (e) => onInput(e.curr_input));
 *
 * Responses fired:
 * - "incorrect"     → prefix length of current input is not larger than max prefix length.
 * - "correct"       → prefix length of current input is larger than max prefix length.
 * - "next-question" → answer complete, index advanced to next question
 * - (endGame)       → answer complete and no more questions remain
 *
 * @param {string} input - Input entered by Player 
 */
export function onInput(input) {
  if (!state.isActive || state.isPaused) return;

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
    handleQuestionComplete();
    return;
  } 

  // Incorrect input
  if (prefixLength <= state.maxPrefixLength) {
    state.incorrectInputs++;
    callbacks.updateScreen("incorrect", { ...state });
    return;
  }

  // Correct input
  state.maxPrefixLength = prefixLength;
  callbacks.updateScreen("correct", { ...state });
  return;
}


/**
 * Handles the end of a question
 */
function handleQuestionComplete() {

  // Calculate post-question score
  const elapsedTime = Date.now() - state.questionStartTime;
  if (elapsedTime <= state.timeLimit) { //can probably be simplified by changes to scoring.js
    state.score += calculateTotalScore( { ...state }, elapsedTime);
  }
  else{
    state.score += 0;
  }

  // Increment current question
  state.currentQuestionIndex++;

  // Grow plant every 3rd question 
  if (state.currentQuestionIndex % 3 === 0) {
    // TODO: Change from array to int implementation
    state.plants[0]++; 
  }

  // If more questions exist -> Go to next question
  if (state.currentQuestionIndex < state.questions.length) {
    state.longestPrefix = "";
    state.incorrectInputs = 0;
    state.endTime = startTimer( { ...state }, _onExpire);
    callbacks.updateScreen("next-question", { ...state });
    return;
  }

  // If no more questions AND more levels exist -> Go to next level
  if (state.currentQuestionIndex >= state.questions.length && state.level < 3) {
    goToNextLevel();
    return;
  }

  // If no more questions AND no more levels exist -> End game
  endGame();
  return;
}



// ── Timer callbacks (internal) ────────────────────────────────────────────────

/**
 * Fired by timer.js when the countdown reaches 0.
 */
function _onExpire() {
  handleQuestionComplete(); 
}

// ── Profile management handling ────────────────────────────────────────────────

/** 
 * Save relevant session data in the player profile
*/
export function savePlayerData(){
  player.score += state.score; 
  player.level = state.level;
  saveProfile(player);
}
