import GameUI from './components/GameUI.js';
import { assertHTMLElement } from './utils.js';

/**
 * The main entry point for the UI.
 */

/** @type {GameUI} */
let gameUI;

/**
 * Initializes the UI.
 */
function main() {
    const gameDisplayElement = assertHTMLElement(document.querySelector('#game-ui'));
    const codeInputFieldElement = assertHTMLElement(document.querySelector('#game-code-input-field'));
    const statsDisplayElement = assertHTMLElement(document.querySelector('#game-stats-display'));
    const promptDisplayElement = assertHTMLElement(document.querySelector('#game-prompt-display'));

    gameUI = new GameUI(gameDisplayElement, codeInputFieldElement, statsDisplayElement, promptDisplayElement);
    
    const [question, answer] = backendEmulator();
    gameUI.sendQuestion(question, answer);
}

function backendEmulator(){
    //return a tuple of (question, answer)
    return ["Print \"Hello, World!\" in Python", "print(\"Hello, World!\")"];
}


document.addEventListener('DOMContentLoaded', main);