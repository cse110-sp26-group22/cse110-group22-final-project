# User Testing

### Identified Issues
1. Navigation can be cumbersome.
    - A lot of switching needs to be done between the keyboard and mouse to navigate.
    - We should design our app to be easily navigable with keyboard-only. 
2. The answers to questions can be repetitive within a level.
    - Looking at `javascript.js`, some of the questions are different, but they have the same answer, which can be a little bit boring.
    - Editing these questions to have newer answers can make users feel like they have more of a variety of questions.
3. Users don't have clarity on which level they are playing.
    - Our demo version started cycling through previous after finishing all 3 levels, which can feel repetitive if the user does not know they have completed all of them.
4. No visual depiction of an incorrect character.
    - Users want the app to tell them if they have typed something wrong.
    
### Addressing these Issues
1. Navigation can be cumbersome. 
    - Auto-focus the text box whenever a game begins.
    - Have good defaults for tab indexes
2. The answers to questions can be repetitive within a level. 
    - Edit some of the questions to ensure that the answer distribution has no repeats.
3. Users don't have clarity on which level they are playing.
    - Add an alert which tells users which level they have started.
    - Edit the results screen to remove the option to retry after all levels have been completed.
4. No visual depiction of an incorrect character.
    - Highlight incorrect sections in red.
    
