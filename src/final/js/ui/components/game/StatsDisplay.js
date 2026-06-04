import { store } from '../../store.js';

/**
 * The component responsible for displaying the user's current score and accuracy.
 * 
 * Expects the following minimal HTML structure:
 * <div class="stats-display">
 *   <p>Score: <span class="stats-display-score"></span></p>
 *   <p>Accuracy: <span class="stats-display-accuracy"></span></p>
 *   <p>CPM: <span class="stats-display-cpm"></span></p>
 * </div>
 */
export default class StatsDisplay {
    
    /**
     * Binds this StatsDisplay to the given element.
     * @param {HTMLElement} element 
     */
    constructor(element){
        this.element = element;
        this.scoreElement = this.element.querySelector('.stats-display-score');
        this.accuracyElement = this.element.querySelector('.stats-display-accuracy');
        this.cpmElement = this.element.querySelector('.stats-display-cpm');
        store.subscribe('totalInputs', () => this.rerender());
        store.subscribe('incorrectInputs', () => this.rerender());
        store.subscribe('score', () => this.rerender());
    }

    /**
     * Rerenders the stats display. Should be called whenever the underlying stats data changes.
     */
    rerender() {
        const score = store.retrieve('score') || 0;
        const totalInputs = store.retrieve('totalInputs') || 0;
        const incorrectInputs = store.retrieve('incorrectInputs') || 0;

        const accuracy = totalInputs > 0 ? (1 - (incorrectInputs / totalInputs)) * 100 : 100;
        this.score = score;
        this.accuracy = accuracy;
        this.cpm = Math.floor(0); // not implemented yet, so just display 0 for now
    }

    /**
     * Sets the displayed score.
     * @param {number} score 
     */
    set score(score) {
        this.scoreElement.textContent = score.toString();
    }

    /**
     * Sets the displayed accuracy.
     * @param {number} accuracy 
     */
    set accuracy(accuracy) {
        this.accuracyElement.textContent = accuracy.toFixed(2) + '%';
    }

    /**
     * Sets the displayed CPM.
     * @param {number} cpm 
     */
    set cpm(cpm) {
        this.cpmElement.textContent = cpm.toFixed(2);
    }
}
