
# Frontend Conventions Guide

## About
This file is a guide containing the general conventions I have for consistent frontend development. Note that we are using a class component-based architecture, but we are *not* using native web components, as their syntax is verbose and hard to work with (in my opinion).

This guide will reference the sample webapp in `src/sample` as an example of how I generally expect things to be done in practice.

If you have any questions/feedback/suggestions, feel free to bring them up in the `#team-2` channel in Slack.

## Components

Broadly, components are a way to define the interactivity of our app in an encapsulated manner, while generally adhering to the semantics of HTML/CSS/JS. That is, HTML adds structure, CSS adds styles to HTML, and JS adds interactivity to HTML+CSS.

To achieve this goal, all components will have a root HTML template that they bind to. This template serves as the 'contract' for this component; it must be present in the HTML when the component is instantiated for it to function correctly. 

All components will lie in the `/components` directory, and will be named in PascalCase. Let's take a look at `/components/App.js` for an example of our first component.

We declare the component and mark it for export with
```js 
export default class App { 
``` 

The JSDocs for this component establishes the template the App component expects to function correctly.

```js 
/** 
 * The main component for the app.
 * 
 * Expects the following minimal HTML structure:
 * <div class="app">
 *   <div class="egg-group"></div>
 *   <EggCounter class="egg-counter"/>
 * </div>
 */
```

A few rules for these templates:
1. Templates must have a single root element (in this case, the `div` with class `app`)
2. If a template uses another component, mark the component with its name (e.g. `<EggCounter/>`)
3. Prefer using classes over IDs in templates
    1. This helps components stay reusable.

You will notice that this structure is present in our HTML file, as follows: (TODO)

```html
```

Templates are minimal requirements, so feel free to customize them however you like (e.g. adding more classes or styles).

Our App takes in a constructor, which binds the app to its root HTML element in our document. (TODO)

```js

```





> ``` test ```


 We are using class components arranged in a component tree. That is,
