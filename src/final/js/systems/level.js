/**
 * level.js
 *
 * Defines hardcoded level configurations and handles level initialization.
 * Fetches questions from the category JSON, filters by difficulty, shuffles,
 * and returns a plain state object that game.js merges into its active state.
 *
 * The returned object is JSON-serializable and can be passed directly to
 * storage.js — no methods, no closures, no hidden state.
 *
 * game.js advances through questions by incrementing state.current_question_index.
 * The current prompt and answer are always:
 *   state.questions[state.current_question_index]
 *   state.answers[state.current_question_index]
 *
 * Imported by:
 * - game.js: calls loadLevel() at the start of each level
 *
 * @module level
 */

const LEVELS = [
  { levelNumber: 1, timeLimit: 3000, questionCount: 9, difficulty: 1 },
  { levelNumber: 2, timeLimit: 3000, questionCount: 9, difficulty: 2 },
  { levelNumber: 3, timeLimit: 3000, questionCount: 9, difficulty: 3 },
];

/**
 * Loads a level and returns an initialized state object.
 *
 * Fetches the category JSON, filters questions by difficulty, shuffles them,
 * then splits them into parallel questions[] and answers[] arrays so game.js
 * can access either by the same index.
 *
 * The returned object is a plain data object — it can be saved to localStorage
 * via storage.js without any conversion.
 *
 * @param {number} levelNumber - 1-indexed level number
 * @param {string} category    - Question category slug (e.g. "python", "unix")
 * @returns {Promise<GameState>}
 */
export async function loadLevel(levelNumber, category) {
  const config = LEVELS[levelNumber - 1];

  const response = await fetch(``../questions/${category}.json`);

  if (!response.ok) {
    throw new Error(
      `Failed to load questions for ${category}`
    );
  }

  const allQuestions = await response.json();

  // Filter by difficulty, shuffle, cap at questionCount
  const shuffled = allQuestions
    .filter(q => q.Difficulty === config.difficulty)
    .sort(() => Math.random() - 0.5)
    .slice(0, config.questionCount);

  // Split into parallel arrays — same index = same question
  const questions = shuffled.map(q => q.Question);
  const answers   = shuffled.map(q => q.answers);
  const base_scores = shuffled.map(q => q.baseScore);

  return {
    // ── Calculated from fetched data ──────────────────────────────────────
    questions,                          // shuffled prompt strings; index matches answers[]
    answers,                            // shuffled answer strings; index matches questions[]
    base_scores,                        // base score for each question, parallel to questions[] and answers[]
    total_questions: shuffled.length,   // may be < questionCount if the pool is small
    time_limit:      config.timeLimit,  // total seconds allowed, set by LEVELS config
    level:           config.levelNumber, // add level to gamestate for advancement purposes
    
    // ── Always start at zero / empty ─────────────────────────────────────
    plants:                 [0, 0, 0],  // 3 plants, each starting at growth stage 0
    current_question_index: 0,   // pointer into questions[] and answers[]
    current_input:          "",  // what the player has typed so far
    incorrect_chars:        0,   // wrong keystrokes this question; reset each question
    score:                  0,   // points earned this level
    questionStartTime: null,     // timestamp when the current question was loaded; used to calculate elapsed time
    endTime: null,               // timestamp when the timer should expire; set when the question starts
    remainingOnPause: null,      // seconds remaining when the game is paused; used to restore timer on resume
  };
}

/**
 * Returns the total number of available levels.
 * @returns {number}
 */
export function getLevelCount() {
  return LEVELS.length;
}
