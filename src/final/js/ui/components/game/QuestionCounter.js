/**
 * The component responsible for displaying the question counter.
 * 
 * Expects the following minimal HTML structure:
 * <span class="question-counter"></span>
 */
export default class QuestionCounter {
    #count = 0;
    #maxCount = 30;
    /**
     * Binds this QuestionCounter to the given element. 
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * Renders the question counter display based on the current count and max count.
     */
    render() {
        this.element.textContent = `${this.#count} / ${this.#maxCount}`;
    }

    /**
     * Sets the current question count and updates the display.
     * @param {number} count - The current question count.
     */
    set count(count) {
        this.#count = count;
        this.render();
    }

    /**
     * Gets the current question count.
     * @returns {number} The current question count.
     */
    get count() {
        return this.#count;
    }

    /**
     * Sets the maximum question count and updates the display.
     * @param {number} maxCount - The maximum question count.
     */
    set maxCount(maxCount) {
        this.#maxCount = maxCount;
        this.render();
    }

    /**
     * Gets the maximum question count.
     * @returns {number} The maximum question count.
     */
    get maxCount() {
        return this.#maxCount;
    }
}
