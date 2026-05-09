import { describe, it, expect, beforeEach } from '@jest/globals';
import { create, addAugmentations, nodeAugmentations } from '../index';
import { ONodeAdapter, getSourceTree, valueOf } from '../../fixtures';

describe('Node augmentations', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  addAugmentations(nodeAugmentations);

  beforeEach(() => {
    source = getSourceTree();
    root = create(source, ONodeAdapter);
  });

  describe('name()', () => {
    it('should return node name', () => {
      expect(((root as Record<string, unknown>).name as () => string)()).toBe('#root');
      expect(
        (((root as Record<string, unknown>).first as Record<string, unknown>).name as () => string)(),
      ).toBe('first');
    });
  });

  describe('children()', () => {
    it('should result with direct children of the node', () => {
      expect(
        valueOf(((root as Record<string, unknown>).children as () => unknown)()),
      ).toEqual([
        { name: 'first', data: { level: 1 } },
        { name: 'second', data: { level: 1 } },
        { name: 'third', data: { level: 1 } },
        { name: 'fourth', data: { level: 1 } },
        { name: 'fifth', data: { level: 1 } },
        { name: 'sixth', data: { level: 1 } },
      ]);
    });

    it('should result with empty list for leaf node', () => {
      expect(
        valueOf(
          ((root as Record<string, unknown>).second as { children(): unknown }).children(),
        ),
      ).toEqual([]);
    });

    describe('When name provided', () => {
      it('should return children by name', () => {
        expect(
          valueOf(((root as { children(name: string): unknown }).children)('second')),
        ).toEqual([{ name: 'second', data: { level: 1 } }]);
      });
    });
  });

  describe('descendants()', () => {
    it('should result with all descendants of the node', () => {
      const level1FirstFirst = (root as Record<string, unknown>).first as Record<string, unknown>;
      const level2First = level1FirstFirst.first as { descendants(): unknown };
      expect(valueOf(level2First.descendants())).toEqual([
        { data: { level: 3 }, name: 'first' },
        { data: { level: 3 }, name: 'second' },
        { data: { index: 0, level: 3 }, name: 'third' },
        { data: { index: 1, level: 3 }, name: 'third' },
        { data: { index: 2, level: 3 }, name: 'third' },
        { data: { index: 3, level: 3 }, name: 'third' },
        { data: { level: 3 }, name: 'fourth' },
        { data: { level: 3, uniqueParam: '123-456' }, name: 'uniqueName' },
        { data: { level: 3 }, name: 'fifth' },
        { data: { level: 3 }, name: 'sixth' },
        { data: { level: 4 }, name: 'first' },
        { data: { level: 4 }, name: 'second' },
        { data: { level: 4 }, name: 'third' },
        { data: { level: 4 }, name: 'fourth' },
        { data: { level: 4 }, name: 'fifth' },
        { data: { level: 4 }, name: 'sixth' },
      ]);
    });

    describe('When name provided', () => {
      it('should return descendants by name', () => {
        expect(
          valueOf(((root as { descendants(name: string): unknown }).descendants)('second')),
        ).toEqual([
          { data: { level: 1 }, name: 'second' },
          { data: { level: 2 }, name: 'second' },
          { data: { level: 3 }, name: 'second' },
          { data: { level: 4 }, name: 'second' },
        ]);
      });
    });
  });

  describe('childAt()', () => {
    it('should return child by index', () => {
      expect(valueOf(((root as { childAt(i: number): unknown }).childAt)(0))).toEqual({
        name: 'first',
        data: { level: 1 },
      });
      expect(valueOf(((root as { childAt(i: number): unknown }).childAt)(3))).toEqual({
        name: 'fourth',
        data: { level: 1 },
      });
    });
  });

  describe('root()', () => {
    it('should result with root node', () => {
      expect(
        ((root as Record<string, unknown>).root as () => { valueOf(): unknown })().valueOf(),
      ).toBe(source);
      expect(
        (
          ((root as Record<string, unknown>).first as Record<string, unknown>)
            .root as () => { valueOf(): unknown }
        )().valueOf(),
      ).toBe(source);
    });
  });

  describe('parent()', () => {
    it('should result with parent node', () => {
      expect(
        ((root as Record<string, unknown>).parent as () => unknown)(),
      ).toBeUndefined();
      expect(
        (
          ((root as Record<string, unknown>).first as Record<string, unknown>)
            .parent as () => { valueOf(): unknown }
        )().valueOf(),
      ).toBe(source);
    });
  });
});
