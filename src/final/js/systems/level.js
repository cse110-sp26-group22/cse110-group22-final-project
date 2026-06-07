/**
 * level.js
 *
 * Defines hardcoded level configurations and handles level initialization.
 * Fetches questions from the category JSON, filters by difficulty, shuffles,
 * and returns a plain state object that game.js merges into its active state.
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

import { defaultGameState } from "../models/models.js";

import javascriptQuestions from "../../../../questions/javascript.js";
import pythonQuestions from "../../../../questions/python.js";

const LEVELS = [
  { levelNumber: 1, timeLimit: 30000, questionCount: 9, difficultyMin: 1, difficultyMax: 3  },
  { levelNumber: 2, timeLimit: 25000, questionCount: 9, difficultyMin: 4, difficultyMax: 6  },
  { levelNumber: 3, timeLimit: 20000, questionCount: 9, difficultyMin: 7, difficultyMax: 10 },
];

/**
 * Loads a level and returns an initialized state object.
 *
 * Fetches the category JSON, filters questions by difficulty, shuffles them,
 * then splits them into parallel questions[] and answers[] arrays so game.js
 * can access either by the same index.
 *
 * The returned object is a plain data object = it can be saved to localStorage
 * via storage.js without any conversion.
 *
 * @param {number} levelNumber - 1-indexed level number
 * @param {string} category    - Question category (e.g. "python", "javascript")
 * @returns {Promise<GameState>}
 */
export async function loadLevel(levelNumber, category) {
  const config = LEVELS[levelNumber - 1];
  let allQuestions;

  if(category === "javascript") {
    allQuestions = javascriptQuestions;
  } else if (category === "python") {
    allQuestions = pythonQuestions;
  } else {
    const response = await fetch(`../../../questions/${category}.json`);
    if (!response.ok) {
        throw new Error(
        `Failed to load questions for ${category}`
        );
    }
    console.debug(`Loaded questions for ${category} category`);
    allQuestions = await response.json();
  }
    
  // Filter by difficulty, shuffle, cap at questionCount
  const shuffled = allQuestions
    .filter(q => q.Difficulty >= config.difficultyMin && q.Difficulty <= config.difficultyMax)
    .sort(() => Math.random() - 0.5)
    .slice(0, config.questionCount);

  // Split into parallel arrays = same index = same question
  const questions  = shuffled.map(q => q.Question);
  const answers    = shuffled.map(q => q.Answer);
  const baseScores = shuffled.map(q => q.baseScore);
  console.debug(`Selected questions for level ${config.levelNumber}:`, questions);
  return {
    ...defaultGameState(),
    questions,
    answers,
    baseScores,
    isActive:          true,
    isPaused:          false,
    level:             config.levelNumber,
    timeLimit:         config.timeLimit,
    language:          category,
    totalQuestions:    questions.length,
    questionStartTime: Date.now(),
  };
}

/**
 * Returns the total number of available levels.
 * @returns {number}
 */
export function getLevelCount() {
  return LEVELS.length;
}
