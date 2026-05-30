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
 * - storage.js    : saveProfile(), saveState(), clearState()
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
import { saveProfile, clearState } from "./storage.js";
import { defaultGameState, defaultProfile } from "../models/models.js";
import { growNextPlant } from "./plants.js";



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
 
  state = await loadLevel(levelNumber, category);
  state.isActive = true;
  state.isPaused = false;
  // Start the countdown timer
  startQuestionTimer();

  // Signal ui-core to transition to the game screen
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

  // Accumulate session results into the persistent player profile
  player.score += calculateTotalScore(state.base_score, { ...state });
  player.num_questions_answered += state.current_question_index;

  // Persist profile, clear in-progress session state
  saveProfile(player);
  clearState();

  callbacks.loadScreen("endscreen", {...state });
}

export function goToNextLevel() {
  state.isActive = true;
  state.isPaused = false;
  stopTimer();

  savePlayerData();
  state = defaultGameState();

  callbacks.loadScreen("level_end", {...state });
  // ui will call startLevel(state.level + 1, player.language) if the user clicks "Next Level"
}

/**
 * Pauses the active countdown timer and loads the pause screen.
 */
export function pauseGame() {
  state.isPaused = true;
  state.isActive = true;

  state.remaining_on_pause = state.end_time - Date.now();

  stopTimer();
  callbacks.loadScreen("pause", { ...state });
}

/**
 * Resumes the countdown timer and loads the game screen.
 */
export function resumeGame() {
  state.isPaused = false;
  state.isActive = true;

  if(state.remaining_on_pause <= 0) {
    _onExpire();
    return;
  }
  
  state.end_time = Date.now() + state.remaining_on_pause;

  startTimer(state.end_time, _onExpire);
  callbacks.loadScreen("game", { ...state });
}

/**
 * Exits the current session and returns to the level select screen.
 * Stops the timer and discards in-progress state without saving.
 * Called when the player presses the level select button.
 */
export function goToLevelSelect() { //UI does not presently have a level selection feature, nor is this used anywhere right now
  state.isActive = false;
  state.isPaused = false;
  stopTimer();
  state = defaultGameState();
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
  state = defaultGameState();
  callbacks.loadScreen("mainmenu", { ...state });
}

// ── Game Input handling ────────────────────────────────────────────────────────────

/**
 * Called on every keypress in the code input field.
 * Checks the typed key against the expected next character in the current answer.
 *
 * ui.js wires this up like:
 *   inputEl.addEventListener("keyup", (e) => onInput(e.key));
 *
 * Responses fired:
 * - "incorrect"     → wrong character typed
 * - "correct-char"  → right character, answer not yet complete
 * - "next-question" → answer complete, index advanced to next question
 * - (endGame)       → answer complete and no more questions remain
 *
 * @param {string} key - Single character typed by the player (e.key)
 */
export function onInput(key) {
  if (!state.isActive || state.isPaused) return;

  const answer = state.answers[state.current_question_index];
  if (!answer) return;

  const i = state.current_input.length;

  // ignore invalid keys like Shift, etc.
  if (!key || key.length !== 1) return;

  const expectedChar = answer[i];

  //correctness is evaluated per keystroke
  if (key === expectedChar) {
    state.current_input += key;

    callbacks.updateScreen("correct-char", {
      index: i,
      char: key,
      ...state,
    });
  } else {
    state.incorrect_chars++;

    callbacks.updateScreen("incorrect", {
      index: i,
      typed: key,
      expected: expectedChar,
      ...state,
    });
  }

  // completion check
  if (state.current_input === answer) {
    handleQuestionComplete();
  }
}

/**
 * Handles the end of a question
 */
function handleQuestionComplete() {
  //init time
   const elapsedTime = Date.now() - state.question_start_time;

  //calculate score and add to total score
  if(elapsedTime <= state.time_limit) { //can probably be simplified by changes to scoring.js
    state.score += calculateTotalScore(state, elapsedTime);
  }
  else{
    state.score += 0;
  }

  if(state.current_question_index % 3 === 0) {
    state.plants = growNextPlant(state);
    callbacks.updateScreen("plant-growth", { ...state });
  }

  state.current_input = "";
  state.incorrect_chars = 0;

  state.current_question_index++;

  if (state.current_question_index >= state.questions.length) {
    if (state.level >= 3) {
      endGame();
    }
    else {     
      goToNextLevel();
    }
    return;
  }

  startQuestionTimer();

  callbacks.updateScreen("next-question", { ...state });
}


// ── Timer callbacks (internal) ────────────────────────────────────────────────


/**
 * Starts a timer that expires at a specific timestamp
 * Called internally when a new question starts
 */
function startQuestionTimer() {
  stopTimer();

  state.question_start_time = Date.now();

  state.end_time =
      state.question_start_time +
      state.time_limit;

  startTimer(
      state.end_time,
      _onExpire
  );
}

/**
 * Fired by timer.js when the countdown reaches 0.
 */
function _onExpire() {
  handleQuestionComplete(); 
}

/** 
 * Save relevant session data in the player profile
*/
export function savePlayerData(){
  player.score = state.score; 
  player.level = state.level;
  player.current_question_index = state.current_question_index;
  saveProfile(player);
}
