# Team 2 Standup Meeting Minutes

**Project:** Gardening Game Frontend & UI/UX Development  
**Facilitator:** Dmitri
**Meeting Type:** Synchronous (Zoom) & Asynchronous Alignment  

---

### Team Updates

#### Dmitri
* **Accomplishments:**
  * Coordinated and hosted a Zoom sync at 4:00 PM (following Professor Powell's office hours) to solidify deliverables.
  * Checked in on Professor Powell's architecture feedback regarding using placeholder layout boxes with explicit IDs/classes.
  * Approved the temporary inclusion of AI-generated art for the immediate prototyping phase, establishing that final project assets will be non-AI.
* **Blockers:**
  * None.

#### Anirudh Nayak
* **Accomplishments:**
  * Created the core frontend base branch (`frontend-base`) and opened a draft Pull Request (PR) for review.
  * Established and pushed a frontend code conventions guide to the repository (`src/sample`) to align future UI development.
  * Documented a comprehensive presentation structure following the Zoom sync, highlighting project status (ADRs), team health metrics, and challenges (cross-team communication, schedule delays).
  * Outlined the specific pros/cons of temporary AI usage (rapid prototyping vs. code bugs) and established that any AI assets will use the `-AI` suffix.
  * Collaborated with cross-team developer Angel (Team 3) to align frontend architecture expectations with the backend data API.
* **Blockers:**
  * Awaiting feedback and final approval on the outstanding draft PR.

#### Sofia De Marco 
* **Accomplishments:**
  * Contributed key plant mechanic ideas: 3 growth phases (sprout to flower to fruit) mapped out via a quick sketch, using a sparkle animation for interval progress, and a ripening transition (e.g., green to red tomato).
  * Attended the Zoom alignment session to establish upcoming milestones and requested a structured workload delegation map for next steps.
* **Blockers:**
  * None.

#### Brenda Ramirez
* **Accomplishments:**
  * Confirmed and aligned on the upcoming sprint milestones. 
  * Maintained asynchronous communication regarding meeting outcomes due to commuting conflicts.
* **Blockers:**
  * None.

---

### Project Plan: Next Steps Breakdown

The team finalized the development roadmap, categorizing requirements for upcoming sprints:

**Required MVP Features:**
1. **Core UI/UX Improvements:** Implementation of a dedicated results/game-over screen.
2. **Expansion:** Adding broader language support and multi-metric user tracking.
3. **Asset Migration:** Replacing all temporary AI-generated prototyping art with human-designed assets.
4. **Optimization:** Ensuring responsive design for mobile support.
5. **Data Layer:** Creating persistent progression saves utilizing `localStorage`.

**Nice-to-Have Backlog Features:**
* Application-wide light/dark mode.
* Code/syntax highlighting for questions.
* Native animations, background music, and audio sound effects.

---

### Action Items & Next Steps
* [ ] **@All Team Members** — Review Anirudh's pushed frontend architectural conventions guide in `src/sample` and provide design alignment feedback.
* [ ] **@All Team Members** — Formulate a structural plan to split and assign tasks from the newly outlined project roadmap.
* [ ] **@Dmitri** — Complete the comprehensive review of Anirudh's open `frontend-base` draft Pull Request.
* [ ] **@Angel (Team 3) & @Anirudh (Team 2)** — Sync on the finalized callback communication parameters (`loadPage` structures) to link the UI and backend core engine.

# Team 3 Standup Meeting Minutes

**Project:** Backend Core Engine & Functional Refactoring  
**Facilitator:** Angel Thakur  
**Meeting Type:** Synchronous (Google Meet) & Asynchronous Alignment  

---

### Team Updates

#### Angel Thakur 
* **Accomplishments:**
  * Refactored project modules to convert external classes (scoring, leveling, etc.) into stateless mutation handlers acting directly on `GameState`.
  * Designed the high-level architecture for the core gameplay loop and coded the final functionality for `game.js` on the `feat/angel-core-game-loop` branch.
  * Published the official [Game-Engine-to-UI-Contract documentation](https://github.com/cse110-sp26-group22/cse110-group22-final-project/blob/feat/angel-core-game-loop/docs/game-engine-to-UI-contract.md) to outline the frontend communication layer.
  * Optimized the engine logic to track both a persistent state and a temporary runtime state to prevent junk values between loops.
  * Hosted a Google Meet synchronization at 8:52 PM to resolve frontend/backend system integrations.
* **Blockers:**
  * Awaiting code reviews and feedback on the engine structure before finalizing loop connections.

#### Benjamin Michael 
* **Accomplishments:**
  * Drafted a comprehensive, end-to-end file architecture flow diagram and hosted a live-editable version on Excalidraw to synchronize frontend and backend expectations.
  * Conducted an initial PR review on the `feat/angel-core-game-loop` branch.
  * Proposed key structural updates for the frontend contract: renaming `initializeGame()` to `initializeEngine()`, hiding `endGame()` from the public API, and renaming `events.js` to `responses.js` to clear up domain ambiguity.
  * Participated in the Google Meet sync to address code simplification and backend logic refinement.
* **Blockers:**
  * None.

#### Lucien Chen 
* **Accomplishments:**
  * Reviewed the project repository tracking to coordinate end-to-end testing timelines with core engine progress.
  * Collaborated on mapping out execution sequences for initialization flags, question routing pipelines (`get_next_question()`), and state-submission event captures.
  * Began coding the end-to-end (E2E) automation test files.
* **Blockers:**
  * Suffered slight delays due to waiting on the completion of the core loop, but remains on track to