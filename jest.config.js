module.exports = {
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text-summary'],
  projects: [
    '<rootDir>/packages/tree-walker',
    '<rootDir>/packages/dom-walker',
  ],
};
