/**
 * The component responsible for displaying the user's current plant level.
 * 
 * Expects the following minimal HTML structure:
 * <div class="plant-display"></div>
 */
export default class PlantDisplay {
    /** @const {(string)[]}*/
    static PLANT_IMAGES = ['plant1-stage1.png', 'plant1-stage2.png', 'plant1-stage3.png'];
    /**
     * Binds this PlantDisplay to the given element.
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element;
        this.growthLevel = 0;
        this.plantImageElement = document.createElement('img');

        this.build();
    }
    build() {
        this.plantImageElement.src = `../assets/images/plant/${PlantDisplay.PLANT_IMAGES[this.growthLevel]}`;
        this.plantImageElement.classList.add('plant-image');
        this.element.appendChild(this.plantImageElement);
    }
}
