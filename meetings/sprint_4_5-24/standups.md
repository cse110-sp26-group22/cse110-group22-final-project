# Team 2 Standup Meeting Minutes

**Project:** Gardening Game Frontend Architecture, Testing & UI/UX Backlog  
**Facilitator:** Dmitri  
**Sprint Phase:** Core Functional Integration & Quality Assurance  

---

### Team Updates

#### Dmitri 
* **Accomplishments:**
  * Clarified global repository branching standards: instructed the team to branch exclusively off of `main` for new features (using the `feat/` prefix) rather than the legacy `frontend-base` branch.
  * Facilitated cross-team data updates by auditing and editing the game's JSON question tracking files per Angel’s request on the `questions` branch.
  * Designed structural blueprints for the **Pause Menu** interface (incorporating mobile-friendly hamburger formatting and integrated countdown clock timers).
  * Audited external automation techniques for repository management, reviewing Group 23's implementation pipelines to map automated JSDoc comments straight into static development records.
* **Blockers:**
  * Scheduling conflicts with exams

#### Anirudh Nayak
* **Accomplishments:**
  * Established the foundational link between the frontend and Team 3's backend system inside `ui/glue.js` using Benjamin's API patterns.
  * Provided critical code styling reviews: introduced a simplified architectural convention to delegate interaction callbacks directly to specific button elements rather than wrapping them as private properties inside parent screen objects.
  * Formulated an exhaustive backlog cleanup checklist covering mobile optimization, noscript fallbacks, global parameters, accessibility compliance, and JSDOM component tests.
  * Hardcoded localized backend-emulation folders to isolate client testing environments while upstream API endpoints were being finalized.
  * Coordinated with Sofia to establish screen fallback standards to stretch/zoom game background layouts across multiple target device ratios.
* **Blockers:**
  * Awaiting explicit verification from Angel regarding package dependency updates before pushing automated JSDoc pipelines.

#### Sofia De Marco 
* **Accomplishments:**
  * Created, pushed, and merged the foundational multi-scene repository branch (`feat/multi-scene`).
  * Integrated a web-accessibility testing extension checker to evaluate color contrast and verify WCAG compliance throughout the frontend DOM.
  * Resolved downstream merge conflicts by refactoring private callbacks on the Results Screen to align with the new element-level callback standards.
  * Created and submitted upgraded background graphics and optimized palette theme configurations designed to scale symmetrically across varying dimensions (tablets, desktops, and mobile devices).
* **Blockers:**
  * Scheduling conflicts due to exam.

#### Brenda Ramirez 
* **Accomplishments:**
  * Reviewed and cross-checked open notification modules merged into the workspace.
  * Inherited quality control assignments to map isolated unit test paths across existing personal UI elements using newly implemented JSDOM capabilities.
  * Conducted comment passes across underlying HTML structural nodes and CSS design matrices to fulfill repository clean-up milestones.
* **Blockers:**
  * None; currently coordinating with Sofia to share upcoming structural interface integration items.

---

### Sprint Feature Alignment: Results Screen Specification
The team achieved complete alignment regarding the core gameplay loop and the target user flow:
* **The "Angry Birds" Model:** Instead of sending users immediately back to a complex level selection menu upon concluding a sequence (9 questions), the interface will transition straight into a dedicated **Level Cleared Results Screen**.
* **Interface Options:** This display will cleanly summarize point metrics and include clear button pathways allowing users to instantly select **Replay/Retry Level**, **Advance to Next Level**, or **Return to Main Menu**.
* **Visual Progress:** Game over logic and plant transition configurations will rely on temporary placeholder states in `glue.js` until final properties are fully exposed by Team 3.

---

