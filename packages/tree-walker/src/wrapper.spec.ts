import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import wrap from './wrapper';
import { ONode, ONodeAdapter, getSourceTree, valueOf } from '../fixtures';
import { addAugmentations, resetAugmentations } from './augmentations';
import coreAugmentations from './augmentations/core';

describe('Using wrapper Proxy', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  beforeEach(() => {
    addAugmentations(coreAugmentations);
    source = getSourceTree();
    root = wrap(source, ONodeAdapter);
  });

  afterEach(() => {
    resetAugmentations();
  });

  describe('GET', () => {
    describe('When getting child by name', () => {
      it('should result with list of nodes', () => {
        expect(valueOf((root as Record<string, unknown>).first)).toEqual([
          { name: 'first', data: { level: 1 } },
        ]);
      });
    });

    describe('When no children found', () => {
      it('should result with empty list to suppress errors', () => {
        expect(
          valueOf(
            (
              (root as Record<string, unknown>).unk34own as Record<string, unknown>
            )['chil$dren'] as Record<string, unknown>,
          ),
        ).toEqual([]);
      });
    });

    describe('When getting child by index', () => {
      it('should result with single node', () => {
        expect(valueOf((root as Record<number, unknown>)[0])).toEqual({
          name: '#root',
          data: { level: 0 },
        });
      });
    });

    describe('When requesting restricted properties', () => {
      it('should return values as is', () => {
        expect((root as Record<string, unknown>).constructor).toBe(ONode);
        expect((root as Record<string, unknown>).prototype).toBeUndefined();
      });
    });
  });

  describe('HAS', () => {
    describe('When checking child by name', () => {
      it('should result with TRUE for existing child', () => {
        expect('first' in (root as object)).toBe(true);
        expect(0 in (root as object)).toBe(true);
      });

      it('should result with FALSE for non existing child', () => {
        expect('last' in (root as object)).toBe(false);
      });
    });
  });

  describe('APPLY', () => {
    describe('When calling method of node', () => {
      it('should result with calling method directly', () => {
        expect(
          valueOf(
            ((root as Record<string, unknown>).first as { normalMethod(): unknown }).normalMethod(),
          ),
        ).toEqual({ level: 1 });
      });

      it('should wrap result when native method returns a node', () => {
        const firstProxy = (root as Record<string, unknown>).first;
        const firstNode = (firstProxy as Record<number, unknown>)[0];
        const parentProxy = (firstNode as { getParent(): unknown }).getParent();
        expect(valueOf(parentProxy)).toEqual({ name: '#root', data: { level: 0 } });
      });

      it('should wrap result when native method returns a list', () => {
        const firstProxy = (root as Record<string, unknown>).first;
        const firstNode = (firstProxy as Record<number, unknown>)[0];
        const childrenProxy = (firstNode as { getChildren(): unknown }).getChildren();
        const children = valueOf(childrenProxy) as unknown[];
        expect(children).toHaveLength(6);
        expect(children[0]).toEqual({ name: 'first', data: { level: 2 } });
      });
    });
  });

  describe('When calling non-existent augmentation', () => {
    it('should throw an error', () => {
      expect(() => {
        ((root as Record<string, unknown>).anyUnknownAug as () => void)();
      }).toThrowError();
    });
  });

  describe('When SETting a node', () => {
    it('should throw an error for non-prefixed key', () => {
      expect(() => {
        (root as Record<string, unknown>).anyUnknownNode = { name: 'my name', data: {} };
      }).toThrowError();
    });
  });

  describe('When DELETting a node', () => {
    it('should throw an error for non-prefixed key', () => {
      expect(() => {
        delete (root as Record<string, unknown>).first;
      }).toThrowError();
    });
  });

  describe('When using Symbols', () => {
    const value = '123 - le number';
    let symbol: symbol;

    beforeEach(() => {
      symbol = Symbol('my-super-duper-non-trackable-symbol-property');
      (root as Record<symbol, unknown>)[symbol] = value;
    });

    it('should set this property on original/raw node', () => {
      expect((root as { valueOf(): unknown }).valueOf()[symbol as unknown as string]).toBe(value);
    });

    it('should allow access to new property', () => {
      expect((root as Record<symbol, unknown>)[symbol]).toBe(value);
    });

    it('should allow has-check for new property', () => {
      expect(symbol in (root as object)).toBe(true);
    });

    describe('When deleted', () => {
      beforeEach(() => {
        expect(delete (root as Record<symbol, unknown>)[symbol]).toBe(true);
      });

      it('should be deleted from original node', () => {
        expect((root as { valueOf(): unknown }).valueOf()[symbol as unknown as string]).toBeUndefined();
      });

      it('should be undefined from wrapper', () => {
        expect((root as Record<symbol, unknown>)[symbol]).toBeUndefined();
        expect(symbol in (root as object)).toBe(false);
      });
    });
  });
});
