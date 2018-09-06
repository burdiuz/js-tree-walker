import wrap from '../wrapper';
import { ONode, ONodeAdapter, getSourceTree, valueOf } from '../../fixtures';
import { addAugmentations, resetAugmentations } from '../augmentations';
import coreAugmentations from '../augmentations/core';

describe('Using wrapper Proxy', () => {
  let source;
  let root;

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
        expect(valueOf(root.first)).toEqual([{ name: 'first', data: { level: 1 } }]);
      });
    });
    describe('When no children found', () => {
      it('should result with empty list to supress errors', () => {
        expect(valueOf(root.unk34own.chil$dren.some_thing)).toEqual([]);
        expect(valueOf(root.first.first.unk34own.chil$dren.some_thing)).toEqual([]);
      });
    });

    describe('When getting child by index', () => {
      it('should result with list of nodes', () => {
        expect(valueOf(root[0])).toEqual({ name: '#root', data: { level: 0 } });
        expect(valueOf(root.first[0])).toEqual({
          name: 'first',
          data: { level: 1 },
        });
        expect(valueOf(root.first[1])).toBeNull();
        expect(valueOf(root.first.first.third[0])).toEqual({
          name: 'third',
          data: { level: 3, index: 0 },
        });
        expect(valueOf(root.first.first.third[1])).toEqual({
          name: 'third',
          data: { level: 3, index: 1 },
        });
        expect(valueOf(root.first.first.third[2])).toEqual({
          name: 'third',
          data: { level: 3, index: 2 },
        });
      });
    });

    describe('When getting descendant by name', () => {
      it('should result with list of nodes', () => {
        expect(valueOf(root.first.first.second)).toEqual([{ name: 'second', data: { level: 3 } }]);
      });
    });

    describe('When getting multiple descendants by name', () => {
      it('should result with list of nodes', () => {
        expect(valueOf(root.first.first.third)).toEqual([
          { name: 'third', data: { index: 0, level: 3 } },
          { name: 'third', data: { index: 1, level: 3 } },
          { name: 'third', data: { index: 2, level: 3 } },
          { name: 'third', data: { index: 3, level: 3 } },
        ]);
      });
    });

    describe('When requesting restricted properties', () => {
      it('should return values as is', () => {
        expect(root.constructor).toBe(ONode);
        // results with unwrapped value, undefined
        expect(root.prototype).toBeUndefined();
      });
    });
  });

  describe('HAS', () => {
    describe('When checking child by name', () => {
      it('should result with TRUE for existing child', () => {
        expect('first' in root).toBe(true);
        expect(0 in root.first).toBe(true);
        expect('first' in root.first).toBe(true);
        expect('third' in root.first.first).toBe(true);
        expect(3 in root.first.first.third).toBe(true);
      });

      it('should result with FALSE for non existing child', () => {
        expect('last' in root).toBe(false);
        expect(1 in root.first).toBe(false);
        expect('something' in root.first).toBe(false);
        expect(5 in root.first.first.third).toBe(false);
      });
    });
  });

  describe('APPLY', () => {
    describe('When calling method of node', () => {
      it('should result with calling method directly', () => {
        expect(valueOf(root.first.normalMethod())).toEqual({ level: 1 });
      });
    });
  });

  describe('When calling non-existent augmentation', () => {
    it('should throw an error', () => {
      expect(() => {
        root.anyUnknownAug();
      }).toThrowError();
    });
  });

  describe('When SETting a node', () => {
    it('should throw an error', () => {
      expect(() => {
        root.anyUnknownNode = { name: 'my name', data: {} };
      }).toThrowError();

      expect(() => {
        root.anyUnknownNode[0] = { name: 'mahName', data: {} };
      }).toThrowError();
    });
  });

  describe('When DELETting a node', () => {
    it('should throw an error', () => {
      expect(() => {
        delete root.first;
      }).toThrowError();

      expect(() => {
        delete root.first.first.third[2];
      }).toThrowError();
    });
  });

  describe('When using Symbols', () => {
    const value = '123 - le number';
    let symbol;

    beforeEach(() => {
      symbol = Symbol('my-super-duper-non-trackable-symbol-property');

      root[symbol] = value;
      root.first.first.third[symbol] = value;
    });

    it('should set this property on original/raw node', () => {
      expect(root.valueOf()[symbol]).toBe(value);
      expect(root.first.first.third.valueOf()[0][symbol]).toBe(value);
    });

    it('should allow access to new property', () => {
      expect(root[symbol]).toBe(value);
      expect(root.first.first.third[symbol]).toBe(value);
    });

    it('should allow access to new property', () => {
      expect(symbol in root).toBe(true);
      expect(symbol in root.first.first.third).toBe(true);
    });

    describe('When deleted', () => {
      beforeEach(() => {
        expect(delete root[symbol]).toBe(true);
        expect(delete root.first.first.third[symbol]).toBe(true);
      });

      it('should be deleted from original node', () => {
        expect(root.valueOf()[symbol]).toBeUndefined();
        expect(root.first.first.third.valueOf()[0][symbol]).toBeUndefined();
      });

      it('should be undefined from wrapper', () => {
        expect(root[symbol]).toBeUndefined();
        expect(symbol in root).toBe(false);

        expect(root.first.first.third[symbol]).toBeUndefined();
        expect(symbol in root.first.first.third).toBe(false);
      });
    });
  });
});
