import { assertHTMLElement } from "../utils.js";
import { store } from "../store.js";

/**
 * The results screen shown at the end of a game round.
 *
 * Expects the following HTML structure:
 * <div class="results-screen">
 *   <h2 class="results-title">...</h2>
 *   <p class="results-language-label">Language: <span class="results-language"></span></p>
 *   <div class="results-stats">
 *     <div class="results-stat">
 *       <span class="results-stat-label">Score</span>
 *       <span class="results-stat-value results-score"></span>
 *     </div>
 *     ... (accuracy, cpm, questions)
 *   </div>
 *   <div class="results-actions">
 *     <button class="results-retry">Retry</button>
 *     <button class="results-main-menu">Main Menu</button>
 *   </div>
 * </div>
 */
export default class ResultsScreen {
    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;

        this.scoreEl = assertHTMLElement(element.querySelector('.results-score'));
        this.accuracyEl = assertHTMLElement(element.querySelector('.results-accuracy'));
        this.cpmEl = assertHTMLElement(element.querySelector('.results-cpm'));
        this.questionsEl = assertHTMLElement(element.querySelector('.results-questions'));
        this.languageEl = assertHTMLElement(element.querySelector('.results-language'));

        this.retryBtn = assertHTMLElement(element.querySelector('.results-retry'));
        this.mainMenuBtn = assertHTMLElement(element.querySelector('.results-main-menu'));
    }

    /**
     * Populates and shows the results screen.
     */
    show() {
        const stats = { //TODO: kind of hacky, we can improve this
            score: store.retrieve('score') || 0,
            cpm: store.retrieve('cpm') || 0,
            language: store.retrieve('language') || 'python'
        };

        const incorrectInputs = store.retrieve('incorrectInputs') || 0;
        const totalInputs = store.retrieve('totalInputs') || 0;
        stats.accuracy = totalInputs > 0 ? ((1 - (incorrectInputs / totalInputs)) * 100).toFixed(2) + '%' : '100%';

        const numCorrectQuestions = store.retrieve('numCorrectQuestions') || 0;
        const totalQuestions = store.retrieve('totalQuestions') || 0;
      
        this.scoreEl.textContent = `${stats.score}`;
        this.accuracyEl.textContent = `${stats.accuracy}`;
        this.cpmEl.textContent = `${stats.cpm}`;
        this.questionsEl.textContent = `${numCorrectQuestions} / ${totalQuestions}`;
        this.languageEl.textContent = stats.language;
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }

    /** @param {() => void} callback */
    onRetry(callback) {
        this.retryBtn.addEventListener('click', callback);
    }

    /** @param {() => void} callback */
    onMainMenu(callback) {
        this.mainMenuBtn.addEventListener('click', callback);
    }
}
