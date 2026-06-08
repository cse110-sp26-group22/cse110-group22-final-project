import PlantDisplay from '../../../../../src/final/js/ui/components/game/plants/PlantDisplay.js';

describe('PlantDisplay', () => {
    /** @type {PlantDisplay} */
    let plantDisplay;
    beforeEach(() => {
        document.body.innerHTML = `<div class="plant-display"></div>`;
        plantDisplay = new PlantDisplay(document.querySelector('.plant-display'));
    });

    test('initial elements are set correctly', () => {
        expect(plantDisplay.element).toBe(document.querySelector('.plant-display'));
        expect(plantDisplay.growthLevel).toBe(0);
        expect(plantDisplay.plantElement).toBeInstanceOf(HTMLElement);
    });

    test('build creates element with correct src and class', () => {
        const img = plantDisplay.element.querySelector('.plant-image');
        expect(img).toBeInstanceOf(HTMLElement);
        expect(img.classList.contains('plant-image')).toBe(true);
    });

    test('setGrowthLevel updates growth level', () => {
        plantDisplay.setGrowthLevel(1);
        expect(plantDisplay.growthLevel).toBe(1);
    });

    test('setGrowthLevel updates image src', () => {
        plantDisplay.setGrowthLevel(2);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage3')).toBe(true);
    });

    test('setGrowthLevel clamps to minimum of 0', () => {
        plantDisplay.setGrowthLevel(-1);
        expect(plantDisplay.growthLevel).toBe(0);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage1')).toBe(true);
    });

    test('setGrowthLevel clamps to maximum of 2', () => {
        plantDisplay.setGrowthLevel(5);
        expect(plantDisplay.growthLevel).toBe(2);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage3')).toBe(true);
    });

    test('setGrowthLevel handles growth level 0 correctly', () => {
        plantDisplay.setGrowthLevel(0);
        expect(plantDisplay.growthLevel).toBe(0);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage1')).toBe(true);
    });

    test('setGrowthLevel handles each valid growth level', () => {
        plantDisplay.setGrowthLevel(0);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage1')).toBe(true);
        plantDisplay.setGrowthLevel(1);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage2')).toBe(true);
        plantDisplay.setGrowthLevel(2);
        expect(plantDisplay.plantElement.classList.contains('plant-image-plant1-stage3')).toBe(true);
    });

    test('plant image element is appended to the container element', () => {
        const imgElements = plantDisplay.element.querySelectorAll('div.plant-image');
        expect(imgElements.length).toBe(1);
        expect(imgElements[0]).toBe(plantDisplay.plantElement);
    });
});
