import {
    registerCallbacks, startLevel, pauseGame, resumeGame, 
    goToMainMenu, goToLevelSelect, onInput
} from "../systems/game.js"

import { store } from "./store.js";
import { mainMenu, gameUI, resultsScreen } from "./ui.js";

/**
 * @param {string} screenName 
 * @param {*} data 
 */
function handleLoadScreen(screenName, data) {
    console.debug(`Loading screen: ${screenName} with data:`, data);
    if (screenName === 'game') {
        mainMenu.hide();
        resultsScreen.hide();
        gameUI.show();
        gameUI.sendQuestion(data.questions[data.currentQuestionIndex], data.answers[data.currentQuestionIndex]);
        store.update('questionEndTime', data.questionEndTime);
        store.update('language', data.language);
        store.update('totalQuestions', data.questions.length);
        console.debug(`Loaded game screen with question: ${data.questions[data.currentQuestionIndex]} and answer: ${data.answers[data.currentQuestionIndex]}`);
    }
    if (screenName === 'pause') {
        gameUI.show();
        gameUI.pauseMenu.show();
        resultsScreen.hide();
        mainMenu.hide();
    }
    if (screenName === 'endscreen' || screenName === 'results') {
        gameUI.hide();
        store.update('numCorrectQuestions', data.numCorrectQuestions);
        resultsScreen.show();
        mainMenu.hide();
    }
    if (screenName === 'mainmenu' || screenName === 'levelselect') {
        gameUI.hide();
        resultsScreen.hide();
        mainMenu.show();
    }
}

/**
 * @param {string} response 
 * @param {*} data 
 */
function handleUpdateScreen(response, data) {
    console.debug(`Updating screen with response: ${response} and data:`, data);
    store.update('combo', data.combo);
    store.update('score', data.score);
    store.update('incorrectInputs', data.incorrectInputs);
    store.update('totalInputs', data.totalInputs);
    if (response === 'next-question') {
        gameUI.sendQuestion(data.questions[data.currentQuestionIndex], data.answers[data.currentQuestionIndex]);
    }
}

export function initializeBackend() {
    registerCallbacks(handleLoadScreen, handleUpdateScreen);
}

/**
 * Relays user input from the UI to the backend.
 * @param {string} input - The user's input, e.g. a key press.
 */
export function handleInputChange(input){
    onInput(input); // backend naming is different from our convention
}

export { startLevel, pauseGame, resumeGame, goToLevelSelect, goToMainMenu };