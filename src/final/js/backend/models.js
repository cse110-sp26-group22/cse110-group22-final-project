/**
 * models.js
 *
 * Single source of truth for data shapes used across the game.
 * Defines default structures for Profile and GameState as plain objects,
 * and lightweight classes for Player, Farm, and Plant.
 * No heavy logic or storage calls — shape definitions only.
 *
 * Imported by:
 * - storage.js: uses defaults when localStorage is empty
 * - game.js: initializes live state and profile
 */

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Profile
 * @property {string} name - Display name set by the user
 * @property {string|null} createdAt - ISO timestamp of profile creation
 * @property {number[]} highScores - Best score per level, index corresponds to level number (0-indexed)
 */

/** @returns {Profile} */
export function defaultProfile() {
  return {
    name: "",
    createdAt: null,
    highScores: [0, 0, 0, 0, 0],
  };
}

// ─── Plant ───────────────────────────────────────────────────────────────────

/**
 * Growth stages:
 *   0 = seedling
 *   1 = growing
 *   2 = mature
 *
 * @typedef {Object} Plant
 * @property {string} type
 * @property {number} growth_stage
 */
export class Plant {
  /**
   * @param {string} type - Plant type (e.g. "carrot", "sunflower")
   */
  constructor(type = "default") {
    this.type = type;
    this.growth_stage = 0;
  }

  /**
   * Advances growth stage by 1, capped at 2 (mature).
   */
  grow() {
    if (this.growth_stage < 2) {
      this.growth_stage++;
    }
  }
}

// ─── Farm ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Farm
 * @property {Plant[]} plants
 * @property {number} num_plants
 */
export class Farm {
  constructor() {
    this.plants = [];
    this.num_plants = 0;
  }

  /**
   * Creates and adds a new Plant to the farm.
   * @param {string} type - Plant type
   * @returns {Plant}
   */
  addPlant(type = "default") {
    const plant = new Plant(type);
    this.plants.push(plant);
    this.num_plants = this.plants.length;
    return plant;
  }
}

// ─── Player ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Player
 * @property {string} username
 * @property {number} score
 * @property {number} level
 * @property {number} num_questions_answered
 * @property {string} language
 * @property {Farm} farm
 */
export class Player {
  /**
   * @param {string} username
   * @param {string} language - Selected coding language (e.g. "javascript")
   */
  constructor(username = "player", language = "javascript") {
    this.username = username;
    this.score = 0;
    this.level = 1;
    this.num_questions_answered = 0;
    this.language = language;
    this.farm = new Farm();
  }
}

// ─── GameState ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} GameState
 * @property {number} score - Current game score
 * @property {Array} questions - Full question list loaded from questions.js (not persisted)
 * @property {number} currentQuestionIndex - Index of the active question in questions[]
 * @property {string} currentInput - What the player has typed so far for the current word (not persisted)
 * @property {number} timeRemaining - Seconds left in the current game
 * @property {Player} player
 * @property {number[]} completed_question_ids
 * @property {number|null} current_question_id
 */

/** @returns {GameState} */
export function defaultGameState() {
  return {
    // Original fields — kept for storage.js and existing tests
    score: 0,
    questions: [],
    currentQuestionIndex: 0,
    currentInput: "",
    timeRemaining: 60,
    // New fields from Sprint 3 architecture
    player: new Player(),
    completed_question_ids: [],
    current_question_id: null,
  };
}