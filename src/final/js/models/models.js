/**
 * models.js
 *
 * Single source of truth for data shapes used across the game.
 * Defines default structures for Profile and GameState.
 * No logic or storage calls. Shape definitions only.
 * Fields can be added here without requiring behavior changes elsewhere.
 *
 * Imported by:
 * - storage.js: uses defaults when slots are uninitialized
 *
 * Overview: docs/models-overview.md
 */

/**
 * @typedef {Object} Profile
 * @property {string} username - The player's chosen username
 * @property {number} level - The player's current level
 * @property {number} num_questions_answered - Total questions answered by the player
 * @property {string} language - The player's preferred programming language
 * @property {number} score - The player's total accumulated score
 * @property {boolean} isInitialized - Flag indicating if the profile has been set up
 */
export function defaultProfile() {
  return {
    username: "Guest",
    score: 0,
    level: 1,
    num_questions_answered: 0,
    language: "Python",
    isInitialized: false
  };
}

/**
 * @typedef {Object} GameState
 * Session-only data. Does NOT include the player profile.
 * Populated by level.js on each new level and reset between levels.
 * Safe to clear without affecting the persistent player profile.
 *
 * @property {number[]}  plants                 - Plant array holding plants indexed (0 - 2). Each plant has growth level stored as int at respective index.
 * @property {string[]}  questions              - Prompts for the current level (shuffled)
 * @property {string[]}  answers                - Answers parallel to questions[]
 * @property {number}    level                  - Current game level
 * @property {number}    current_question_index - Index into questions[] / answers[]
 * @property {string}    current_input          - Player's in-progress input for the active question
 * @property {number}    incorrect_chars        - Wrong keystrokes for the current question (reset each question)
 * @property {number}    time_limit             - Total milliseconds allowed for the question
 * @property {number}    question_start_time    - Timestamp when the current question started.
 * @property {number}    end_time               - Timestamp when the current question timer ends.
 * @property {number}    remaining_on_pause     - Remaining ms for timer at pause.
 * @property {number}    base_score             - Points accumulated this session
 * @property {boolean}   isActive               - Is game started
 * @property {boolean}   isPaused               - Is game paused
 */

/** @returns {GameState} */
export function defaultGameState() {
  return {
    plants:                 [0, 0, 0],
    questions:              [],
    answers:                [],
    base_scores:            [],
    level:                  1,
    current_question_index: 0,
    current_input:          "",
    incorrect_chars:        0,
    time_limit:             600000,
    question_start_time:    0,
    end_time:               0,
    remaining_on_pause:     60,
    score:                  0,
    isActive:              false,
    isPaused:              false
  };
}
