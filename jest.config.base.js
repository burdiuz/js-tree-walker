module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!**/node_modules/**'],
  modulePathIgnorePatterns: ['\\/\\.'],
  testMatch: ['**/*.spec.ts'],
};
