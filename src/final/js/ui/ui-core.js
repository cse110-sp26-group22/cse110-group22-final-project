/**
 * The main entry point for the UI.
 */

import GameUI from './components/GameUI.js';
import * as backend from './backend-emulation/game.js';
import { assertHTMLElement } from './utils.js';

/** @type {GameUI} */
let gameUI;

let currentLevel = 1;

// Initialize the backend game state
backend.initGame();

function updateGameUI() {
    const gameState = backend.getState();
    gameUI.updateStats(gameState.score, -1, -1);
}

async function updateBackend(){
    if(gameUI.checkAnswer()){
        let gameState = backend.nextQuestion();
        console.log(gameState.currentQuestionIndex);
        let currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if(gameState.currentQuestionIndex % 3 === 0){
            gameUI.addPlantLevel();
        }
        if(!currentQuestion){
            console.log("Level complete! Starting next level...");
            currentLevel++;
            gameState = await backend.startLevel(currentLevel, 'python');
            currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        } 
        console.log(currentQuestion);
        gameUI.sendQuestion(currentQuestion.prompt, currentQuestion.answer);
        gameUI.handleQuestionFinish();
    }
}

async function main() {
    const gameDisplayElement = assertHTMLElement(document.querySelector('#game-ui'));
    gameUI = new GameUI(gameDisplayElement);

    const gameState = await backend.startLevel(currentLevel, 'python');
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    gameUI.sendQuestion(currentQuestion.prompt, currentQuestion.answer);
    gameUI.onInput((input) => {
        backend.onInput(input);
        updateBackend();
        updateGameUI();
    });
}

document.addEventListener('DOMContentLoaded', main);