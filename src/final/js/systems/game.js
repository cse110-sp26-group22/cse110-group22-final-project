/**
 * game.js
 *
 * Central game engine. Owns the active GameState and Profile, coordinates
 * all other modules, and exposes functions for ui.js to call.
 *
 * Main responsibilities:
 * - Initialize and own GameState and Profile
 * - Handle game lifecycle (startLevel, nextQuestion, endGame, pauseGame)
 * - Process player input (onInput) and update state accordingly
 * - Coordinate modules: level.js, scoring.js, timer.js, storage.js
 * - Return results to ui.js after each state change
 *
 * Dependencies:
 * - level.js: loadLevel(), ...
 * - timer.js: startTimer(), stopTimer(), ...
 * - scoring.js: calculateTotalScore(), ...
 * - storage.js: loadProfile(), saveProfile(), loadState(), saveState(), ...
 * - models.js: defaultGameState(), defaultProfile(), ...
 *
 * Exports:
 * - startGame(category)
 * - nextQuestion()
 * - onInput(key)
 * - onTick(time)
 * - endGame()
 * - pauseGame() / resumeGame()
 */

//imports (i do it python style for readability)
import { loadLevel } from "./level";
import { startTimer, stopTimer } from "./timer";
import { calculateTotalScore } from "./scoring";
import { loadProfile, saveProfile, loadState, saveState, saveAll} from "./storage";
import { defaultGameState, defaultProfile } from "./models";
import { run } from "jest";

//What needs to be done still?
// - process the creation and storage of a new player profile
// - implement pause/resume functionaliy
// - understand how to handle the loading of a saved game state in ui.js
// - handle the end of a level (currently it just ends the game but it should present an option to move to the next level if there is one)

let gamestate = null;
let runtime = {
  active: false,
  questionStartTime: 0
}
let callbacks = null;

//-----------UI callbacks-----------//
/*
Purpose: set up communication bridge to UI, timer, and other modules.
*/
export function initializeGame(uiCallbacks) {
  callbacks = uiCallbacks;
}

//-----------Game lifecycle functions-----------//
//Purpose: start a new valid level, initialize runtime metadata, render gameplay screen, start timer
export function startLevel(levelNumber, category) {
  if(runtime.active) {
    stopTimer();
  }
  state = await loadLevel(levelNumber, category);
  runtime.active = true;
  runtime.questionStartTime = Date.now();

  callbacks.loadPage("gameplay", {
    word: gamestate.currentQuestion.answer,
    score: gamestate.score,
    time: gamestate.timeRemaining
  }); //this relies on the UI layer passing us loadPage (entire screen changes) and updatePage(minor screen changes)

  startTimer(gamestate.timeRemaining, handleTick, handleExpire); 
}

export function handleRoundComplete() {
  // Implementation for handling round completion (aka question complete)
  const question = state.currentQuestion;
  const now = Date.now();
  const timeTaken = (now - runtime.questionStartTime) / 1000; // Convert to seconds
  const questionScore = calculateTotalScore(
    question.baseScore,
    gamestate.incorrectChars,
    question.answer.length,
    timeTaken,
    question.timeLimit //TBI
  );
  gamestate.score += questionScore;
  const nextQuestion = state.selector.getNextQuestion();
  if(!nextQuestion) {
    endGame();
    //presently it ends game but it should probably present an option to advance to next level if there is one
    return;
  }
  gamestate.currentInput = "";
  gamestate.currentQuestion = nextQuestion;
  gamestate.incorrectChars = 0;
  runtime.questionStartTime = Date.now();

  callbacks.updatePage("question", {
    word: gamestate.currentQuestion.answer,
    score: gamestate.score
    //perhaps a timer update or other metadata needed?
  });
}

export function endGame() {
  if (!runtime.active) return;
  runtime.active = false;
  stopTimer();
  saveState(buildSaveSnapshot());
  callbacks.loadPage("endscreen", {
    score: gamestate.score,
    //perhaps other stats to show on end screen?
  });
}

//may want to implement pause/resume functionality as well

//-----------Timer handling functions-----------//
function onTick(timeRemaining) {
  if(!runtime.active) return;
  gamestate.timeRemaining = timeRemaining;
  callbacks.updatePage("timer", { time: timeRemaining });
}

function handleExpire() {
  if(!runtime.active) return;
  const nextQuestion = gamestate.selector.getNextQuestion();
  if(!nextQuestion) {
    endGame();
    //end game but maybe give option to move to next level
    return;
  }

  gamestate.currentInput = "";
  gamestate.incorrectChars = 0;
  gamestate.currentQuestion = nextQuestion;
  runtime.questionStartTime = Date.now();
  callbacks.updatePage("question", {
    word: gamestate.currentQuestion.answer,
    score: gamestate.score
    //same issue as before: timer update or other metadata needed?
  });
}

//-----------Player input processing-----------//
export function onInput(key) {
  if(!runtime.active) return;
  const answer = gamestate.currentQuestion.answer;
  const currentIndex = gamestate.currentQuestion.currentInput.length;
  const expectedKey = answer[currentIndex];

  if(key !== expectedKey) {
    //Incorrect input key
    gamestate.incorrectChars++;
    callbacks.updatePage("incorrect", {}); //maybe turn the text red to indicate incorrect keystroke
  } else {
    //Correct input key
    gamestate.currentInput += key;
  }
  if(gamestate.currentInput === answer) {
    //Round complete
    handleRoundComplete();
  }
}


//-----------Storage handling functions-----------//
function buildSaveSnapshot() {
  //returns a snapshot of all relevant game data to be saved in localStorage
  return {
    levelNumber: gamestate.levelNumber,
    score: gamestate.score,
    currentQuestionIndex: gamestate.selector.currentIndex,
    timeRemaining: gamestate.timeRemaining,
    category: gamestate.category,
  }
}

