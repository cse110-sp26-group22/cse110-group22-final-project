import { assertHTMLElement } from "../utils.js";
import CodeInputField from "./game/CodeInputField.js";
import PromptDisplay from "./game/PromptDisplay.js";
import StatsDisplay from "./game/StatsDisplay.js";
import PlantDisplayGroup from "./game/PlantDisplayGroup.js";
import QuestionCounter from "./game/QuestionCounter.js";

/**
 * The main component for displaying the game. It will contain the game board and any other relevant information. 
 * 
 * Expects the following minimal HTML structure:
 * <div class="game-ui">
 *   <CodeInputField class="code-input-field" />
 *   <StatsDisplay class="stats-display" />
 *   <PromptDisplay class="prompt-display" />
 * </div>
 */
export default class GameUI {
    #currentQuestion = "";
    #currentAnswer = "";
    /**
     * Binds this GameUI to the given element.
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;
        this.statsDisplay = new StatsDisplay(assertHTMLElement(this.element.querySelector('.stats-display')));
        this.codeInputField = new CodeInputField(assertHTMLElement(this.element.querySelector('.code-input-field')));
        this.promptDisplay = new PromptDisplay(assertHTMLElement(this.element.querySelector('.prompt-display')));
        this.plantDisplayGroup = new PlantDisplayGroup(assertHTMLElement(this.element.querySelector('.plant-display-group')));
        this.questionCounter = new QuestionCounter(assertHTMLElement(this.element.querySelector('.question-counter')));

        this.codeInputField.onEnter((text) => this.handleAnswer());
    }

    /**
     * Sends a question to the prompt display.
     * @param {String} question - The question to display.
     * @param {String} answer - The answer to display.
     */
    sendQuestion(question, answer) {
        this.#currentQuestion = question;
        this.#currentAnswer = answer;
        
        this.promptDisplay.text = this.#currentQuestion;
        this.codeInputField.answer = this.#currentAnswer;
    }

    /**
     * Handles the end of a question, updating the question counter and any other relevant information.
     */
    handleQuestionFinish(){
        this.questionCounter.count++;
    }

    /**
     * Updates the game statistics.
     * @param {*} score 
     * @param {*} accuracy 
     * @param {*} wpm 
     */
    updateStats(score, accuracy, wpm){
        console.log(`Updating stats: score=${this.questionCounter.count * 10}, accuracy=${accuracy}, wpm=${wpm}`);
        this.statsDisplay.updateStats(this.questionCounter.count * 10, accuracy, wpm);
    }

    /**
     * Sets up a callback to be called when the user types in the code input field.
     * @param {(input: string) => void} callback 
     */
    onInput(callback){
        this.codeInputField.onInput(callback);
    }

    /**
     * Checks the user's answer against the current question's answer and updates the game state accordingly.
     */
    checkAnswer(){
        return this.codeInputField.text === this.#currentAnswer;
    }

    /**
     * Handles the user's answer.
     */
    handleAnswer(){
        if(this.checkAnswer()){
            console.log("Correct!");
            this.plantDisplayGroup.addPlantLevel();
        } else {
            console.log("Incorrect! The correct answer was: " + this.#currentAnswer);
        }
    }
    /**
     * Adds a plant to the plant display group.
     */
    addPlantLevel(){
        this.plantDisplayGroup.addPlantLevel();
    }
}