### Action Items & Next Steps
* [ ] **@Dmitri** — Complete the missing diagramming sections to generate a clear component-tree map linking code file endpoints.
* [ ] **@Dmitri** — Review, approve, and merge Anirudh's outstanding frontend architecture ADR documentation file.
* [ ] **@Anirudh** — Re-emulate Brenda's interface notification systems to anchor them cleanly into the updated backend-state loops.
* [ ] **@Sofia** — Continue drawing responsive multi-device graphic variants for the progressive plant growth stages.
* [ ] **@Brenda** — Coordinate directly with Sofia to begin drafting test criteria for individual module elements.


# Team 3 Standup Meeting Minutes

**Project:** Backend Core Engine & Architectural Contract Realignment  
**Facilitator:** Angel Thakur  
**Sprint Phase:** Core Contract Restructuring & Score Matrix Revision  

---

### Team Updates

#### Angel Thakur 
* **Accomplishments:**
  * Drafted and published the comprehensive **Frontend / Backend Contract** establishing the backend as the single, authoritative source of truth for all game logic, progression parameters, and state validation rules.
  * Rejected proposed frontend dirty-set mutation tracking to eliminate cross-layer state synchronization vulnerabilities.
  * Created the `feat/game-engine-modified` repository branch, optimizing code parameters to deliver data snapshots using strict `type`-flagged JavaScript objects (e.g., `QUESTION_CHANGE`).
  * Re-architected data structures to resolve tracking errors in historical question multipliers, shifting point addition and calculations dynamically to the `handleQuestionComplete()` phase.
  * Formulated the `savePlayerState()` persistence layer to allow deep state caching across variable frequencies (per level, query, or character keystroke).
  * Removed `goToLevelSelect()` and engineered `goToNextLevel()` to directly mirror Team 2’s updated post-stage "Results Screen" layout flow.
* **Blockers:**
  * Awaiting verified cross-team feature requirement specifications from Dmitri to organize final backlog sub-delegations.

#### Benjamin Michael 
* **Accomplishments:**
  * Deployed the `feat/game` remote branch complete with foundational model revisions and core loop validation scripts.
  * Modeled initial user flow interactions on Excalidraw, tracing hardware keyboard parameters down through `onInput(key)` execution listeners.
  * Conducted an extensive architectural assessment on the modified engine PR, highlighting redundant runtime complexity bottlenecks and a specific cascading countdown anomaly that expanded active question timers.
* **Blockers:**
  * None.

#### Lucien Chen 
* **Accomplishments:**
  * Discovered and documented calculation edge cases within the validation engine during initial codebase runtime scans.
  * Collaborated with Angel to build patch parameters handling the level termination sequences, tracking automated question loops across local testing runs.
* **Blockers:**
  * None.

#### Yannis Smith
* **Accomplishments:**
  * Drafted state evaluation scripts to test baseline variables on the `feat/game` branch.
  * Verified environment integrity across model mutations to keep unit code aligned with the upcoming shift toward full-string keystroke inspections.
* **Blockers:**
  * None.

#### Sean Zemlyak
* **Accomplishments:**
  * Maintained integration tracks for end-to-end framework execution sequences.
  * Set up automation pipeline templates to ingest modified JSON query fields as soon as variable names stabilize.
* **Blockers:**
  * None.

---

### Shared Engineering Decision Record: State Contract

The team approved the formalized communication architecture defining clear boundaries between modules.

Note: this is not included because it was later reverted back to the event-based communication.

### Action Items & Next Steps
* [ ] **@Angel** — Integrate the custom `base_scores` tracking matrix into `level.js` to parse raw points criteria directly from external JSON inputs.
* [ ] **@Benjamin** — Fix the active question timer overflow error surfaced during the `feat/game-engine-modified` review pass.
* [ ] **@Lucien** — Review Anirudh’s feedback regarding character latency desynchronization and log an issue to track input state refinement.
* [ ] **@Yannis** — Expand localized unit testing frameworks to validate engine behavior when running `savePlayerState()` and `goToNextLevel()`.
* [ ] **@Sean** — Integrate validation criteria for the newly separated `endGame()` execution endpoints inside active automated end-to-end testing scripts.