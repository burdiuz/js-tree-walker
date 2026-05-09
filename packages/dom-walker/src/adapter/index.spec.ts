/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import adapter from './index';

describe('BrowserDOMAdapter', () => {
  let container: HTMLElement;
  let child1: HTMLElement;
  let child2: HTMLElement;
  let grandchild: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    child1 = document.createElement('span');
    child2 = document.createElement('p');
    grandchild = document.createElement('em');

    child1.appendChild(grandchild);
    container.appendChild(child1);
    container.appendChild(child2);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('isList()', () => {
    it('should return true for arrays', () => {
      expect(adapter.isList([container])).toBe(true);
    });

    it('should return true for HTMLCollection', () => {
      expect(adapter.isList(container.children)).toBe(true);
    });

    it('should return true for NodeList', () => {
      expect(adapter.isList(container.querySelectorAll('*'))).toBe(true);
    });

    it('should return false for elements', () => {
      expect(adapter.isList(container)).toBe(false);
    });
  });

  describe('isNode()', () => {
    it('should return true for HTMLElement', () => {
      expect(adapter.isNode(container)).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(adapter.isNode([container])).toBe(false);
    });
  });

  describe('toNode()', () => {
    it('should return element as-is', () => {
      expect(adapter.toNode(container)).toBe(container);
    });

    it('should return first element from list', () => {
      expect(adapter.toNode([child1, child2])).toBe(child1);
    });

    it('should return null for empty list', () => {
      expect(adapter.toNode([])).toBeNull();
    });
  });

  describe('getName()', () => {
    it('should return nodeName', () => {
      expect(adapter.getName(container)).toBe('div');
      expect(adapter.getName(child1)).toBe('span');
    });
  });

  describe('getChildren()', () => {
    it('should return children collection', () => {
      const children = adapter.getChildren(container) as HTMLCollection;
      expect(children.length).toBe(2);
    });

    it('should return empty list for non-element', () => {
      expect(
        (adapter.getChildren(null as unknown as HTMLElement) as HTMLCollection).length,
      ).toBe(0);
    });
  });

  describe('getChildrenByName()', () => {
    it('should return matching children by tag name', () => {
      const spans = adapter.getChildrenByName(container, 'span') as Element[];
      expect(spans).toHaveLength(1);
      expect(spans[0]).toBe(child1);
    });

    it('should be case-insensitive', () => {
      const spans = adapter.getChildrenByName(container, 'SPAN') as Element[];
      expect(spans).toHaveLength(1);
    });

    it('should return empty for non-existent tag', () => {
      expect(adapter.getChildrenByName(container, 'h1')).toHaveLength(0);
    });
  });

  describe('hasChild()', () => {
    it('should return true when child with name exists', () => {
      expect(adapter.hasChild(container, 'SPAN')).toBe(true);
    });

    it('should return false when child does not exist', () => {
      expect(adapter.hasChild(container, 'H1')).toBe(false);
    });
  });

  describe('getChildAt()', () => {
    it('should return child at index', () => {
      expect(adapter.getChildAt(container, 0)).toBe(child1);
      expect(adapter.getChildAt(container, 1)).toBe(child2);
    });
  });

  describe('getNodeParent()', () => {
    it('should return parent element', () => {
      expect(adapter.getNodeParent(child1)).toBe(container);
    });
  });

  describe('getLength()', () => {
    it('should return array length', () => {
      expect(adapter.getLength([child1, child2])).toBe(2);
    });
  });

  describe('getNodeAt()', () => {
    it('should return element at index', () => {
      expect(adapter.getNodeAt([child1, child2], 0)).toBe(child1);
      expect(adapter.getNodeAt([child1, child2], 1)).toBe(child2);
    });
  });

  describe('toList()', () => {
    it('should return array as-is', () => {
      const list = [child1, child2];
      expect(adapter.toList(list)).toBe(list);
    });

    it('should wrap single element in array', () => {
      expect((adapter.toList(container) as Element[])).toHaveLength(1);
    });
  });

  describe('validateRoot()', () => {
    it('should return element as-is', () => {
      expect(adapter.validateRoot(container)).toBe(container);
    });

    it('should return document.firstElementChild for undefined', () => {
      expect(adapter.validateRoot(undefined)).toBe(document.firstElementChild);
    });

    it('should return document.firstElementChild for document', () => {
      expect(adapter.validateRoot(document)).toBe(document.firstElementChild);
    });

    it('should resolve CSS selector string', () => {
      expect(adapter.validateRoot('div')).toBe(container);
    });
  });
});
