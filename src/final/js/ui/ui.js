import GameUI from './components/GameUI.js';
import MainMenu from './components/MainMenu.js';
import ResultsScreen from './components/ResultsScreen.js';
import RulesBox from './components/RulesBox.js';
import { assertHTMLElement } from './utils.js';
import * as glue from './glue.js';

/**
 * The main entry point for the UI.
 */

/** @type {GameUI} */
let gameUI;
/** @type {MainMenu} */
let mainMenu;
/** @type {ResultsScreen} */
let resultsScreen;
/** @type {RulesBox} */
let rulesBox;

/** @type {string} Last language the user started a game with, used for Retry. */
let lastLanguage = 'python';

/** @type {number} The current level the user is playing. */
let currentLevel = 1;

/**
 * Initializes the UI and shows the main menu.
 */
function main() {
    glue.initializeBackend();

    const menuDisplayElement = assertHTMLElement(document.querySelector('#main-menu'));
    mainMenu = new MainMenu(menuDisplayElement);

    const gameDisplayElement = assertHTMLElement(document.querySelector('#game-ui'));
    gameUI = new GameUI(gameDisplayElement);
    gameUI.hide();

    glue.gameUIReady();

    const resultsScreenElement = assertHTMLElement(document.querySelector('.results-screen'));
    resultsScreen = new ResultsScreen(resultsScreenElement);
    resultsScreen.hide();

    const rulesBoxElement = assertHTMLElement(document.querySelector('.rules-box'));
    rulesBox = new RulesBox(rulesBoxElement);
    rulesBox.hide();

    mainMenu.onStart((language) => {
        lastLanguage = language;
        mainMenu.hide();
        rulesBox.show()
        gameUI.show();
        gameUI.startCountdown();
        currentLevel = 1;
        glue.startLevel(currentLevel, language);
        gameUI.notificationDisplay.notifyEvent(`Level ${currentLevel}`, '#574728');
    });

    resultsScreen.onRetry(() => {
        resultsScreen.hide();
        rulesBox.show()
        gameUI.show();
        gameUI.notificationDisplay.notifyEvent(`Retrying Level ${currentLevel}`, '#574728');
        glue.startLevel(currentLevel, lastLanguage);
    });

    gameUI.onPause(glue.pauseGame);
    gameUI.onResume(glue.resumeGame);
    gameUI.codeInputField.onInputChange(glue.handleInputChange);

    gameUI.onRetry(() => {
        glue.startLevel(currentLevel, lastLanguage);
        gameUI.notificationDisplay.notifyEvent(`Retrying Level ${currentLevel} . . .`, '#574728');
    });

    gameUI.onMainMenu(() => {
        gameUI.hide();
        mainMenu.show();
        glue.goToMainMenu();
    });

    resultsScreen.onMainMenu(() => {
        resultsScreen.hide();
        rulesBox.hide();
        mainMenu.show();
        glue.goToMainMenu();
    });

    resultsScreen.onNext(() => {
        currentLevel++;
        if(currentLevel > 3) {
            currentLevel = 1;
            resultsScreen.hide();
            rulesBox.hide();
            mainMenu.show();
            glue.goToMainMenu();
            return;
        }
        resultsScreen.hide();
        gameUI.show();
        glue.startLevel(currentLevel, lastLanguage);
        gameUI.notificationDisplay.notifyEvent(`Level ${currentLevel}`, '#574728');
    });
}

/**
 * Call this when the game round ends to transition to the results screen.
 * @param {{ score: number, accuracy: string, cpm: number, questionsAnswered: number, totalQuestions: number }} stats
 */
export function showResults(stats) {
    gameUI.hide();
    resultsScreen.show({ ...stats, language: lastLanguage });
}

document.addEventListener('DOMContentLoaded', main);

export { gameUI, mainMenu, resultsScreen, rulesBox };
