# E2E Testing Config

To make this work flawlessly with Vite and Puppeteer, I upgraded our project architecture to native ES Modules (`"type": "module"`). Because we were already using import statements in our unit tests, our existing test files and source code do not need to change.


Here is what you need to know and follow going forward:
1. New Commands to Run Tests
Please pull the latest changes from the main branch and test using these specific scripts:
• Unit Tests (node & jsdom): `npm run test`
• E2E Tests (Puppeteer): `npm run build && npm run test:e2e`


Note: E2E tests run against our production bundle inside `/dist`. Always chain `npm run build` before running the E2E tests so Puppeteer is testing your latest local changes!. 

2. Boilerplate Template for E2E Tests
If you are assigned to write E2E tests for a feature (e.g., UI interactions, user flows), create your file in tests/e2e/<feature-name>.test.js and use the exact template in tests/e2e/template.test.js.
- Do not modify the beforeAll or afterAll blocks. They are specifically configured to boot up the Vite preview server, initialize Chromium with sandbox flags for GitHub Actions, and cleanly kill the background processes on completion so our ports don't lock up.

3. Key Files That Were Updated (Do Not Revert)

`package.json`: Updated to `"type": "module"` and added `--experimental-vm-modules` to execution paths to natively allow Jest to process ES Module scopes.
`jest.config.js`: Updated to 1export default1 and configured `testPathIgnorePatterns` to make sure standard unit tests completely skip the tests/e2e/ directory.
`jest.config.e2e.js`: Clean configuration explicitly handling E2E test environments.
`babel.config.cjs`: Renamed to .cjs so Babel compiles under a legacy CommonJS context without breaking our modern module runtime environment.


