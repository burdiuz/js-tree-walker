import { describe, it, expect } from '@jest/globals';
import createAdapter from './index';

interface TestNode {
  name: string;
  children: TestNode[];
  data?: Record<string, unknown>;
}

const makeNode = (name: string, children: TestNode[] = []): TestNode => ({
  name,
  children,
});

describe('createAdapter()', () => {
  const adapter = createAdapter<TestNode>();

  const leaf = makeNode('leaf');
  const child1 = makeNode('child', [leaf]);
  const child2 = makeNode('child');
  const root = makeNode('root', [child1, child2]);

  describe('validateRoot()', () => {
    it('should return the item as-is', () => {
      expect(adapter.validateRoot(root)).toBe(root);
    });
  });

  describe('isList()', () => {
    it('should return true for arrays', () => {
      expect(adapter.isList([root])).toBe(true);
      expect(adapter.isList([])).toBe(true);
    });

    it('should return false for objects', () => {
      expect(adapter.isList(root)).toBe(false);
    });
  });

  describe('toList()', () => {
    it('should return array as-is', () => {
      const list = [root, child1];
      expect(adapter.toList(list)).toBe(list);
    });

    it('should wrap single node in array', () => {
      expect(adapter.toList(root)).toEqual([root]);
    });
  });

  describe('getLength()', () => {
    it('should return array length', () => {
      expect(adapter.getLength([root, child1])).toBe(2);
    });
  });

  describe('getNodeAt()', () => {
    it('should return node at index', () => {
      expect(adapter.getNodeAt([root, child1], 0)).toBe(root);
      expect(adapter.getNodeAt([root, child1], 1)).toBe(child1);
    });

    it('should default to index 0', () => {
      expect(adapter.getNodeAt([root, child1])).toBe(root);
    });
  });

  describe('isNode()', () => {
    it('should return true for objects', () => {
      expect(adapter.isNode(root)).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(adapter.isNode([root])).toBe(false);
    });
  });

  describe('toNode()', () => {
    it('should return first element of list', () => {
      expect(adapter.toNode([root, child1])).toBe(root);
    });

    it('should return node as-is', () => {
      expect(adapter.toNode(root)).toBe(root);
    });
  });

  describe('getName()', () => {
    it('should return node name', () => {
      expect(adapter.getName(root)).toBe('root');
      expect(adapter.getName(child1)).toBe('child');
    });
  });

  describe('hasChild()', () => {
    it('should return true when child with name exists', () => {
      expect(adapter.hasChild(root, 'child')).toBe(true);
    });

    it('should return false when child with name does not exist', () => {
      expect(adapter.hasChild(root, 'leaf')).toBe(false);
      expect(adapter.hasChild(leaf, 'any')).toBe(false);
    });
  });

  describe('getChildren()', () => {
    it('should return all children', () => {
      expect(adapter.getChildren(root)).toEqual([child1, child2]);
      expect(adapter.getChildren(leaf)).toEqual([]);
    });
  });

  describe('getChildrenByName()', () => {
    it('should return children with matching name', () => {
      expect(adapter.getChildrenByName(root, 'child')).toEqual([child1, child2]);
      expect(adapter.getChildrenByName(root, 'leaf')).toEqual([]);
    });
  });

  describe('getChildAt()', () => {
    it('should return child at index', () => {
      expect(adapter.getChildAt(root, 0)).toBe(child1);
      expect(adapter.getChildAt(root, 1)).toBe(child2);
    });

    it('should default to index 0', () => {
      expect(adapter.getChildAt(root)).toBe(child1);
    });
  });

  describe('getNodeParent()', () => {
    it('should throw error', () => {
      expect(() => adapter.getNodeParent(root)).toThrowError();
    });
  });

  describe('getNodeRoot()', () => {
    it('should throw error', () => {
      expect(() => adapter.getNodeRoot(root)).toThrowError();
    });
  });
});

describe('createAdapter() with custom getters', () => {
  interface CustomNode {
    id: string;
    items: CustomNode[];
  }

  const getNodeName = (node: CustomNode) => node.id;
  const getNodeChildren = (node: CustomNode) => node.items;
  const adapter = createAdapter<CustomNode>(getNodeName, getNodeChildren);

  const leaf: CustomNode = { id: 'leaf', items: [] };
  const parent: CustomNode = { id: 'parent', items: [leaf] };

  it('should use custom name getter', () => {
    expect(adapter.getName(parent)).toBe('parent');
  });

  it('should use custom children getter', () => {
    expect(adapter.getChildren(parent)).toEqual([leaf]);
  });

  it('should use custom children for getChildAt', () => {
    expect(adapter.getChildAt(parent, 0)).toBe(leaf);
  });
});
