import { describe, it, expect } from '@jest/globals';
import { createHandlers, createROHandlers } from './index';
import type { Adapter } from '../types';

const mockAdapter: Adapter = {
  validateRoot: (item) => item,
  isList: (item) => item instanceof Array,
  toList: (item) => (item instanceof Array ? (item as unknown[]) : [item]),
  getLength: (list) => (list as unknown[]).length,
  getNodeAt: (list, index = 0) => (list as unknown[])[index],
  isNode: (item) => item instanceof Object && !(item instanceof Array),
  toNode: (item) => (item instanceof Array ? (item as unknown[])[0] : item),
  getName: () => '',
  hasChild: () => false,
  getChildren: () => [],
  getChildrenByName: () => [],
  getChildAt: () => undefined,
  getNodeParent: () => undefined,
  getNodeRoot: () => undefined,
};

describe('createROHandlers()', () => {
  describe('With default data getter', () => {
    const handlers = createROHandlers();
    const node = { level: 1, name: 'test' };

    it('get handler should return property value', () => {
      expect(handlers.get!(node, mockAdapter, ['level'], {} as never)).toBe(1);
      expect(handlers.get!(node, mockAdapter, ['name'], {} as never)).toBe('test');
      expect(handlers.get!(node, mockAdapter, ['missing'], {} as never)).toBeUndefined();
    });

    it('has handler should check property existence', () => {
      expect(handlers.has!(node, mockAdapter, ['level'], {} as never)).toBe(true);
      expect(handlers.has!(node, mockAdapter, ['missing'], {} as never)).toBe(false);
    });

    it('should not have set handler', () => {
      expect(handlers.set).toBeUndefined();
    });

    it('should not have deleteProperty handler', () => {
      expect(handlers.deleteProperty).toBeUndefined();
    });
  });

  describe('With custom data getter', () => {
    const handlers = createROHandlers((node) => (node as { data: Record<string, unknown> }).data);
    const node = { data: { level: 2, name: 'custom' } };

    it('get handler should return nested property', () => {
      expect(handlers.get!(node, mockAdapter, ['level'], {} as never)).toBe(2);
    });

    it('has handler should check nested property', () => {
      expect(handlers.has!(node, mockAdapter, ['level'], {} as never)).toBe(true);
      expect(handlers.has!(node, mockAdapter, ['missing'], {} as never)).toBe(false);
    });
  });
});

describe('createHandlers()', () => {
  describe('With default data getter', () => {
    const handlers = createHandlers();
    const node: Record<string, unknown> = { level: 1, name: 'test' };

    it('should include get and has from createROHandlers', () => {
      expect(handlers.get).toBeDefined();
      expect(handlers.has).toBeDefined();
    });

    it('set handler should update property value', () => {
      const testNode = { level: 1 };
      expect(handlers.set!(testNode, mockAdapter, ['level', 99], {} as never)).toBe(true);
      expect(testNode.level).toBe(99);
    });

    it('set handler should add new property', () => {
      const testNode: Record<string, unknown> = {};
      handlers.set!(testNode, mockAdapter, ['newProp', 'hello'], {} as never);
      expect(testNode.newProp).toBe('hello');
    });

    it('set handler should return false for null data', () => {
      const handlers2 = createHandlers(() => undefined);
      expect(handlers2.set!(node, mockAdapter, ['level', 99], {} as never)).toBe(false);
    });

    it('deleteProperty handler should delete property', () => {
      const testNode: Record<string, unknown> = { level: 1, name: 'test' };
      expect(
        handlers.deleteProperty!(testNode, mockAdapter, ['level'], {} as never),
      ).toBe(true);
      expect(testNode.level).toBeUndefined();
    });

    it('deleteProperty handler should return false for null data', () => {
      const handlers2 = createHandlers(() => undefined);
      expect(handlers2.deleteProperty!(node, mockAdapter, ['level'], {} as never)).toBe(false);
    });
  });
});
