import { assertHTMLElement } from "../../utils.js";

export default class PauseMenu {
    resumeBtn;
    restartBtn;
    levelSelectBtn;
    mainMenuBtn;


    constructor(element){
        this.element = element; 
        this.element.classList.add('hidden');
        this.resumeBtn = assertHTMLElement(this.element.querySelector('.pause-menu-resume'));
        this.restartBtn = assertHTMLElement(this.element.querySelector('.pause-menu-restart'));
        this.mainMenuBtn = assertHTMLElement(this.element.querySelector('.pause-menu-main-menu'));
    }

    show(){
        this.element.classList.remove('hidden');
    }
    hide(){
        this.element.classList.add('hidden');
    }
    get isVisible(){
        return !this.element.classList.contains('hidden');
    }

    onResume(callback){
        this.resumeBtn.addEventListener('click', () => {
            callback();
            this.hide();
        });
    }
    
    onRestart(callback){
        this.restartBtn.addEventListener('click', () => {
            callback();
            this.hide();
        });
    }

    onLevelSelect(callback){
        this.levelSelectBtn.addEventListener('click', () => {
            callback();
            this.hide();
        });
    }

    onMainMenu(callback){
        this.mainMenuBtn.addEventListener('click', () => {
            callback();
            this.hide();
        });
    }
}
