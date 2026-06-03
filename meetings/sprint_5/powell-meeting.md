# Professor Meeting Notes

## Diagram and Documentation Feedback
- The map in the middle helps frame the architecture.
- The event loop should be moved to a separate document that specifically describes the event loop.
- Pseudocode should not be placed in the same section as the system structure/architecture.
- There is currently a gap between the high-level system diagram and the pseudocode; add an intermediate level of explanation.

---

## CI/CD Feedback
- Add E2E testing to the pipeline.
- Fix existing CI/CD issues.
- Consider adding:
  - Code quality reports
  - Additional automated reporting tools

### Key Point
- The midterm presentation comes first, but if the pipeline cannot successfully build the software, that is a major concern.
- Some of the perceived progress is "performative" if the software is not actually building and tests are not running.

---

## Priorities

### Priority 1 (Critical)
- Fix the CI/CD pipeline.
- Ensure the software builds correctly.
- Ensure tests are running successfully.

### Priority 2
- Fix and improve the system diagrams.

### Priority 3
- Use the CI/CD pipeline and improved documentation to create shared team understanding of the codebase and architecture.

---

## Team Reflection
- On average, about one-third of teams encounter this issue every quarter.
- Avoid "performative coding"—focus on infrastructure and working software rather than appearances.
- Spend the next five days understanding:
  - Why CI/CD matters
  - How it supports development
  - Lessons learned for retrospectives and project videos
- Acknowledge that the project's infrastructure was not established early enough.
- CI/CD implementation started later than ideal.

---

## Concerns
- The team will not be satisfied without working software.
- Preserving points requires resolving the critical infrastructure issues.
- Building, testing, and deployment must be reliable before focusing on presentation polish.