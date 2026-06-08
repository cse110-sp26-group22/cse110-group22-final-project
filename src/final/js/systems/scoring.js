/**
 * scoring.js
 *
 * Deterministic, pure scoring functions for a single question and the overall
 * game session.  No function here mutates game state directly = each returns a
 * value that game.js applies to the state.
 *
 * Score pipeline per question:
 *   baseScore × accuracyMultiplier × timeMultiplier × comboMultiplier + plantBonus
 *
 * Multiplier ranges:
 *   - accuracy : 0.50 – 1.00  (clamped; perfect accuracy = 1.0)
 *   - time     : 0.70 – 1.30  (faster answers score higher)
 *   - combo    : 1.00 – 2.00  (5 % boost per consecutive correct char, capped)
 *   - plant    : flat bonus   (PLANT_BONUS × growthStage)
 *
 * Dependencies: none
 *
 * Imported by:
 * - game.js: calls calculateTotalScore() when a question is completed
 *
 * @module scoring
 */

// Points awarded for each growth stage of a plant.
const PLANT_BONUS = 10;

export function calculateBaseScore(state) {
    const { base_score } = state;
    return 50 + base_score;
}

export function calculateAccuracyMultiplier(incorrectChars, totalChars) {
    if (totalChars === 0) return 1;

    const accuracy = (totalChars - incorrectChars) / totalChars;

    // clamp to prevent extreme punishment/boost
    return Math.max(0.5, accuracy); // 50% minimum
}

export function calculateTimeMultiplier(elapsedMs, timeLimit) {
    if (timeLimit === 0) return 1;

    const ratio = elapsedMs / timeLimit;

    // faster = higher reward
    const multiplier = 1 + (1 - ratio);

    // clamp so it doesn't explode
    return Math.max(0.7, Math.min(multiplier, 1.3));
}

export function calculateComboBonus(combo) {
    return Math.min(1 + combo * 0.05, 2.0);
}

/**
 * Calculates the bonus score for one plant based on its growth stage.
 *
 * Plants are stored as numbers from 0 to 2:
 * - 0 means no growth
 * - 2 means fully grown
 *
 * The stage is clamped so invalid values do not create negative or excessive
 * bonuses.
 *
 * @param {number} plant - Current growth stage of one plant.
 * @returns {number} Bonus points earned from that plant.
 */
export function addPlantBonus(plant) {
    const growthStage = Number(plant) || 0;
    const clampedStage = Math.max(0, Math.min(growthStage, 2));

    return clampedStage * PLANT_BONUS;
}

/**
 * Calculates the score for the current question.
 *
 * The final score combines:
 * - the question's base score
 * - the accuracy multiplier
 * - the time multiplier
 * - bonus points from the current plant states
 *
 * @param {object} state - Current game state.
 * @param {number} elapsedMs - Time spent on the current question in milliseconds.
 * @returns {number} Rounded non-negative score for the current question.
 */
export function calculateTotalScore(state, elapsedMs = 0) {
    const {
        baseScores = [],
        incorrectInputs = 0,
        answers = [],
        currentInput = "",
        currentQuestionIndex = 0,
        timeLimit = 0,
        combo = 0,
        growthLevel = 0
    } = state;

    const answer = answers[currentQuestionIndex] || "";
    const questionBaseScore = baseScores[currentQuestionIndex] || 0;
    const totalChars = Math.max(answer.length, currentInput.length);
    const accuracyMultiplier = calculateAccuracyMultiplier(
        incorrectInputs,
        totalChars
    );

    const timeMultiplier = calculateTimeMultiplier(
        elapsedMs,
        timeLimit
    );

    const comboMultiplier = calculateComboBonus(combo);

    // Sum the bonus from the plant in the current growth state.
    const plantBonus = addPlantBonus(growthLevel);

    const finalScore =
        questionBaseScore *
        accuracyMultiplier *
        timeMultiplier * comboMultiplier + plantBonus;

    return Math.round(Math.max(0, finalScore));
}
