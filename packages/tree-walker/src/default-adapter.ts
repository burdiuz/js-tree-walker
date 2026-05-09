import type { Adapter } from './types';

let defaultAdapter: Adapter | undefined;

export const setDefaultAdapter = (adapter: Adapter): void => {
  defaultAdapter = adapter;
};

export const getDefaultAdapter = (): Adapter | undefined => defaultAdapter;
