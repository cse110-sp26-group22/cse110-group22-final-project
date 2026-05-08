/***********************
 * QUESTION ENGINE
 * Top-left UI module
 ***********************/
console.log("Question engine loaded");
const QuestionEngine = (() => {
  /***********************
   * STATE
   ***********************/
  const state = {
    questions: [],
    usedQuestionIds: new Set(),
    currentQuestion: null,
    score: 0,
    totalQuestions: 0,
  };

  /***********************
   * DOM ELEMENTS (top-left UI)
   ***********************/
  const promptEl = document.getElementById("prompt");
  const optionsEl = document.getElementById("options");
  const inputEl = document.getElementById("typing-input");
  const scoreEl = document.getElementById("score");

  /***********************
   * LOAD QUESTIONS
   ***********************/
  async function loadQuestions() {
    try {
      const res = await fetch("questions.json");
      const data = await res.json();

      state.questions = data.questions || data;
      state.totalQuestions = state.questions.length;

      nextQuestion();
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  }

  /***********************
   * GET NEXT QUESTION (no repeats)
   ***********************/
  function getNextQuestion() {
    const available = state.questions.filter(
      (q) => !state.usedQuestionIds.has(q.id)
    );

    if (available.length === 0) {
      return null; // game finished
    }

    const q =
      available[Math.floor(Math.random() * available.length)];

    state.usedQuestionIds.add(q.id);
    state.currentQuestion = q;

    return q;
  }

  /***********************
   * RENDER QUESTION
   ***********************/
  function renderQuestion(q) {
    if (!q) return;

    promptEl.textContent = q.prompt;
    optionsEl.innerHTML = "";

    // reset input
    inputEl.value = "";
    inputEl.focus();

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;

      btn.addEventListener("click", () => {
        checkAnswer(opt);
      });

      optionsEl.appendChild(btn);
    });
  }

  /***********************
   * CHECK ANSWER
   ***********************/
  function checkAnswer(selected) {
    const correct = state.currentQuestion.answer;

    if (selected === correct) {
      state.score++;
      scoreEl.textContent = state.score;
    }

    nextQuestion();
  }

  /***********************
   * NEXT QUESTION FLOW
   ***********************/
  function nextQuestion() {
    const q = getNextQuestion();

    if (!q) {
      endGame();
      return;
    }

    renderQuestion(q);
  }

  /***********************
   * END GAME
   ***********************/
  function endGame() {
    promptEl.textContent = "Game Complete!";
    optionsEl.innerHTML = "";
    inputEl.disabled = true;
  }

  /***********************
   * PUBLIC API
   ***********************/
  return {
    loadQuestions,
    nextQuestion,
    getState: () => state,
  };
})();

/***********************
 * START GAME
 ***********************/
QuestionEngine.loadQuestions();