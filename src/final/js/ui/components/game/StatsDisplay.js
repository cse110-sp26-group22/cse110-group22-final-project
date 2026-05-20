import { assertHTMLElement } from "../../utils.js";

/**
 * The component responsible for displaying the user's current score and accuracy.
 * 
 * Expects the following minimal HTML structure:
 * <div class="stats-display">
 *   <p>Score: <span class="stats-display-score"></span></p>
 *   <p>Accuracy: <span class="stats-display-accuracy"></span></p>
 *   <p>WPM: <span class="stats-display-wpm"></span></p>
 * </div>
 */
export default class StatsDisplay {
    
    /**
     * Binds this StatsDisplay to the given element.
     * @param {HTMLElement} element 
     */
    constructor(element){
        this.element = element;
        this.scoreElement = assertHTMLElement(this.element.querySelector('.stats-display-score'));
        this.accuracyElement = assertHTMLElement(this.element.querySelector('.stats-display-accuracy'));
        this.wpmElement = assertHTMLElement(this.element.querySelector('.stats-display-wpm'));
        this.updateStats(0, -1, -1);
    }

    /**
     * Updates the statistics displayed.
     * @param {number} score 
     * @param {number} accuracy 
     * @param {number} wpm 
     */
    updateStats(score, accuracy, wpm) {
        this.scoreElement.textContent = String(score);
        this.accuracyElement.textContent = "N/A"; //String(accuracy) + '%';
        this.wpmElement.textContent = "N/A"; //String(wpm);
    }
}
