import Timer from '../../../../src/final/js/ui/components/game/Timer.js';

describe('Timer', () => {
    /** @type {Timer} */
    let timer;
    beforeEach(() => {
        document.body.innerHTML = `<span class="timer"></span>`;
        timer = new Timer(document.querySelector('.timer'));
    });

    test('initial elements are set correctly', () => {
        expect(timer.element).toBe(document.querySelector('.timer'));
    });

    test('initializes with 0 time remaining', () => {
        expect(timer.remainingTime).toBe(0);
        expect(timer.element.textContent).toBe('0:00');
    });

    test('sets remaining time correctly', () => {
        timer.remainingTime = 90;
        expect(timer.remainingTime).toBe(90);
        expect(timer.element.textContent).toBe('1:30');
    });

    test('updates remaining time correctly', () => {
        timer.remainingTime = 45;
        expect(timer.remainingTime).toBe(45);
        expect(timer.element.textContent).toBe('0:45');
        timer.remainingTime = 120;
        expect(timer.remainingTime).toBe(120);
        expect(timer.element.textContent).toBe('2:00');
    });

    test('floating point values are handled correctly', () => {
        timer.remainingTime = 90.5;
        expect(timer.remainingTime).toBe(90.5);
        expect(timer.element.textContent).toBe('1:31');
    });
});
