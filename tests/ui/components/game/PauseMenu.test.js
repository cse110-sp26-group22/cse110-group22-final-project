import PauseMenu from '../../../../src/final/js/ui/components/game/PauseMenu.js';
import { store } from '../../../../src/final/js/ui/store.js';

describe('PauseMenu', () => {
    /** @type {PauseMenu} */
    let pauseMenu;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="pause-menu">
                <h3 class="pause-menu-title">Paused</h3>
                <button type="button" class="pause-menu-resume">Resume</button>
                <button type="button" class="pause-menu-retry">Retry</button>
                <button type="button" class="pause-menu-main-menu">Main Menu</button>
                <h4 class="pause-menu-current-language"></h4>
            </div>
        `;
        pauseMenu = new PauseMenu(document.querySelector('.pause-menu'));
    });

    test('initializes with correct elements', () => {
        expect(pauseMenu.element).toBe(document.querySelector('.pause-menu'));
        expect(pauseMenu.resumeBtn).toBe(document.querySelector('.pause-menu-resume'));
        expect(pauseMenu.retryBtn).toBe(document.querySelector('.pause-menu-retry'));
        expect(pauseMenu.mainMenuBtn).toBe(document.querySelector('.pause-menu-main-menu'));
    });

    test('initializes with hidden class', () => {
        expect(pauseMenu.element.classList.contains('hidden')).toBe(true);
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('show removes hidden class', () => {
        pauseMenu.show();
        expect(pauseMenu.element.classList.contains('hidden')).toBe(false);
        expect(pauseMenu.isVisible).toBe(true);
    });

    test('hide adds hidden class', () => {
        pauseMenu.show();
        pauseMenu.hide();
        expect(pauseMenu.element.classList.contains('hidden')).toBe(true);
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('isVisible returns false when hidden', () => {
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('isVisible returns true when shown', () => {
        pauseMenu.show();
        expect(pauseMenu.isVisible).toBe(true);
    });

    test('onResume calls callback and hides menu when resume button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.show();
        pauseMenu.onResume(mockCallback);
        pauseMenu.resumeBtn.click();
        expect(mockCallback).toHaveBeenCalled();
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('onRetry calls callback and hides menu when retry button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.show();
        pauseMenu.onRetry(mockCallback);
        pauseMenu.retryBtn.click();
        expect(mockCallback).toHaveBeenCalled();
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('onMainMenu calls callback and hides menu when main menu button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.show();
        pauseMenu.onMainMenu(mockCallback);
        pauseMenu.mainMenuBtn.click();
        expect(mockCallback).toHaveBeenCalled();
        expect(pauseMenu.isVisible).toBe(false);
    });

    test('onResume does not call callback before button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.onResume(mockCallback);
        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('onRetry does not call callback before button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.onRetry(mockCallback);
        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('onMainMenu does not call callback before button is clicked', () => {
        const mockCallback = jest.fn();
        pauseMenu.onMainMenu(mockCallback);
        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('language setter displays capitalized language', () => {
        pauseMenu.language = 'javascript';
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Javascript');
    });

    test('language setter handles single character language', () => {
        pauseMenu.language = 'c';
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 C');
    });

    test('language setter updates correctly when called multiple times', () => {
        pauseMenu.language = 'python';
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Python');
        pauseMenu.language = 'java';
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Java');
    });

    test('store language update triggers language display', () => {
        store.update('language', 'python');
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Python');
    });

    test('store language update updates language display on subsequent changes', () => {
        store.update('language', 'javascript');
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Javascript');
        store.update('language', 'python');
        expect(pauseMenu.currentLangEl.textContent).toBe('Language:\u00A0 Python');
    });
});
