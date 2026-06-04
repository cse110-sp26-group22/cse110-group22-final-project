export default {
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      // CRITICAL: Added E2E path ignore so unit tests skip the puppeteer folder
      testPathIgnorePatterns: ['<rootDir>/tests/ui/', '<rootDir>/tests/e2e/'],
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/ui/**/*.test.js'],
      // CRITICAL: Added E2E path ignore here as well just to be totally safe
      testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
  ],
};