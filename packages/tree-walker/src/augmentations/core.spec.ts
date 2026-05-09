import { describe, it, expect, beforeEach } from '@jest/globals';
import { create } from '../index';
import { ONode, ONodeAdapter, getSourceTree } from '../../fixtures';

describe('Core augmentations', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  describe('When adapter has methods', () => {
    beforeEach(() => {
      source = getSourceTree();
      root = create(source, {
        ...ONodeAdapter,
        string: () => 'ONode String',
        value: () => 'ONode Value',
      });
    });

    describe('toString()', () => {
      it('should call adapter.string()', () => {
        expect(
          ((root as Record<string, unknown>).first as { toString(): string }).toString(),
        ).toBe('ONode String');
      });
    });

    describe('valueOf()', () => {
      it('should call adapter.value()', () => {
        expect(
          ((root as Record<string, unknown>).first as { valueOf(): unknown }).valueOf(),
        ).toBe('ONode Value');
      });
    });
  });

  describe('When adapter does not have methods', () => {
    beforeEach(() => {
      source = getSourceTree();
      root = create(source, {
        ...ONodeAdapter,
        string: undefined,
        value: undefined,
      });
    });

    describe('toString()', () => {
      it('should call node.toString()', () => {
        expect(
          ((root as Record<string, unknown>).first as { toString(): string }).toString(),
        ).toBe('[ONode name="first" {"level":1}]');
      });
    });

    describe('valueOf()', () => {
      it('should return the node list', () => {
        const result = (
          (root as Record<string, unknown>).first as { valueOf(): unknown[] }
        ).valueOf();
        expect(result[0]).toBeInstanceOf(ONode);
        expect((result[0] as ONode).name).toBe('first');
      });
    });
  });
});
