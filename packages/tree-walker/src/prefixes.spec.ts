import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create } from './index';
import { setNamePrefix, isValidPrefix } from './prefixes';
import type { Adapter } from './types';
import { ONodeAdapter, getSourceTree } from '../fixtures';

const DATA_PREFIX = '$';

const dataPrefixGetHandler = (target: unknown, adapter: Adapter, [name]: unknown[]) => {
  const node = adapter.toNode(target) as { data?: Record<string, unknown> };
  return node.data ? node.data[name as string] : undefined;
};

const dataPrefixHasHandler = (target: unknown, adapter: Adapter, [name]: unknown[]) => {
  const node = adapter.toNode(target) as { data?: Record<string, unknown> };
  return node.data ? Object.hasOwn(node.data, name as string) : false;
};

const dataPrefixSetHandler = (target: unknown, adapter: Adapter, [name, value]: unknown[]) => {
  const node = adapter.toNode(target) as { data?: Record<string, unknown> };
  if (!node.data) {
    node.data = {};
  }
  node.data[name as string] = value;
  return true;
};

const dataPrefixDeleteHandler = (target: unknown, adapter: Adapter, [name]: unknown[]) => {
  const node = adapter.toNode(target) as { data?: Record<string, unknown> };
  return node.data ? delete node.data[name as string] : false;
};

describe('Using data prefixes', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  const runSharedTestCases = () => {
    describe('GET', () => {
      describe('When get from node', () => {
        it('should return data property value', () => {
          expect((root as Record<string, unknown>).$level).toBe(0);
          expect(
            ((root as Record<string, unknown>).first as Record<string, unknown>).$level,
          ).toBe(1);
        });
      });
    });

    describe('HAS', () => {
      describe('When get from node', () => {
        it('should return TRUE for existing data properties', () => {
          expect('$level' in (root as object)).toBe(true);
          expect('$otherLevel' in (root as object)).toBe(false);
        });
      });
    });
  };

  describe('When set with function', () => {
    beforeEach(() => {
      setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
      source = getSourceTree();
      root = create(source, ONodeAdapter);
    });

    runSharedTestCases();

    describe('SET', () => {
      it('should throw an error', () => {
        expect(() => {
          (root as Record<string, unknown>).$level = 2;
        }).toThrowError();
      });
    });

    describe('DELETE PROPERTY', () => {
      it('should throw an error', () => {
        expect(() => {
          delete (root as Record<string, unknown>).$level;
        }).toThrowError();
      });
    });
  });

  describe('When set with object', () => {
    beforeEach(() => {
      setNamePrefix(DATA_PREFIX, {
        get: dataPrefixGetHandler,
        has: dataPrefixHasHandler,
        set: dataPrefixSetHandler,
        deleteProperty: dataPrefixDeleteHandler,
      });
      source = getSourceTree();
      root = create(source, ONodeAdapter);
    });

    runSharedTestCases();

    describe('SET', () => {
      it('should update data property value', () => {
        (root as Record<string, unknown>).$level = 2;
        expect((root as Record<string, unknown>).$level).toBe(2);
      });
    });

    describe('DELETE PROPERTY', () => {
      it('should delete data property', () => {
        expect(delete (root as Record<string, unknown>).$level).toBe(true);
        expect(delete (root as Record<string, unknown>).$otherLevel).toBe(true);
      });
    });
  });
});

describe('isValidPrefix()', () => {
  describe('When prefix not registered', () => {
    let _isValidPrefix: (prefix: unknown) => boolean;
    let _setNamePrefix: (prefix: string, handler: unknown) => void;

    beforeEach(() => {
      jest.resetModules();
      ({
        isValidPrefix: _isValidPrefix,
        setNamePrefix: _setNamePrefix,
      } = require('./prefixes'));
    });

    it('should result with FALSE', () => {
      expect(_isValidPrefix(DATA_PREFIX)).toBe(false);
    });

    describe('When prefix registered', () => {
      beforeEach(() => {
        _setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
      });

      it('should result with TRUE', () => {
        expect(_isValidPrefix(DATA_PREFIX)).toBe(true);
      });
    });
  });

  it('should result with FALSE for non registered prefix', () => {
    expect(isValidPrefix('a')).toBe(false);
    expect(isValidPrefix('@')).toBe(false);
    expect(isValidPrefix(' ')).toBe(false);
    expect(isValidPrefix(true)).toBe(false);
    expect(isValidPrefix(2)).toBe(false);
    expect(isValidPrefix('abc')).toBe(false);
  });
});

describe('getPrefixGetHandler()', () => {
  let _getPrefixGetHandler: (key: string) => unknown;
  let _setNamePrefix: (prefix: string, handler: unknown) => void;

  beforeEach(() => {
    jest.resetModules();
    ({
      getPrefixGetHandler: _getPrefixGetHandler,
      setNamePrefix: _setNamePrefix,
    } = require('./prefixes'));
  });

  describe('When prefix not registered', () => {
    it('should result with undefined', () => {
      expect(_getPrefixGetHandler(DATA_PREFIX)).toBeUndefined();
    });
  });

  describe('When prefix registered', () => {
    beforeEach(() => {
      _setNamePrefix(DATA_PREFIX, dataPrefixGetHandler);
    });

    it('should result with handler function', () => {
      expect(_getPrefixGetHandler(DATA_PREFIX)).toBe(dataPrefixGetHandler);
    });
  });
});
