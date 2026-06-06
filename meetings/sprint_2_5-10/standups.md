# Team 2 Standup Meeting Minutes

**Project:** Gardening Game Frontend & UI/UX Development  
**Facilitator:** Dmitri
**Sprint Deadline:** Sunday at 11:59 PM  

---

### Team Updates

#### Dmitri
* **Accomplishments:**
  * Outlined the 4-step sprint plan: 1) Build document structure based on the gardening game, 2) Create individual wireframe/concept art branches, 3) Vote on the optimal choice (75% majority required), 4) Split by features for prototype development.
  * Clarified that Figma can be used for wireframes, and frontend implementation will focus on HTML/CSS.
  * Shared core gameplay breakdown from the meeting: Player selects language, starting level, and farm name at start; questions load from database; plant grows every 3 questions, levels up/gets a new plant every 9 questions.
  * Relayed feedback from Professor Powell: Use placeholder boxes with explicit IDs/classes to test layout connectivity before adding assets.
  * Approved the temporary use of AI-generated art for prototyping this sprint.
* **Blockers:**
  * None.

#### Sofia De Marco 
* **Accomplishments:**
  * Clarified sprint documentation requirements regarding the look and feel of the game.
  * Provided a quick sketch/concept art detailing the three plant growth states (sprout, flower, fruit).
  * Proposed visual mechanics: using a sparkle effect to show mid-step progress, moving harvested fruit into a basket, and showing fruit ripening (e.g., green to red tomato) rather than using multiple sparkles.
* **Blockers:**
  * None.

#### Anirudh Nayak
* **Accomplishments:**
  * Contributed to the planning document in the repository.
  * Created the final frontend base branch (`frontend-base`) and submitted a draft Pull Request (PR) for team review.
  * Prepared to finish wireframes based on the updated planning document.
  * Agreed to tag any temporary, AI-generated placeholder art assets with an `-AI` suffix.
* **Blockers:**
  * Awaiting feedback on the `frontend-base` draft PR.

#### Brenda Ramirez
* **Accomplishments:**
  * Confirmed sprint deadlines and clarified project tech-stack constraints (Figma vs. direct HTML/CSS/JS implementation).
* **Blockers:**
  * None.

---

### Action Items & Next Steps
* [ ] **@All Team Members** — Create individual repository branches to build and submit your own wireframe/concept art variants for the 3 plant states (planted, seedling, bloom) and the farm backdrop.
* [ ] **@All Team Members** — Review Anirudh’s `frontend-base` draft PR and provide feedback.
* [ ] **@All Team Members** — Finalize documentation, wireframes, and placeholder structural layouts (using IDs/classes) by **Sunday at 11:59 PM**.
* [ ] **@Dmitri** — Review `frontend-base` branch after class.

# Team 3 Standup Meeting Mins 

**Project:** Gardening Game Architecture & Sprint 2 Backend Core  
**Facilitator:** Angel Thakur  
**Sprint Deadline:** Ideally by the upcoming Monday meeting  

---

### Team Updates

#### Angel Thakur 
* **Accomplishments:**
  * Assigned initial subteam tasks based on the GitHub repository architecture.
  * Facilitated an extensive architectural discussion to pivot the project structure away from strict Object-Oriented Programming (OOP) abstraction toward a cleaner, hybrid functional data-flow design.
  * Formalized and documented the new project directory structure, file-specific goals (`ui.js`, `game.js`, `models.js`, and `systems/*.js`), and the comprehensive 10-step core data flow loop.
  * Directed the team to create tracking issues for their subteams and to transition all code out of the prototype folder into a new, finalized codebase directory.
* **Blockers:**
  * None.

#### Benjamin Michael 
* **Accomplishments:**
  * Reviewed the repository planning documents and successfully proposed a structural redesign to replace heavy class abstractions with a central, highly scalable "dumb/dummy" state object and isolated functional files (`game.js`, `models.js`).
  * Collaborated with Angel to design the communication pipeline between `ui.js` (DOM/Events) and `game.js` (State Manipulation) ensuring the UI never directly modifies the game state.
  * Committed to joining Subteam 2 to build out the GameState core flow and functionality using the newly agreed-upon architectural design.
* **Blockers:**
  * None; committed to delivering updates by Thursday.

#### Lucien Chen 
* **Accomplishments:**
  * Developed the core logic for the scoring system and stopwatches/timers. 
  * Implemented the baseline scoring formula: `Score = BC + BC * (1 + %accuracy) - seconds_elapsed * question_difficulty` (where BC = Base Correctness).
  * Pushed the implemented code to the `dev-sprint-2-scoring-timer` branch and coordinated with Yannis for code review and test drafting.
* **Blockers:**
  * None.

#### Sean Zemlyak 
* **Accomplishments:**
  * Voluntarily joined Subteam 1 to focus on object creation and data management.
  * Assigned to write an Architectural Decision Record (ADR) regarding game-state user savings, modify the `Player` class, and construct structural components for the `Farm` and `Plant` modules.
* **Blockers:**
  * None.

#### Yannis Smith 
* **Accomplishments:**
  * Partnered with Sean on Subteam 1 to build out the `Player`, `Farm`, and `Plant` structural frameworks.
  * Tasked by Lucien to review the newly pushed `dev-sprint-2-scoring-timer` branch and write the required unit tests for the scoring computation system.
* **Blockers:**
  * None.

---

### Action Items & Next Steps

* [ ] **@Subteam 1 (Sean & Yannis)** * Draft the Architectural Decision Record (ADR) for saving user game-states.  
  * Modify and build the baseline dummy classes/attributes in `models.js` (`Player`, `Farm`, `Plant`).  
  * Implement `localStorage` persistence functions (`saveGame`, `loadGame`), attribute getters/setters, and accompanying unit tests/documentation.

* [ ] **@Subteam 2 (Angel & Ben)** * Formalize and draft the ADR for the MVP scoring system framework.  
  * Construct the `game.js` core loop function (`updateGame`) to manage incoming data structures.  
  * Build isolated game logic modules within `systems/*.js` (`progression.js`, `question.js`, `farm.js`).  
  * Set up complete end-to-end and unit testing pipelines for the core execution flow.

* [ ] **@Yannis** — Review Lucien's code on the `dev-sprint-2-scoring-timer` branch and complete the scoring/timer unit tests.
* [ ] **@All Team Members** — Create GitHub issues for respective tasks and begin building out the new final codebase folder.