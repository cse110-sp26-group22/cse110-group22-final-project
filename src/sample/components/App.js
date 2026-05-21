import { assertHTMLElement } from "../utils.js";
import EggCounter from "./EggCounter.js";
import Egg from "./Egg.js";

/**
 * The main component for the app.
 * 
 * Expects the following minimal HTML structure:
 * <div class="app">
 *   <div class="egg-group"></div>
 *   <EggCounter class="egg-counter"/>
 * </div>
 */
export default class App {
    /** @type {Array<Egg>} */
    eggs = [];

    /**
     * Binds this App to the given element.
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;
        this.eggGroupElement = assertHTMLElement(this.element.querySelector('.egg-group'));
        
        this.eggCounter = new EggCounter(assertHTMLElement(this.element.querySelector('.egg-counter')));
        this.eggCounter.onUpdateCount((newCount) => this.handleUpdateCount(newCount));
    }

    /**
     * Updates the egg count.
     * @param {number} newCount 
     */
    handleUpdateCount(newCount) {
        if (newCount < 0) newCount = 0;
        while (this.eggs.length < newCount) this.addEgg();
        while (this.eggs.length > newCount) this.removeEgg();
        this.eggCounter.count = newCount;
    }

    /**
     * Adds a new egg to the display.
     */
    addEgg() {
        const eggElement = document.createElement('span');
        eggElement.textContent = '🥚';
        const newEgg = new Egg(eggElement);
        this.eggs.push(newEgg);
        this.eggGroupElement.appendChild(newEgg.element);
    }

    /**
     * Removes the most recently added egg from the display.
     */
    removeEgg() {
        const removedEgg = this.eggs.pop();
        if(!removedEgg) return;
        this.eggGroupElement.removeChild(removedEgg.element);
    }

}