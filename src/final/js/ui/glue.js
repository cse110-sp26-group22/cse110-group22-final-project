import {
    registerCallbacks, startLevel as backendStartLevel, pauseGame, resumeGame,
    goToMainMenu, onInput, setLanguage
} from "../systems/game.js"

import { store } from "./store.js";
import { mainMenu, gameUI, resultsScreen } from "./ui.js";

let latestGameData;

/**
 * @param {*} data
 */
function getCurrentQuestion(data) {
    return {
        question: data.questions[data.currentQuestionIndex],
        answer: data.answers[data.currentQuestionIndex],
    };
}

/**
 * @param {*} data: the full gamestate
 */
function getResultsStats(data) {
    const totalQuestions = data.totalQuestions ?? data.questions?.length ?? 0;
    const questionsAnswered = data.numCorrectQuestions ?? 0;
    const totalTimeUsedMs = data.timeUsed?.reduce((total, time) => total + time, 0) ?? 0;
    const elapsedMinutes = totalTimeUsedMs / 60000;
    const totalAnswerCharacters = data.totalAnswerCharacters ?? 0;
    const accuracy = data.levelAccuracyPercent

    return {
        score: data.score ?? 0,
        questionsAnswered,
        totalQuestions,
        accuracy,
        cpm: elapsedMinutes > 0 ? Math.round(totalAnswerCharacters / elapsedMinutes) : 0,
        language: data.language ?? 'python'
    };
}

/**
 * @param {*} data: the full gamestate
 */
function getLiveStats(data) {
    const completedAnswerCharacters = data.totalAnswerCharacters ?? 0;
    const currentQuestionCharacters = Math.min(
        data.maxPrefixLength ?? 0,
        data.answers?.[data.currentQuestionIndex]?.length ?? 0
    );
    const correctCharacters = completedAnswerCharacters + currentQuestionCharacters;
    const totalTimeUsedMs = data.timeUsed?.reduce((total, time) => total + time, 0) ?? 0;
    const currentQuestionElapsedMs = data.isActive && !data.isPaused
        ? Math.max(0, (data.timeLimit ?? 0) - Math.max(0, (data.questionEndTime ?? Date.now()) - Date.now()))
        : 0;
    const elapsedMinutes = (totalTimeUsedMs + currentQuestionElapsedMs) / 60000;
    const totalInputs = data.totalInputs ?? 0;
    const totalIncorrectInputs = data.totalIncorrectInputs ?? 0;
    const currentAccuracy = totalInputs > 0
        ? Math.max(0, Math.min(1, 1 - totalIncorrectInputs / totalInputs))
        : 1;

    return {
        score: data.score ?? 0,
        accuracy: currentAccuracy.toFixed(2), 
        cpm: elapsedMinutes > 0 ? Math.round(correctCharacters / elapsedMinutes) : 0,
    };
}

/**
 * @param {*} data: the full gamestate
 */
function updateGameStats(data) {
    latestGameData = data;
    gameUI.statsDisplay.update(getLiveStats(data));
}

/**
 * @param {string} screenName: the tag of the screen to load, sent from the backend to indicate which screen the frontend should display
 * @param {*} data: the full game state sent from the backend, used to update the frontend's display and stats when loading a new screen
 */
function handleLoadScreen(screenName, data) {
    console.debug(`Loading screen: ${screenName} with data:`, data);
    if (screenName === 'game') {
        mainMenu.hide();
        resultsScreen.hide();
        gameUI.show();
        gameUI.pauseMenu.hide();
        const { question, answer } = getCurrentQuestion(data);
        gameUI.sendQuestion(question, answer);
        gameUI.plantDisplayGroup.setGrowthLevels(data.growthLevel ?? 1); 
        store.update('questionEndTime', data.questionEndTime);
        console.debug(`Loaded game screen with question: ${question} and answer: ${answer}`);
    }
    if (screenName === 'pause') {
        gameUI.stopCountdown();
        gameUI.show();
        gameUI.pauseMenu.show();
        resultsScreen.hide();
        mainMenu.hide();
    }
    if (screenName === 'results' || screenName === 'endscreen') {
        gameUI.stopCountdown();
        gameUI.hide();
        resultsScreen.show(getResultsStats(data));
        mainMenu.hide();
    }
    if (screenName === 'mainmenu' || screenName === 'levelselect') {
        gameUI.stopCountdown();
        gameUI.hide();
        gameUI.pauseMenu.hide();
        resultsScreen.hide();
        mainMenu.show();
    }
}

/**
 * @param {string} response: the tag of the payload sent from the backend to indicate what type of update this is
 * @param {*} data: the full game state sent from the backend, used to update the frontend's display and stats
 */
function handleUpdateScreen(response, data) {
    if (response === 'correct') {
        gameUI.combo.increment();
        updateGameStats(data);
    }
    if (response === 'incorrect') {
        gameUI.combo.reset();
        updateGameStats(data);
    }
    if (response === 'next-question') {
        const { question, answer } = getCurrentQuestion(data);
        gameUI.sendQuestion(question, answer);
        updateGameStats(data);
        store.update('questionEndTime', data.questionEndTime);
    }
    if (response === 'plant-growth') {
        gameUI.plantDisplayGroup.setGrowthLevels(data.growthLevel);
        updateGameStats(data);
    }
}

export function initializeBackend() {
    registerCallbacks(handleLoadScreen, handleUpdateScreen);
}

/**
 * Relays user input changes from the UI to the backend.
 * @param {string} input
 */
export function handleInputChange(input){
    onInput(input);
}

export function gameUIReady() {
    gameUI.startCountdown();
    gameUI.onClockTick(() => {
        if (latestGameData) updateGameStats(latestGameData);
    });
}

/**
 * Starts a level and keeps the backend profile language in sync.
 * @param {number} levelNumber
 * @param {string} category
 */
function startLevel(levelNumber, category) {
    setLanguage(category);
    return backendStartLevel(levelNumber, category);
}

export { startLevel, pauseGame, resumeGame, goToMainMenu };
