import { create, addAugmentations, nodeAugmentations } from '../../index';
import { ONodeAdapter, getSourceTree, valueOf } from '../../../fixtures';

describe('Node augmentations', () => {
  let source;
  let root;

  addAugmentations(nodeAugmentations);

  beforeEach(() => {
    source = getSourceTree();
    root = create(source, ONodeAdapter);
  });

  describe('children()', () => {
    it('should result with direct children of the node', () => {
      expect(valueOf(root.children())).toEqual([
        { name: 'first', data: { level: 1 } },
        { name: 'second', data: { level: 1 } },
        { name: 'third', data: { level: 1 } },
        { name: 'fourth', data: { level: 1 } },
        { name: 'fifth', data: { level: 1 } },
        { name: 'sixth', data: { level: 1 } },
      ]);

      expect(valueOf(root.first.first.children())).toEqual([
        { name: 'first', data: { level: 3 } },
        { name: 'second', data: { level: 3 } },
        { name: 'third', data: { index: 0, level: 3 } },
        { name: 'third', data: { index: 1, level: 3 } },
        { name: 'third', data: { index: 2, level: 3 } },
        { name: 'third', data: { index: 3, level: 3 } },
        { name: 'fourth', data: { level: 3 } },
        {
          name: 'uniqueName',
          data: { uniqueParam: '123-456', level: 3 },
        },
        { name: 'fifth', data: { level: 3 } },
        { name: 'sixth', data: { level: 3 } },
      ]);

      expect(valueOf(root.second.children())).toEqual([]);
    });

    describe('When name provided', () => {
      it('should return children by name', () => {
        expect(valueOf(root.children('second'))).toEqual([
          { name: 'second', data: { level: 1 } },
        ]);

        expect(valueOf(root.children('unknown'))).toEqual([]);

        expect(valueOf(root.first.first.children('third'))).toEqual([
          { name: 'third', data: { index: 0, level: 3 } },
          { name: 'third', data: { index: 1, level: 3 } },
          { name: 'third', data: { index: 2, level: 3 } },
          { name: 'third', data: { index: 3, level: 3 } },
        ]);
      });
    });
  });

  describe('descendants()', () => {
    it('should result with all descendants of the node', () => {
      expect(valueOf(root.first.first.descendants())).toEqual([
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

      expect(valueOf(root.first.first.first.descendants())).toEqual([
        { name: 'first', data: { level: 4 } },
        { name: 'second', data: { level: 4 } },
        { name: 'third', data: { level: 4 } },
        { name: 'fourth', data: { level: 4 } },
        { name: 'fifth', data: { level: 4 } },
        { name: 'sixth', data: { level: 4 } },
      ]);

      expect(valueOf(root.first.first.third.descendants())).toEqual([]);

      expect(valueOf(root.second.descendants())).toEqual([]);
    });

    describe('When name provided', () => {
      it('should return children by name', () => {
        expect(valueOf(root.descendants('second'))).toEqual([
          { data: { level: 1 }, name: 'second' },
          { data: { level: 2 }, name: 'second' },
          { data: { level: 3 }, name: 'second' },
          { data: { level: 4 }, name: 'second' },
        ]);

        expect(valueOf(root.descendants('unknown'))).toEqual([]);

        expect(valueOf(root.first.first.descendants('third'))).toEqual([
          { data: { index: 0, level: 3 }, name: 'third' },
          { data: { index: 1, level: 3 }, name: 'third' },
          { data: { index: 2, level: 3 }, name: 'third' },
          { data: { index: 3, level: 3 }, name: 'third' },
          { data: { level: 4 }, name: 'third' },
        ]);
      });
    });
  });

  describe('childAt()', () => {
    it('should return child by index', () => {
      expect(valueOf(root.childAt(0))).toEqual({
        name: 'first',
        data: { level: 1 },
      });
      expect(valueOf(root.childAt(3))).toEqual({
        name: 'fourth',
        data: { level: 1 },
      });
      expect(valueOf(root.first.first.first.childAt(5))).toEqual({
        name: 'sixth',
        data: { level: 4 },
      });
    });
  });

  describe('root()', () => {
    it('should result with parent node', () => {
      expect(root.root().valueOf()).toBe(source);
      expect(root.first.root().valueOf()).toBe(source);
      expect(root.first.first.root().valueOf()).toBe(source);
    });
  });

  describe('parent()', () => {
    it('should result with parent node', () => {
      expect(root.parent()).toBeUndefined();
      expect(root.first.parent().valueOf()).toBe(source);
      expect(root.first.first.parent().valueOf()).toBe(source.children[0]);
    });
  });
});
