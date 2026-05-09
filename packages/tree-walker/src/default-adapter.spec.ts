import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Default Adapter', () => {
  let setDefaultAdapter: (adapter: unknown) => void;
  let getDefaultAdapter: () => unknown;

  beforeEach(() => {
    jest.resetModules();
    ({ setDefaultAdapter, getDefaultAdapter } = require('./default-adapter'));
  });

  const ADAPTER = { type: 'default-adapter' };

  it('should not have default adapter at beginning', () => {
    expect(getDefaultAdapter()).toBe(undefined);
  });

  describe('When set default adapter', () => {
    beforeEach(() => {
      setDefaultAdapter(ADAPTER);
    });

    it('should have default adapter', () => {
      expect(getDefaultAdapter()).toBe(ADAPTER);
    });
  });
});
