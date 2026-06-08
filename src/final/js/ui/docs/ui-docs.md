# UI documentation
## User Frontend
The HTML file index.html displays the frontend and makes everything accessible.
It connects to gamecomponents.css, components.css, qe-style.css, and ui.js.
The way that our UI works is that it appears with a message titled "Typing Game", with a toggle for different languages, and a button to start the game. 
## GameUI
We have our GameUI, which displays everything that starts up when you hit play for the game.
It contains displays for:
- itself
- stats display
- code input field
- prompt display
- plant display group
- timer
- combo
- notification display
- the pause menu
- the game tray
It also sends a question where it sets the code input field, and displays the prompt with the question. There is text in a lower opacity that shows you what the answer needs to be.
The pause menu is a callback that waits for a click, and then pauses the game. There's a callback in the pause menu that waits for the player to click resume in order to resume the game.
## components.css
Components checks the ResultsScreen styles and the RulesBox styles
## game-components.css
Game components checks for GameUI, PauseMenu, NotificationDisplay, PlantDisplayGroup, PlantDisplay, StatsDisplay, PromptDisplay, CodeInputField, Timer, Combo, and GameTray styles.
## qe-styles.css
This styles covers basic padding such as our body and site title.
## CodeInputField.js
The code input field looks at the ghost text strings, renders the "ghost text" as a hint for the user to type. There is an event handler for when the user presses "Enter", which passes the current input value as an argument to the event handler. There is an event handler for when the value changes, and an event handler for when a key is pressed in the input field.
## PromptDisplay.js
This component displays the current prompt to the user, and expects some minimal HTML structure to display. 
## PlantDisplay.js
This component is responsible for displaying the current stages of the plant in the typing game.
## PlantDisplayGroup.js
This component displays the plants grouped together, and contains a PlantDisplayGroup, as well as adding a PlantDisplay to the new PlantDisplayGroup
## GameTray.js 
This component displays the game tray.
## Combo.js 
This component sets the combo count, adds a combo to a given element, and then updates the combo and display.
## PauseMenu.js
Adds the pause menu, which is hidden on start, but then is activated via the pause button. It contains a callback function to fire when the resume button is clicked.
## StatsDisplay.js
This file displays the current score, accuracy, and WPM.
## Timer.js
This file displays the time remaining in the game.
## MainMenu.js
This is the main menu component for the game. 
## NotificationDisplay.js
This has notification display text that shows up at the top of the UI
## ResultsScreen.js
Displays the results screen, which shows score, accuracy, cpm, the questions, the language, the retry button, and the main menu button.
## ResultsBox.js
Displays the rules of the game to the user.
