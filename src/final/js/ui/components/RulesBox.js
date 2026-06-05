
/**
 * The component responsible for displaying the rules of the game to the user.
 * 
 * Expects the following minimal HTML structure:
 * <div class="rules-box">
 *   <h3></h3>
 *   <p></p>
 * </div>
 */
export default class RulesBox {
    /**
     * Binds this RulesBox to the given element.
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element;
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
