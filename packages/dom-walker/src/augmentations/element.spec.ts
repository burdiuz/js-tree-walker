/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import elementAugmentations from './element';
import type { Adapter } from '@actualwave/tree-walker';

const mockAdapter: Adapter = {
  validateRoot: (item) => item,
  isList: (item) => item instanceof Array,
  toList: (item) => (item instanceof Array ? (item as unknown[]) : [item]),
  getLength: (list) => (list as unknown[]).length,
  getNodeAt: (list, index = 0) => (list as unknown[])[index],
  isNode: (item) => item instanceof HTMLElement,
  toNode: (item) => (item instanceof Array ? (item as unknown[])[0] : item),
  getName: (node) => (node as Element).nodeName,
  hasChild: () => false,
  getChildren: () => [],
  getChildrenByName: () => [],
  getChildAt: () => undefined,
  getNodeParent: (node) => (node as Element).parentElement,
  getNodeRoot: (node) => (node as Node).getRootNode(),
};

describe('element augmentations', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.setAttribute('data-test', 'value');
    el.setAttribute('class', 'my-class');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  describe('name()', () => {
    it('should return node name', () => {
      expect(elementAugmentations.name(el, mockAdapter)).toBe('DIV');
    });
  });

  describe('text()', () => {
    it('should return element innerText', () => {
      el.innerText = 'hello';
      expect(elementAugmentations.text(el, mockAdapter)).toBe('hello');
    });
  });

  describe('attributes()', () => {
    it('should return NamedNodeMap', () => {
      const attrs = elementAugmentations.attributes(el, mockAdapter) as NamedNodeMap;
      expect(attrs).toBeTruthy();
      expect(attrs.getNamedItem('data-test')?.value).toBe('value');
    });
  });

  describe('attribute()', () => {
    it('should return attribute value', () => {
      expect(elementAugmentations.attribute(el, mockAdapter, ['data-test'])).toBe('value');
    });

    it('should set attribute when value provided', () => {
      elementAugmentations.attribute(el, mockAdapter, ['data-test', 'new-value']);
      expect(el.getAttribute('data-test')).toBe('new-value');
    });

    it('should remove attribute when value is undefined', () => {
      elementAugmentations.attribute(el, mockAdapter, ['data-test', undefined]);
      expect(el.hasAttribute('data-test')).toBe(false);
    });
  });

  describe('parent()', () => {
    it('should return parent element', () => {
      expect(elementAugmentations.parent(el, mockAdapter)).toBe(document.body);
    });
  });

  describe('root()', () => {
    it('should return root node', () => {
      expect(elementAugmentations.root(el, mockAdapter)).toBe(document);
    });
  });

  describe('query()', () => {
    it('should return wrapped query result', () => {
      const inner = document.createElement('span');
      el.appendChild(inner);
      const utils = {
        isIntKey: () => false,
        getValue: () => null,
        getSingleNode: () => null,
        getNodeList: () => [],
        wrap: (node: unknown) => node,
      };
      const result = elementAugmentations.query(el, mockAdapter, ['span'], utils as never);
      expect(result).toBe(inner);
    });

    it('should return empty array for no match', () => {
      const utils = {
        isIntKey: () => false,
        getValue: () => null,
        getSingleNode: () => null,
        getNodeList: () => [],
        wrap: (node: unknown) => node,
      };
      const result = elementAugmentations.query(el, mockAdapter, ['.nonexistent'], utils as never);
      expect(result).toEqual([]);
    });
  });
});
