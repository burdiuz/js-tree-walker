import hasOwn from '@actualwave/has-own';

export const GET_KEY = 'get';
export const HAS_KEY = 'has';
export const SET_KEY = 'set';
export const DELETE_KEY = 'deleteProperty';

const namePrefixes = {};

export const isValidPrefix = (prefix) => typeof prefix === 'string' && hasOwn(namePrefixes, prefix);

export const getPrefix = (key) => key.charAt();

export const isPrefixedKey = (key) => {
  if (key && typeof key === 'string' && key.length > 1) {
    return hasOwn(namePrefixes, getPrefix(key));
  }

  return false;
};

const getPrefixHandlers = (key) => namePrefixes[getPrefix(key)];

const createPrefixHandlerGetter = (type) => (key) => {
  const handlers = getPrefixHandlers(key);

  return handlers && handlers[type];
};

export const getPrefixGetHandler = createPrefixHandlerGetter(GET_KEY);

export const getPrefixHasHandler = createPrefixHandlerGetter(HAS_KEY);

export const getPrefixSetHandler = createPrefixHandlerGetter(SET_KEY);

export const getPrefixDeleteHandler = createPrefixHandlerGetter(DELETE_KEY);

export const setNamePrefix = (prefix, handler) => {
  if (typeof prefix !== 'string' || prefix.length !== 1) {
    throw new Error('Name Prefix must be one character string.');
  }

  if (typeof handler === 'function') {
    namePrefixes[prefix] = {
      get: handler,
      has: (...args) => handler(...args) !== undefined,
    };
  } else {
    const { get, set, has, deleteProperty } = handler;

    namePrefixes[prefix] = { get, set, has, deleteProperty };
  }
};
