// deterministic pure functions to calculate score of a question based on time taken 
// and number of attempts, and to calculate total score of the game based on individual question scores
// also handles streaks and multipliers down the line

//none of the functions in this file should be able to directly mutate the game state
//instead they should return values that can be used to update the game state in game.js


/**
 * Points awarded for each growth stage of a plant.
 * Example: a plant at stage 2 adds 20 bonus points.
 */
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
        growthLevel = []
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

    // Sum the bonus from each plant in the current growth state.
    const plantBonus = growthLevel.reduce((total, plant) => {
        return total + addPlantBonus(plant);
    }, 0);

    const finalScore =
        questionBaseScore *
        accuracyMultiplier *
        timeMultiplier * comboMultiplier + plantBonus;
    //streakMultiplier;

    return Math.round(Math.max(0, finalScore));
}
