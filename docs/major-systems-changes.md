# Backend Infastructure Refactor ADR

## Context:

After a large nuclear rewrite to our codebase, there were several logic gaps and cohesion gaps with frontend to be filled. The following document illustrates what was changed and what was preserved in this process.

# Communication Architecture

## Preserved Design

The callback-based architecture was retained.

### UI → Backend

```js
gameUI.codeInputField.onKeyPress(glue.handleKeyPress);
```

↓

```js
onInput(key)
```

### Backend → UI

```js
callbacks.loadScreen(...)
callbacks.updateScreen(...)
```

This architecture remains valid and scalable.

---

# Input Validation Refactor

## Original Input Model

The original implementation lacked many checks for the conditions of the game such as where to send players after a level up, when to level up plants, and how to handle non-ASCII keystrokes. 

---

## New Input Model

The backend validates correctness per keystroke and conditionally adapts to the game.

### New Behavior

For each keypress:

* backend checks only the newest character
* backend determines correctness immediately
* backend appends correct characters to canonical state

For level-up behavior, `handleQuestionComplete()` was added.

### Result

```js
const i = state.current_input.length;
const expectedChar = answer[i];

if (key === expectedChar) {
    state.current_input += key;
}
```

### Benefits

* Backend remains source of truth
* UI does not manage correctness logic
* Reduced synchronization risk
* Cleaner combo/scoring hooks
* Input correctly handles neccesary state changes

---

# Timer System Refactor

## Original Timer System

The original timer architecture used:

```js
setInterval(...)
```

with:

* mutable countdown state
* decrementing seconds
* backend tick events every second

### Old Flow

```text
interval tick
    ↓
mutate state.timer
    ↓
emit "tick"
    ↓
frontend updates display
```

---

## Problems With Original Design

### Drift

`setInterval()` is not perfectly precise.

### Duplicate Interval Risk

Multiple intervals could accidentally exist simultaneously.

### Synchronization Problems

Frontend display depended on backend tick cadence.

### Pause/Resume Complexity

Timer state mutation became fragile.

### Backend Spam

Backend emitted unnecessary updates every second.

---

# New Timer Architecture

## Core Design Change

The backend no longer tracks countdown values.

Instead, the backend tracks:

```js
state.question_start_time
state.end_time
```

The frontend computes remaining time locally.

---

# New Timer Module

## Old Design

```js
setInterval(...)
```

## New Design

```js
setTimeout(...)
```

### New Responsibility

The timer module now only answers:

```text
"When should expiration occur?"
```

---

# New `timer.js`

## Removed

```js
timeRemaining
_onTick()
tick events
```

## Added

```js
startTimer(endTime, onExpire)
```

### Logic

```js
const remainingMs = endTime - Date.now();

setTimeout(onExpire, remainingMs);
```

---

# Frontend Timer Rendering

The frontend now computes remaining time itself.

### Formula

```js
remainingMs = state.end_time - Date.now();
```

This removes the need for backend tick events entirely.

---

# Question Lifecycle Timing

## New Timing Fields

Added to state:

```js
question_start_time
end_time
remaining_on_pause
```

---

# Question Start

Whenever a question begins:

```js
state.question_start_time = Date.now();

state.end_time =
    state.question_start_time +
    state.time_limit_ms;
```

---

# Pause Logic

## On Pause

```js
state.remaining_on_pause =
    state.end_time - Date.now();
```

Timer is stopped.

---

## On Resume

```js
state.end_time =
    Date.now() + state.remaining_on_pause;
```

Timer restarts using the recomputed end time.

---

# New Helper Function

Added:

```js
startQuestionTimer()
```

Responsibilities:

* stop existing timer
* store question start timestamp
* compute end timestamp
* start expiration timeout

This helper is called:

* when level starts
* after each completed question

---

# Scoring Refactor

## Original Timing Dependency

Old scoring depended on:

```js
time_limit - timer
```

This relied on decrement-based timer state.

---

# New Timing Dependency

Scoring now uses elapsed real time:

```js
const elapsedMs =
    Date.now() - state.question_start_time;
```

---

# Updated Scoring Signature

## Old

```js
calculateTotalScore(baseScore, state)
```

## New

```js
calculateTotalScore(baseScore, state, elapsedMs)
```

This removes scoring dependence on timer state mutation.

---

# Time Unit Standardization

## Old

```js
timeLimit: 60
```

(seconds)

## New

```js
timeLimitMs: 60000
```

(milliseconds)

---

# Reason For Standardization

All timing APIs already use milliseconds:

* `Date.now()`
* `setTimeout()`

Using milliseconds internally:

* reduces conversion bugs
* simplifies math
* improves consistency

Frontend converts to seconds only for display.

---

# `level.js` Refactor

## Removed

```js
timer
```

from returned state.

The backend no longer stores mutable countdown values.

---

## Added Timing Fields

```js
question_start_time: null
end_time: null
remaining_on_pause: null
```

---

## Fetch Cleanup

Removed duplicate fetch call:

```js
fetch(...)
```

that was unused.

---

## Added Fetch Error Handling

```js
if (!response.ok) {
    throw new Error(...);
}
```

---

# Plant Growth Fix

## Original Bug

```js
if(state.questions.length % 3 === 0)
```

This checked total question count.

---

## Correct Logic

```js
if(state.current_question_index % 3 === 0)
```

Plant growth should depend on progression, not total length.

---

# Remaining Future Improvements

Potential future improvements:

* replace biased array shuffle implementation
* migrate glue callbacks to event objects or reducer-style updates later if needed

These are cleanup/scalability improvements rather than immediate correctness fixes.
