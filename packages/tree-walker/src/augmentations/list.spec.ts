import { describe, it, expect, beforeEach } from '@jest/globals';
import { create, addAugmentations, nodeAugmentations, listAugmentations } from '../index';
import { ONodeAdapter, getSourceTree, valueOf } from '../../fixtures';

describe('List augmentations', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  addAugmentations(nodeAugmentations);
  addAugmentations(listAugmentations);

  beforeEach(() => {
    source = getSourceTree();
    root = create(source, ONodeAdapter);
  });

  describe('length()', () => {
    it('should result with length of a list', () => {
      expect(((root as Record<string, unknown>).length as () => number)()).toBe(1);
      expect(
        (
          ((root as Record<string, unknown>).children as () => { length(): number })
        )().length(),
      ).toBe(6);
    });
  });

  describe('at()', () => {
    it('should result with single node out of the list', () => {
      expect(valueOf(((root as { at(i: number): unknown }).at)(0))).toEqual({
        data: { level: 0 },
        name: '#root',
      });
    });

    it('should result with empty list for out-of-bounds index', () => {
      expect(
        valueOf(
          (
            ((root as Record<string, unknown>).first as Record<string, unknown>)
              .first as { at(i: number): unknown }
          ).at(3000),
        ),
      ).toEqual([]);
    });
  });

  describe('first()', () => {
    it('should result with first node out of the list', () => {
      expect(valueOf(((root as { first(): unknown }).first)())).toEqual({
        data: { level: 0 },
        name: '#root',
      });
    });
  });

  describe('filter()', () => {
    it('should return filtered list', () => {
      expect(
        valueOf(
          ((root as { filter(cb: (item: unknown) => boolean): unknown }).filter)(
            () => true,
          ),
        ),
      ).toEqual([{ data: { level: 0 }, name: '#root' }]);

      expect(
        valueOf(
          ((root as { filter(cb: (item: unknown) => boolean): unknown }).filter)(
            () => false,
          ),
        ),
      ).toEqual([]);
    });

    it('should iterate all items when called on a multi-item list', () => {
      const children = ((root as { children(): unknown }).children)();
      const result = valueOf(
        (children as { filter(cb: (item: unknown) => boolean): unknown }).filter(() => true),
      ) as unknown[];
      expect(result).toHaveLength(6);
    });
  });

  describe('map()', () => {
    it('should return mapped list', () => {
      const descendants = (root as { descendants(): unknown }).descendants();
      const result = (
        descendants as { map(cb: (item: unknown) => unknown): unknown[] }
      ).map((item: unknown) =>
        (item as { valueOf(): { data: { level: number } } }).valueOf().data.level === 2
          ? item
          : null,
      );

      const levelTwoItems = (result as unknown[])
        .filter(Boolean)
        .map((item) => valueOf(item));

      expect(levelTwoItems).toEqual([
        { name: 'first', data: { level: 2 } },
        { name: 'second', data: { level: 2 } },
        { name: 'third', data: { level: 2 } },
        { name: 'fourth', data: { level: 2 } },
        { name: 'fifth', data: { level: 2 } },
        { name: 'sixth', data: { level: 2 } },
      ]);
    });
  });

  describe('forEach()', () => {
    it('should go through all items in the list', () => {
      const result: unknown[] = [];
      (
        (
          (root as Record<string, unknown>).children as () => {
            forEach(cb: (item: unknown) => void): void;
          }
        )().forEach
      )((item: unknown) => {
        result.push({ ...(item as { valueOf(): unknown }).valueOf() });
      });
      expect(result).toHaveLength(6);
    });
  });

  describe('reduce()', () => {
    it('should return reduced value', () => {
      const total = (
        (root as { descendants(): { reduce(cb: unknown, init: number): number } })
          .descendants()
          .reduce
      )(
        (acc: unknown, item: unknown) =>
          (acc as number) +
          (item as { valueOf(): { data: { level: number } } }).valueOf().data.level,
        0,
      );
      expect(total).toEqual(72);
    });

    it('should iterate all items when called on a multi-item list', () => {
      const children = ((root as { children(): unknown }).children)();
      const count = (
        children as { reduce(cb: unknown, init: number): number }
      ).reduce((acc: unknown) => (acc as number) + 1, 0);
      expect(count).toEqual(6);
    });
  });
});
