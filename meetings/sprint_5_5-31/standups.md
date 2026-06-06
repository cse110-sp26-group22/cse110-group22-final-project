# Team 2 Standup Meeting Minutes

**Project:** Gardening Game Frontend & Cross-Team Backend Integration  
**Facilitator:** Dmitri  
**Sprint Type:** Final Integration Sprint  
**Core Milestone Deadline:** Wednesday, June 3rd at 11:59 PM (followed by E2E testing ahead of Sunday night code freeze)  

---

### Team Updates

#### Dmitri (Project Manager / Lead)
* **Accomplishments:**
  * Organized subteam structures and finalized the target deadlines for the final development block.
  * Conducted architecture adjustments in `pausemenu.js` to implement "Retry," "Main Menu," and "Level Select" UI components.
  * Audited code freeze requirements, structured overall codebase documentation pathways, and worked on tracking cross-branch documentation progress.
  * Facilitated feature alignment on language-specific plant styles (e.g., specific plants rendering based on whether Python or JavaScript is chosen).
* **Blockers:**
  * Studying for a Math 183 exam caused minor temporary scheduling constraints, but overall progress remains on schedule.

#### Anirudh Nayak (Lead Frontend Developer)
* **Accomplishments:**
  * Executed comprehensive code chores: updated the global coding conventions guide, managed the AI development logs, and organized future repository blueprints.
  * Wrote and verified JSDOM unit tests tracking the 4 isolated frontend interface components.
  * Developed and submitted the primary frontend integration Pull Request branching off of `backend-helpers`.
  * Resolved team roadblocks by clarifying legacy asset structures, confirming that `PlantDisplayGroup` is now optimized to handle a single container item (rendering `PlantDisplay` obsolete).
  * Implemented and merged the global pause menu system and addressed the static timer initialization bug (timer frozen at 0:30 upon retry).
* **Blockers:**
  * Awaiting verified cross-team feedback from Sirtaj and the CI/CD subteam regarding package locks and node environment configuration adjustments before deploying final branch merges.

#### Sofia De Marco (UI/UX Designer / Asset Lead)
* **Accomplishments:**
  * Solved persistent dependency blocking issues by deploying a package-lock and `.yml` environment node version patch.
  * Refined, polished, and successfully committed the official final layout wireframes to the repository after adjusting for the removal of the select level component.
  * Submitted a feature Pull Request for the main menu, theme layout configurations, and updated gameplay visual assets.
  * Isolated an integration bug causing unintended duplicate plants to display concurrently on the screen.
* **Blockers:**
  * Tracking open Issue #70 detailing specific boundary edge cases for plant growth transitions.

#### Brenda Ramirez (UI Developer)
* **Accomplishments:**
  * Addressed frontend UI callback optimizations and integrated the "restart" and "return to main menu" options on the primary pause screen layer.
  * Coordinated with Anirudh to push an immediate early Pull Request of ongoing work to limit downstream codebase merge conflicts.
* **Blockers:**
  * Experienced temporary delays due to an afternoon academic midterm examination and technical Slack notification routing errors.

---

### Cross-Team Integration Updates (Teams 2 & 3)

* **Angel Thakur (Team 3 Lead):** Refactored backend asset logic to transition seamlessly from tracking arrays of plants down to an individualized single plant model. Clarified that the final backend server transmits the entire updated `GameState` package (containing aggregate points, combos, timestamp objects, etc.) immediately upon completion of each individual typing query.
* **Benjamin Michael (Team 3 Developer):** Successfully merged a massive backend bug-fix PR. Fixed automated routing transitions so that `goToResults()` triggers efficiently at the close of every tier level, holding the state freeze until the frontend manually initiates `startLevel()`.

---

# Team 3 Standup Meeting Minutes

**Project:** Backend Architecture Refactor & Integration Sync  
**Facilitator:** Angel Thakur  
**Sprint Type:** Core System Refactor  
**Code Freeze Deadline:** Wednesday night at 11:59 PM  

