const base = require('../../jest.config.base.js');
const path = require('path');

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@actualwave/tree-walker/(.*)$': path.resolve(__dirname, '../tree-walker/src/$1/index.ts'),
    '^@actualwave/tree-walker$': path.resolve(__dirname, '../tree-walker/src/index.ts'),
  },
};
