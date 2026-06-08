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
     * Binds this ResultsScreen to the given element.
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
        this.nextBtn = assertHTMLElement(element.querySelector('.results-next'));
    }

    /**
     * Populates and shows the results screen.
     * @param {{ score: number, accuracy: string, cpm: number, language: string }} stats
     */
    show(stats) {
        this.scoreEl.textContent = `${stats.score}`;
        this.accuracyEl.textContent = `${stats.accuracy}`;
        this.cpmEl.textContent = `${stats.cpm}`;
        this.questionsEl.textContent = `${stats.questionsAnswered} / ${stats.totalQuestions}`;
        this.languageEl.textContent = stats.language;
        if(store.retrieve('level') >= 3) {
            this.nextBtn.classList.add('hidden');
        } else {
            this.nextBtn.classList.remove('hidden');
        }
        this.element.classList.remove('hidden');
    }

    /**
     * Hides the results screen.
     */
    hide() {
        this.element.classList.add('hidden');
    }

    /**
     * Registers a callback to be called when the user clicks the Retry button.
     * @param {() => void} callback
     */
    onRetry(callback) {
        this.retryBtn.addEventListener('click', callback);
    }

    /**
     * Registers a callback to be called when the user clicks the Main Menu button.
     * @param {() => void} callback
     */
    onMainMenu(callback) {
        this.mainMenuBtn.addEventListener('click', callback);
    }

    /** 
     * Registers a callback to be called when the user clicks the Next Level button.
     * @param {() => void} callback
     */
    onNext(callback) {
        this.nextBtn.addEventListener('click', callback);
    }
}
