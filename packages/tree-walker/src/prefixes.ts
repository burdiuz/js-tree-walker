import type { PrefixHandlerFunction, PrefixHandlers } from './types';

export const GET_KEY = 'get' as const;
export const HAS_KEY = 'has' as const;
export const SET_KEY = 'set' as const;
export const DELETE_KEY = 'deleteProperty' as const;

const namePrefixes: Record<string, PrefixHandlers> = {};

export const isValidPrefix = (prefix: unknown): boolean =>
  typeof prefix === 'string' && Object.hasOwn(namePrefixes, prefix);

export const getPrefix = (key: string): string => key.charAt(0);

export const isPrefixedKey = (key: unknown): boolean => {
  if (key && typeof key === 'string' && key.length > 1) {
    return Object.hasOwn(namePrefixes, getPrefix(key));
  }
  return false;
};

const getPrefixHandlers = (key: string): PrefixHandlers | undefined => namePrefixes[getPrefix(key)];

const createPrefixHandlerGetter =
  (type: keyof PrefixHandlers) =>
  (key: string): PrefixHandlerFunction | undefined => {
    const handlers = getPrefixHandlers(key);
    return handlers && handlers[type];
  };

export const getPrefixGetHandler = createPrefixHandlerGetter(GET_KEY);
export const getPrefixHasHandler = createPrefixHandlerGetter(HAS_KEY);
export const getPrefixSetHandler = createPrefixHandlerGetter(SET_KEY);
export const getPrefixDeleteHandler = createPrefixHandlerGetter(DELETE_KEY);

export const setNamePrefix = (
  prefix: string,
  handler: PrefixHandlerFunction | PrefixHandlers,
): void => {
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