---

### Team Updates

#### Angel Thakur (Project Manager / Systems Architect)
* **Accomplishments:**
  * Drafted a major backend lifecycle architecture refactor covering level select routers, restart conditions, max score persistence, and `handleQuestionComplete` overrides.
  * Simplified the initial plan post-midterm to transition development away from multi-component class models into a streamlined single-integer plant state framework.
  * Adjusted the `GameState` engine to start the `growthLevel` variable at 0 (range 0–2) to guarantee proper alignment with the frontend's visual asset rendering triggers.
  * Tracked down an isolated exception bug in `glue.js` related to the array-to-number structural migration and aligned docstring comments to enforce `growthLevel` as a primitive `number`.
* **Blockers:**
  * Currently resolving a backend logic bug where users remain unpunished (maintaining 1.00 accuracy metrics) if they abandon a level mid-game and let the timers expire without entering inputs.

#### Benjamin Michael (Glue Layer Developer)
* **Accomplishments:**
  * Finalized the primary `onInput` event execution pattern alongside frontend developers on the `feat/backend-helpers` branch.
  * Executed a full repository camelCase formatting cleanup and dropped obsolete parameters (`curr_input`) to clear memory space for prefix-based indexing.
  * Scaled out global `GameState` variables requested by the frontend: `growthLevel` (integer), `totalInputs` (keystroke monitor for Character Per Minute calculations), and `combo` (tracking consecutive un-interrupted characters).
  * Tied temporary AI-generated data sets into the root workspace to validate utility execution scopes before structural migration.
* **Blockers:**
  * Awaiting explicit feedback on branch code adjustments.

#### Lucien Chen (Backend / Score Logic Developer)
* **Accomplishments:**
  * Inherited the updated prefix-based input logic block: refactoring the engine to track and score character inputs relative to the maximum correct character sequence length achieved by the user.
  * Integrated a tracking callback to handle `correct` / `incorrect` user validation flags while managing automatic calculation freezes during regressive keystrokes.
* **Blockers:**
  * None.

#### Sean Zemlyak (QA / E2E Automation Specialist)
* **Accomplishments:**
  * Adjusted development goals from plant growth algorithms to managing the End-to-End (E2E) automation testing pipelines.
  * Coordinated repository mapping structures with Dmitri to ensure the `questions/` directory remains cleanly tracked in the root index rather than inside nested asset endpoints.
* **Blockers:**
  * None.

#### Yannis Smith (Unit Test Developer)
* **Accomplishments:**
  * Created testing environments for baseline backend structural functions on the `feat/backend-helpers` branch.
  * Prepared localized verification tracks to test timer pause/unpause states and automated state resets when returning to the main menu.
* **Blockers:**
  * None.

---

### Core Team Workflow Agreement
To safeguard code reliability during this intensive architectural pivot, the team has established a strict workflow:
1. **Pre-Development Sync:** Team members must talk directly with Angel to align on a structural plan *before* modifying code.
2. **Detailed Plan Documentation:** Once approved, developers must document their implementation details.
3. **Multi-Reviewer PRs:** Code must be pushed to individual branches and requires a minimum of **two peer reviews** before merging into `main`.
4. **Immediate QA Hand-Off:** The moment development finishes, feature owners must sync with Yannis/Sean to design and run accompanying tests.

---

### Action Items & Next Steps
* [ ] **@Angel** — Implement a patch to penalize idle/timer-expired questions within the `totalInputs` and accuracy tracking modules.
* [ ] **@Benjamin** — Link the game loop up with Team 1's authentic question files located in the root `/questions` directory.
* [ ] **@Lucien** — Polish the prefix-based scoring system and embed the combo multiplier logic block into active calculations.
* [ ] **@Yannis** — Expand unit testing suites to comprehensively evaluate the `totalInputs` and `combo` variables across state transitions.
* [ ] **@Sean** — Integrate new automated E2E tracking paths to validate level-wide timer expirations.