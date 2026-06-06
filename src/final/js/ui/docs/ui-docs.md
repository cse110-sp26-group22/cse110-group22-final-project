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

