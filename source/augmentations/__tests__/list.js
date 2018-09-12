import { create, addAugmentations, nodeAugmentations, listAugmentations } from '../../index';
import { ONodeAdapter, getSourceTree, valueOf } from '../../../fixtures';

describe('Node augmentations', () => {
  let source;
  let root;

  addAugmentations(nodeAugmentations);
  addAugmentations(listAugmentations);

  beforeEach(() => {
    source = getSourceTree();
    root = create(source, ONodeAdapter);
  });

  describe('length()', () => {
    it('should result with length of a list', () => {
      expect(root.length()).toBe(1);
      expect(root.children().length()).toBe(6);
      expect(root.first.first.third.length()).toBe(4);
    });
  });

  describe('at()', () => {
    it('should result with single node ot of the list', () => {
      expect(valueOf(root.at(0))).toEqual({
        data: { level: 0 },
        name: '#root',
      });
      expect(valueOf(root.children().at(0))).toEqual({
        data: { level: 1 },
        name: 'first',
      });
      expect(valueOf(root.children().at(5))).toEqual({
        data: { level: 1 },
        name: 'sixth',
      });
      expect(valueOf(root.first.first.third.at(0))).toEqual({
        data: { index: 0, level: 3 },
        name: 'third',
      });
      expect(valueOf(root.first.first.third.at(3))).toEqual({
        data: { index: 3, level: 3 },
        name: 'third',
      });
      expect(valueOf(root.first.first.at(3000))).toEqual([]);
    });
  });

  describe('first()', () => {
    it('should result with first node ot of the list', () => {
      expect(valueOf(root.first())).toEqual({
        data: { level: 0 },
        name: '#root',
      });
      expect(valueOf(root.children().first())).toEqual({
        data: { level: 1 },
        name: 'first',
      });
      expect(valueOf(root.first.first.third.first())).toEqual({
        data: { index: 0, level: 3 },
        name: 'third',
      });
    });
  });

  describe('filter()', () => {
    it('should return filtered list', () => {
      expect(valueOf(root.filter(() => true))).toEqual([{ data: { level: 0 }, name: '#root' }]);

      expect(valueOf(root.filter(() => false))).toEqual([]);

      expect(valueOf(root.descendants().filter((item) => item.valueOf().name === 'third'))).toEqual(
        [
          { data: { level: 1 }, name: 'third' },
          { data: { level: 2 }, name: 'third' },
          { data: { index: 0, level: 3 }, name: 'third' },
          { data: { index: 1, level: 3 }, name: 'third' },
          { data: { index: 2, level: 3 }, name: 'third' },
          { data: { index: 3, level: 3 }, name: 'third' },
          { data: { level: 4 }, name: 'third' },
        ],
      );

      expect(valueOf(root.descendants().filter((item) => item.valueOf().data.level === 3))).toEqual(
        [
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
        ],
      );
    });
  });

  describe('map()', () => {
    it('should return mapped list', () => {
      expect(
        valueOf(
          root.descendants().map((item) => (item.valueOf().data.level === 2 ? item : null)),
        ).map((item) => item && item.valueOf()),
      ).toEqual([
        null,
        null,
        null,
        null,
        null,
        null,
        { name: 'first', data: { level: 2 } },
        { name: 'second', data: { level: 2 } },
        { name: 'third', data: { level: 2 } },
        { name: 'fourth', data: { level: 2 } },
        { name: 'fifth', data: { level: 2 } },
        { name: 'sixth', data: { level: 2 } },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
    });
  });

  describe('forEach()', () => {
    let result;

    beforeEach(() => {
      result = [];
      root.children().forEach((item) => {
        result.push({
          ...item.valueOf(),
          children: null,
        });
      });
    });

    it('should go through all items in the list', () => {
      expect(valueOf(result)).toEqual([
        { name: 'first', data: { level: 1 } },
        { name: 'second', data: { level: 1 } },
        { name: 'third', data: { level: 1 } },
        { name: 'fourth', data: { level: 1 } },
        { name: 'fifth', data: { level: 1 } },
        { name: 'sixth', data: { level: 1 } },
      ]);
    });
  });

  describe('reduce()', () => {
    it('should return reduced value', () => {
      expect(
        root.descendants().reduce((total, item) => total + item.valueOf().data.level, 0),
      ).toEqual(72);
    });
  });
});
