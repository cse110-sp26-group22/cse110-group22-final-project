import CodeInputField from "./CodeInputField.js";
import PromptDisplay from "./PromptDisplay.js";
import StatsDisplay from "./StatsDisplay.js";

/**
 * The main component for displaying the game. It will contain the game board and any other relevant information. 
 * 
 * Expects the following minimal HTML structure:
 * <div class="game-ui">
 *   <CodeInputField class="code-input-field" />
 *   <StatsDisplay class="stats-display" />
 * </div>
 */
export default class GameUI {
    currentQuestion = "";
    currentAnswer = "";
    /**
     * Binds this GameUI to the given element.
     * @param {HTMLElement} element
     * @param {HTMLElement} codeInputFieldElement
     * @param {HTMLElement} statsDisplayElement
     * @param {HTMLElement} promptDisplayElement
     */
    constructor(element, codeInputFieldElement, statsDisplayElement, promptDisplayElement) {
        this.element = element;
        this.statsDisplay = new StatsDisplay(statsDisplayElement);
        this.codeInputField = new CodeInputField(codeInputFieldElement);
        this.promptDisplay = new PromptDisplay(promptDisplayElement);
        
        this.codeInputField.onEnter((text) => this.handleAnswer(text));
    }

    /**
     * Sends a question to the prompt display.
     * @param {String} question - The question to display.
     * @param {String} answer - The answer to display.
     */
    sendQuestion(question, answer) {
        if(!this.promptDisplay || !this.codeInputField) return;
        this.promptDisplay.setText(question);
        this.codeInputField.setGhostText(answer);

        this.currentQuestion = question;
        this.currentAnswer = answer;
    }

    /**
     * Handles the user's answer.
     * @param {String} answer 
     */
    handleAnswer(answer){
        if(answer === this.currentAnswer){
            console.log("Correct!");
        } else {
            console.log("Incorrect! The correct answer was: " + this.currentAnswer);
        }
    }
}