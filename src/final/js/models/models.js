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
 * @property {string} username               - The player's chosen username
 * @property {number} level                  - The player's current level
 * @property {number} current_question_index - The index of the current question
 * @property {string} language               - The player's preferred programming language
 * @property {number} score                  - The player's total accumulated score
 * @property {boolean} isInitialized         - Flag indicating if the profile has been set up
 */
export function defaultProfile() {
  return {
    username:               "Guest",
    score:                  0,
    level:                  1,
    current_question_index: 0,
    language:               "python",
    isInitialized:          false,
    plants:                 [0, 0, 0] // TODO: Change from array to int implementation
  };
}

/**
 * @typedef {Object} GameState
 * Session-only data. Does NOT include the player profile.
 * Populated by level.js on each new level and reset between levels.
 * Safe to clear without affecting the persistent player profile.
 *
 * @property {number[]}  plants               - Plants 
 * @property {number[]}  growthLevel          - Growth stage for each plant, indexed 0 - 2
 * @property {string[]}  questions            - Prompts for the current level (shuffled)
 * @property {string[]}  answers              - Answers parallel to questions[]
 * @property {number[]}  baseScores           - Score for each question derived from question set
 * @property {string}    language             - Selected language in main menu
 * @property {number}    level                - Current game level
 * @property {number}    currentQuestionIndex - Index into questions[] / answers[]
 * @property {string}    currentInput         - Current text entered by the player     
 * @property {number}    maxPrefixLength      - Max input prefix length seen for respective answer
 * @property {number}    totalInputs          - Total inputs entered for current level
 * @property {number}    totalIncorrectInputs - Wrong input events this level
 * @property {number}    clicksPerMinute      - CPM for current level
 * @property {number}    totalQuestions       - Total questions loaded for this level
 * @property {number}    totalAnswerCharacters - Total answer length for completed questions
 * @property {number}    incorrectInputs      - Wrong inputs for current question
 * @property {number}    combo                - Number of correct inputs entered in a row
 * @property {number}    timeLimit            - Total milliseconds allowed for the question
 * @property {number[]}  timeUsed             - Milliseconds used for each completed question
 * @property {number}    questionStartTime    - Timestamp when the current question started.
 * @property {number}    questionEndTime      - Timestamp when the current question timer ends.
 * @property {number}    remainingOnPause     - Remaining ms for timer at pause.
 * @property {number}    score                - Points accumulated this level
 * @property {number}    finalScore           - Total points accumilated this game session
 * @property {boolean}   isActive             - Is game started
 * @property {boolean}   isPaused             - Is game paused
 * @property {boolean}   isOver               - Is game completed
 */

/** @returns {GameState} */
export function defaultGameState() {
  return {
    growthLevel:          0,
    questions:            [],
    answers:              [],
    baseScores:           [],
    language:             null,
    level:                1,
    currentQuestionIndex: 0,
    currentInput:         "",
    numCorrectQuestions:  0,  
    maxPrefixLength:      0,
    totalInputs:          0,  
    totalIncorrectInputs: 0,
    clicksPerMinute:      0,
    totalQuestions:       0,
    totalAnswerCharacters: 0,
    incorrectInputs:      0,
    combo:                0,  
    timeLimit:            600000,
    timeUsed:             [],
    questionStartTime:    0,
    questionEndTime:      0,
    remainingOnPause:     0,
    levelAccuracyPercent: 0,
    score:                0,
    finalScore:           0,
    isActive:             false,
    isPaused:             false,
    isOver:               false
  };
}
