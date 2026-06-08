import CodeInputField from '../../../../../src/final/js/ui/components/game/input/CodeInputField.js';

describe('CodeInputField', () => {
    /** @type {CodeInputField} */
    let codeInputField;
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="game-code-input-field" class="code-input-field">
                <div class="ghost-text">
                    <span class="ghost-text-invisible"></span>
                    <span class="ghost-text-visible"></span>
                </div>
                <div class="code-input-highlight" aria-hidden="true">
                    <span class="highlight-correct"></span>
                    <span class="highlight-error"></span>
                </div>
                <input class="code-input" />
            </div>
        `;
        codeInputField = new CodeInputField(document.querySelector('#game-code-input-field'));
    });

    test('initializes with correct elements', () => {
        expect(codeInputField.element).toBe(document.querySelector('#game-code-input-field'));
        expect(codeInputField.ghostTextInvisible).toBe(document.querySelector('.ghost-text-invisible'));
        expect(codeInputField.ghostTextVisible).toBe(document.querySelector('.ghost-text-visible'));
        expect(codeInputField.highlightCorrect).toBe(document.querySelector('.highlight-correct'));
        expect(codeInputField.highlightError).toBe(document.querySelector('.highlight-error'));
        expect(codeInputField.codeInput).toBe(document.querySelector('.code-input'));
    });

    test('initial ghost text is set correctly', () => {
        expect(codeInputField.ghostTextString).toBe('print("Hello, World!")');
        expect(codeInputField.ghostTextVisible.textContent).toBe('print("Hello, World!")');
        expect(codeInputField.ghostTextInvisible.textContent).toBe('');
    });

    test('setGhostText updates the ghost text', () => {
        codeInputField.setGhostText('print("testing ghost text")');
        expect(codeInputField.ghostTextString).toBe('print("testing ghost text")');
        expect(codeInputField.ghostTextVisible.textContent).toBe('print("testing ghost text")');
        expect(codeInputField.ghostTextInvisible.textContent).toBe('');
        expect(codeInputField.codeInput.value).toBe('');
    });

    test('clearAnswer clears the input and resets ghost text', () => {
        codeInputField.codeInput.value = 'print("Hello")';
        codeInputField.setGhostText('print("Hello, World!")');
        codeInputField.clearAnswer();
        expect(codeInputField.codeInput.value).toBe('');
        expect(codeInputField.ghostTextVisible.textContent).toBe('print("Hello, World!")');
        expect(codeInputField.ghostTextInvisible.textContent).toBe('');
    });

    test('handleInput updates ghost text based on input value', () => {
        codeInputField.setGhostText('print("Hello, World!")');
        codeInputField.codeInput.value = 'print("Hello';
        codeInputField.handleInput();
        expect(codeInputField.ghostTextInvisible.textContent).toBe('print("Hello');
        expect(codeInputField.ghostTextVisible.textContent).toBe(', World!")');
    });

    test('onEnter calls callback with input value when Enter is pressed', () => {
        const mockCallback = jest.fn();
        codeInputField.onEnter(mockCallback);
        codeInputField.codeInput.value = 'print("Hello")';
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        codeInputField.codeInput.dispatchEvent(enterEvent);
        expect(mockCallback).toHaveBeenCalledWith('print("Hello")');
    });
    
    test('onEnter does not call callback when a key other than Enter is pressed', () => {
        const mockCallback = jest.fn();
        codeInputField.onEnter(mockCallback);
        codeInputField.codeInput.value = 'print("Hello")';
        const keyPressEvent = new KeyboardEvent('keydown', { key: 'a' });
        codeInputField.codeInput.dispatchEvent(keyPressEvent);
        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('onInputChange calls callback with input value when input changes', () => {
        const mockCallback = jest.fn();
        codeInputField.onInputChange(mockCallback);
        codeInputField.codeInput.value = 'print("Hello")';
        const inputEvent = new Event('input');
        codeInputField.codeInput.dispatchEvent(inputEvent);
        expect(mockCallback).toHaveBeenCalledWith('print("Hello")');
    });

    test('onInputChange detects changes to the input value', () => {
        const mockCallback = jest.fn();
        codeInputField.onInputChange(mockCallback);
        codeInputField.codeInput.value = 'console.log("Hello")';
        const keyPressEvent = new KeyboardEvent('keypress', { key: ';' });
        codeInputField.codeInput.dispatchEvent(keyPressEvent);
        setTimeout(() => {
            expect(mockCallback).toHaveBeenCalledWith('console.log("Hello");');
        }, 0);
    });

    test('onInputChange detects backspace in the input value', () => {
        const mockCallback = jest.fn();
        codeInputField.onInputChange(mockCallback);
        codeInputField.codeInput.value = 'print("Hello")';
        const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        codeInputField.codeInput.dispatchEvent(backspaceEvent);
        setTimeout(() => {
            expect(mockCallback).toHaveBeenCalledWith('print("Hello"');
        }, 0);
    });

    test('onKeyPress calls callback with key when a key is pressed', () => {
        const mockCallback = jest.fn();
        codeInputField.onKeyPress(mockCallback);
        const keyPressEvent = new KeyboardEvent('keypress', { key: 'a' });
        codeInputField.codeInput.dispatchEvent(keyPressEvent);
        setTimeout(() => {
            expect(mockCallback).toHaveBeenCalledWith('a');
        }, 0);
    });

    test('onKeyPress detects special keys', () => {
        const mockCallback = jest.fn();
        codeInputField.onKeyPress(mockCallback);
        const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        codeInputField.codeInput.dispatchEvent(enterEvent);
        setTimeout(() => {
            expect(mockCallback).toHaveBeenCalledWith('Enter');
        }, 0);
    });

    test('renderGhostText does not throw if ghostTextString is not set', () => {
        codeInputField.ghostTextString = null;
        expect(() => codeInputField.renderGhostText()).not.toThrow();
    });

    test('typing updates ghost text correctly', () => {
        codeInputField.setGhostText('print("Hello, World!")');
        codeInputField.codeInput.value = 'print("H';
        codeInputField.handleInput();
        expect(codeInputField.ghostTextInvisible.textContent).toBe('print("H');
        expect(codeInputField.ghostTextVisible.textContent).toBe('ello, World!")');
        const keyPressEvent = new KeyboardEvent('keypress', { key: 'e' });
        codeInputField.codeInput.dispatchEvent(keyPressEvent);
        setTimeout(() => {
            expect(codeInputField.codeInput.value).toBe('print("He');
            expect(codeInputField.ghostTextInvisible.textContent).toBe('print("He');
            expect(codeInputField.ghostTextVisible.textContent).toBe('llo, World!")');
        }, 0);
    });

    test('ghost text updates even with error in input (should only check length)', () => {
        codeInputField.setGhostText('print("Hello, World!")');
        codeInputField.codeInput.value = ' print("H';
        codeInputField.handleInput();
        expect(codeInputField.ghostTextInvisible.textContent).toBe(' print("H');
        expect(codeInputField.ghostTextVisible.textContent).toBe('llo, World!")');
    });

    describe('errorHighlight', () => {
        test('clears highlighting when input is empty', () => {
            codeInputField.setGhostText('console.debug("test")');
            codeInputField.codeInput.value = '';
            codeInputField.handleInput();
            expect(codeInputField.highlightCorrect.textContent).toBe('');
            expect(codeInputField.highlightError.textContent).toBe('');
        });

        test('shows no error when input matches ghost text prefix', () => {
            codeInputField.setGhostText('console.debug("test")');
            codeInputField.codeInput.value = 'console.';
            codeInputField.handleInput();
            expect(codeInputField.highlightCorrect.textContent).toBe('console.');
            expect(codeInputField.highlightError.textContent).toBe('');
        });

        test('highlights correct answer characters where input diverges', () => {
            codeInputField.setGhostText('console.debug("test")');
            codeInputField.codeInput.value = 'console.log';
            codeInputField.handleInput();
            // 'console.' matches, then at index 8 user typed 'log' but correct has 'deb'
            expect(codeInputField.highlightCorrect.textContent).toBe('console.');
            expect(codeInputField.highlightError.textContent).toBe('deb');
        });

        test('shows no error when input fully matches ghost text', () => {
            codeInputField.setGhostText('print("Hello, World!")');
            codeInputField.codeInput.value = 'print("Hello, World!")';
            codeInputField.handleInput();
            expect(codeInputField.highlightCorrect.textContent).toBe('print("Hello, World!")');
            expect(codeInputField.highlightError.textContent).toBe('');
        });

        test('handles mismatch at the very first character', () => {
            codeInputField.setGhostText('print("Hello, World!")');
            codeInputField.codeInput.value = 'x';
            codeInputField.handleInput();
            expect(codeInputField.highlightCorrect.textContent).toBe('');
            expect(codeInputField.highlightError.textContent).toBe('p');
        });

        test('shows correct answer chars when input is longer than ghost text', () => {
            codeInputField.setGhostText('hi');
            codeInputField.codeInput.value = 'hixyz';
            codeInputField.handleInput();
            expect(codeInputField.highlightCorrect.textContent).toBe('hi');
            expect(codeInputField.highlightError.textContent).toBe('');
        });

        test('does not throw when ghostTextString is null', () => {
            codeInputField.ghostTextString = null;
            expect(() => codeInputField.errorHighlight()).not.toThrow();
        });
    });
});
