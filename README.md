# $1.50 Costco Developers - CSE 110 Final Project

## Members and Roles:

- Angel Thakur: Team Lead, Lead Backend Developer
- Dmitri Singer: Team Lead, Frontend and Questions Team Manager
- Anirudh Nayak: Lead Frontend Developer
- Sofia De Marco: UI/UX and Graphic Designer
- Brenda Ramirez: UI/UX Developer
- Benjamin Michael: Systems Architect, Backend Developer
- Lucien Chen: Backend Developer and Tester
- Sean Zemlyak: Backend Developer
- Yannis Smith: Backend Tester
- Sirtaj Gill: Question Database Developer
- Kaung Myat Han: Questions Database Developer

## Project Overview

Our project is a typing game that tests and refines a user's proficiency with syntax in two languages: Python and JavaScript. Our goal was to create a cozy and immersive interface with a clear goal and difficulty progression for the player to remain engaged. We accomplished this by creating the game "Hello, Farm!" In this game, the user chooses between two languages, then progresses through 3 levels of 9 questions each that test their typing speed, typing accuracy, and proficiency in the language's basic syntax. The premise is simple: code well and keep your plant happy! The player is rewarded for good performance by high scores, a healthy and growing plant, and a large streak, but punished for bad performance by low scores, low streaks, and a plant that fails to produce fruit.

## How to Play?

Access the game at this [link](https://cse110-sp26-group22.github.io/cse110-group22-final-project/src/final/html/index.html) if the Pages deploy link does not work and follow the instructions below to watch your plant (and coding skills) grow!
1. Launch the [game](https://cse110-sp26-group22.github.io/cse110-group22-final-project/src/final/html/index.html).
2. Select your language.
3. Read the prompts at the bottom of the screen.
4. Type the correct answer as quickly and accurately as possible
5. Progress through levels and cultivate your plants. 

## Repo Structure
- root → config for Vite, Babel, Jest, Puppeteer
- /src → source code
- /questions → questions database
- /admin → team videos and peer reviews
- /tests → test files
- /planning → planning files
- /research → prior research 
- /docs → technical documentation
- /meetings → meeting notes
- /ai-use → AI use log

## Team Workflow and Repo Guidelines
1. All tasks must have an issue and a branch created for it
2. Individual task branches should be first merged into overall subteam branches (if applicable) before merging with master
3. All PR's should be either thouroughly self-reviewed or if greater than 300 LoC, be peer-reviewed by one other person
4. All pushed code should have corresponding documentation in the /docs directory. Documentation must include **at least** the following:
    - Sprint #, names of collaborators, date pushed
    - What is the feature?
    - How does it work/how is it being used in the final product?
    - What testing was performed on it
5. All AI usage must be documented. If using AI, create a directory in /ai-use called /sprint-x-ai-log if it does not already exist and create a markdown file called your-name-ai-log.md. Include the following information: 
    - Date
    - What AI model is being used?
    - Prompts log
    - Summarize outputs/results used in final deliverable

