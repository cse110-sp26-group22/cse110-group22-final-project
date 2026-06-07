import PlantDisplayGroup from '../../../../../src/final/js/ui/components/game/plants/PlantDisplayGroup.js';

describe('PlantDisplayGroup', () => {
    /** @type {PlantDisplayGroup} */
    let plantDisplayGroup;
    beforeEach(() => {
        document.body.innerHTML = `<div class="plant-display-group"></div>`;
        plantDisplayGroup = new PlantDisplayGroup(document.querySelector('.plant-display-group'));
    });

    test('initial elements are set correctly', () => {
        expect(plantDisplayGroup.element).toBe(document.querySelector('.plant-display-group'));
        expect(plantDisplayGroup.plantDisplays).toEqual([]);
    });

    test('addPlant adds a plant display to the group', () => {
        plantDisplayGroup.addPlant();
        expect(plantDisplayGroup.plantDisplays.length).toBe(1);
        expect(plantDisplayGroup.element.children.length).toBe(1);
    });

    test('addPlant appends plant-display div to the element', () => {
        plantDisplayGroup.addPlant();
        const childDiv = plantDisplayGroup.element.querySelector('.plant-display');
        expect(childDiv).toBeInstanceOf(HTMLDivElement);
        expect(childDiv.querySelector('.plant-image')).toBeInstanceOf(HTMLElement);
    });

    test('addPlant adds multiple plants correctly', () => {
        plantDisplayGroup.addPlant();
        plantDisplayGroup.addPlant();
        plantDisplayGroup.addPlant();
        expect(plantDisplayGroup.plantDisplays.length).toBe(3);
        expect(plantDisplayGroup.element.children.length).toBe(3);
    });

    test('removePlant removes the last plant display', () => {
        plantDisplayGroup.addPlant();
        plantDisplayGroup.addPlant();
        expect(plantDisplayGroup.plantDisplays.length).toBe(2);
        plantDisplayGroup.removePlant();
        expect(plantDisplayGroup.plantDisplays.length).toBe(1);
        expect(plantDisplayGroup.element.children.length).toBe(1);
    });

    test('removePlant does nothing when there are no plants', () => {
        expect(plantDisplayGroup.plantDisplays.length).toBe(0);
        plantDisplayGroup.removePlant();
        expect(plantDisplayGroup.plantDisplays.length).toBe(0);
        expect(plantDisplayGroup.element.children.length).toBe(0);
    });

    test('setGrowthLevels adds plants to match array length', () => {
        plantDisplayGroup.setGrowthLevels([0, 1, 2]);
        expect(plantDisplayGroup.plantDisplays.length).toBe(3);
        expect(plantDisplayGroup.element.children.length).toBe(3);
    });

    test('setGrowthLevels removes plants when array is shorter', () => {
        plantDisplayGroup.addPlant();
        plantDisplayGroup.addPlant();
        plantDisplayGroup.addPlant();
        plantDisplayGroup.setGrowthLevels([0]);
        expect(plantDisplayGroup.plantDisplays.length).toBe(1);
        expect(plantDisplayGroup.element.children.length).toBe(1);
    });

    test('setGrowthLevels sets growth levels on each plant', () => {
        plantDisplayGroup.setGrowthLevels([0, 1, 2]);
        expect(plantDisplayGroup.plantDisplays[0].growthLevel).toBe(0);
        expect(plantDisplayGroup.plantDisplays[1].growthLevel).toBe(1);
        expect(plantDisplayGroup.plantDisplays[2].growthLevel).toBe(2);
    });

    test('setGrowthLevels updates existing plants growth levels', () => {
        plantDisplayGroup.setGrowthLevels([0, 0]);
        plantDisplayGroup.setGrowthLevels([2, 1]);
        expect(plantDisplayGroup.plantDisplays[0].growthLevel).toBe(2);
        expect(plantDisplayGroup.plantDisplays[1].growthLevel).toBe(1);
    });

    test('setGrowthLevels handles empty array', () => {
        plantDisplayGroup.setGrowthLevels([]);
        expect(plantDisplayGroup.plantDisplays.length).toBe(0);
        expect(plantDisplayGroup.element.children.length).toBe(0);
    });

    test('setGrowthLevel with a number creates one plant', () => {
        plantDisplayGroup.setGrowthLevel(2);
        expect(plantDisplayGroup.plantDisplays.length).toBe(1);
        expect(plantDisplayGroup.plantDisplays[0].growthLevel).toBe(2);
    });

    test('setGrowthLevel with an array works like setGrowthLevels', () => {
        plantDisplayGroup.setGrowthLevel([0, 1, 2]);
        expect(plantDisplayGroup.plantDisplays.length).toBe(3);
        expect(plantDisplayGroup.plantDisplays[0].growthLevel).toBe(0);
        expect(plantDisplayGroup.plantDisplays[1].growthLevel).toBe(1);
        expect(plantDisplayGroup.plantDisplays[2].growthLevel).toBe(2);
    });

    test('setGrowthLevel updates existing single plant growth level', () => {
        plantDisplayGroup.setGrowthLevel(0);
        plantDisplayGroup.setGrowthLevel(2);
        expect(plantDisplayGroup.plantDisplays.length).toBe(1);
        expect(plantDisplayGroup.plantDisplays[0].growthLevel).toBe(2);
    });
});
