import hasOwn from '@actualwave/has-own';

const namePrefixes = {};

export const isValidPrefix = (prefix) =>
  typeof prefix === 'string' && hasOwn(namePrefixes, prefix);

export const isPrefixedKey = (key) =>
  key &&
  typeof key === 'string' &&
  key.length > 1 &&
  hasOwn(namePrefixes, key.charAt());

export const getPrefixHandler = (key) => namePrefixes[key.charAt()];

export const setNamePrefix = (prefix, handler) => {
  if (typeof prefix !== 'string' || prefix.length !== 1) {
    throw new Error('Name Prefix must be one character string.');
  }

  namePrefixes[prefix] = handler;
};
