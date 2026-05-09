/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest } from '@jest/globals';
import eventAugmentations from './event';
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
  getNodeParent: () => undefined,
  getNodeRoot: () => undefined,
};

describe('event augmentations', () => {
  const el = document.createElement('button');

  describe('on()', () => {
    it('should add event listener and return remover', () => {
      const handler = jest.fn();
      const off = eventAugmentations.on(el, mockAdapter, ['click', handler]);

      el.click();
      expect(handler).toHaveBeenCalledTimes(1);

      off();
      el.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('off()', () => {
    it('should remove event listener', () => {
      const handler = jest.fn();
      el.addEventListener('click', handler as EventListener);

      eventAugmentations.off(el, mockAdapter, ['click', handler]);
      el.click();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('emit()', () => {
    it('should dispatch Event instance', () => {
      const handler = jest.fn();
      el.addEventListener('custom', handler as EventListener);

      const event = new Event('custom');
      eventAugmentations.emit(el, mockAdapter, [event]);

      expect(handler).toHaveBeenCalledWith(event);
      el.removeEventListener('custom', handler as EventListener);
    });

    it('should create and dispatch event from string', () => {
      const handler = jest.fn();
      el.addEventListener('testEvent', handler as EventListener);

      eventAugmentations.emit(el, mockAdapter, ['testEvent']);

      expect(handler).toHaveBeenCalledTimes(1);
      el.removeEventListener('testEvent', handler as EventListener);
    });
  });
});
