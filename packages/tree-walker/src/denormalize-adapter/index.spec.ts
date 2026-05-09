import { describe, it, expect, beforeEach } from '@jest/globals';
import { createAdapter } from './index';

interface StoreNode {
  id: string;
  children?: string[];
}

describe('createAdapter()', () => {
  const store: Record<string, StoreNode> = {
    root: { id: 'root', children: ['child1', 'child2'] },
    child1: { id: 'child1', children: ['grandchild'] },
    child2: { id: 'child2' },
    grandchild: { id: 'grandchild' },
  };

  const adapter = createAdapter(() => store as Record<string, unknown>);

  describe('validateRoot()', () => {
    it('should return item as-is', () => {
      expect(adapter.validateRoot('root')).toBe('root');
    });
  });

  describe('isList()', () => {
    it('should return true for arrays', () => {
      expect(adapter.isList(['root', 'child1'])).toBe(true);
      expect(adapter.isList([])).toBe(true);
    });

    it('should return false for strings', () => {
      expect(adapter.isList('root')).toBe(false);
    });
  });

  describe('isNode()', () => {
    it('should return true for strings (node IDs)', () => {
      expect(adapter.isNode('root')).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(adapter.isNode(['root'])).toBe(false);
    });
  });

  describe('getName()', () => {
    it('should return the string item itself', () => {
      expect(adapter.getName('root')).toBe('root');
    });
  });

  describe('toList()', () => {
    it('should return array as-is', () => {
      const list = ['root', 'child1'];
      expect(adapter.toList(list)).toBe(list);
    });

    it('should wrap single item in array', () => {
      expect(adapter.toList('root')).toEqual(['root']);
    });
  });

  describe('toNode()', () => {
    it('should return first element for list', () => {
      expect(adapter.toNode(['root', 'child1'])).toBe('root');
    });

    it('should return item as-is for single node', () => {
      expect(adapter.toNode('root')).toBe('root');
    });
  });

  describe('value()', () => {
    it('should return the store entry for node ID', () => {
      expect(adapter.value!('root')).toEqual({ id: 'root', children: ['child1', 'child2'] });
    });

    it('should return undefined for unknown ID', () => {
      expect(adapter.value!('unknown')).toBeUndefined();
    });
  });

  describe('getChildren()', () => {
    it('should return children IDs from store', () => {
      expect(adapter.getChildren('root')).toEqual(['child1', 'child2']);
    });

    it('should return empty array for leaf node', () => {
      expect(adapter.getChildren('child2')).toEqual([]);
    });

    it('should return empty array for unknown node', () => {
      expect(adapter.getChildren('unknown')).toEqual([]);
    });
  });

  describe('getChildrenByName()', () => {
    it('should return children matching name (case insensitive)', () => {
      expect(adapter.getChildrenByName('root', 'child1')).toEqual(['child1']);
      expect(adapter.getChildrenByName('root', 'CHILD1')).toEqual(['child1']);
    });

    it('should return empty for non-matching name', () => {
      expect(adapter.getChildrenByName('root', 'unknown')).toEqual([]);
    });
  });

  describe('hasChild()', () => {
    it('should return true when named child exists', () => {
      expect(adapter.hasChild('root', 'child1')).toBe(true);
    });

    it('should return false when named child does not exist', () => {
      expect(adapter.hasChild('root', 'unknown')).toBe(false);
    });
  });

  describe('getChildAt()', () => {
    it('should return child at index', () => {
      expect(adapter.getChildAt('root', 0)).toBe('child1');
      expect(adapter.getChildAt('root', 1)).toBe('child2');
    });

    it('should default to index 0', () => {
      expect(adapter.getChildAt('root')).toBe('child1');
    });
  });

  describe('getLength()', () => {
    it('should return array length', () => {
      expect(adapter.getLength(['root', 'child1'])).toBe(2);
    });
  });

  describe('getNodeParent()', () => {
    it('should throw error', () => {
      expect(() => adapter.getNodeParent('root')).toThrowError();
    });
  });

  describe('getNodeRoot()', () => {
    it('should throw error', () => {
      expect(() => adapter.getNodeRoot('root')).toThrowError();
    });
  });
});
