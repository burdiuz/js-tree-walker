import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { isIntKey, getValue, getSingleNode, getNodeList } from './utils';
import { ONodeAdapter, getSourceTree } from '../fixtures';

describe('When using utils', () => {
  let source: ReturnType<typeof getSourceTree>;

  beforeEach(() => {
    source = getSourceTree();
  });

  describe('isIntKey()', () => {
    it('should verify integer strings', () => {
      expect(isIntKey(123)).toBe(true);
      expect(isIntKey('123')).toBe(true);
      expect(isIntKey('a123')).toBe(false);
      expect(isIntKey('0xF0')).toBe(false);
      expect(isIntKey('0x12')).toBe(false);
      expect(isIntKey('123a')).toBe(false);
    });
  });

  describe('getValue()', () => {
    describe('When has child name', () => {
      it('should result with child node', () => {
        const result = getValue(source, ONodeAdapter, 'third') as unknown[];
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(
          expect.objectContaining({ name: 'third', data: { level: 1 } }),
        );
      });
    });

    describe('When child name is undefined', () => {
      it('should result with same node', () => {
        expect(getValue(source, ONodeAdapter)).toBe(source);
      });
    });

    describe('When traversing children on a multi-item list', () => {
      let warnSpy: ReturnType<typeof jest.spyOn>;

      beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      });

      afterEach(() => {
        warnSpy.mockRestore();
      });

      it('should warn in non-production environment', () => {
        const list = [source, source];
        getValue(list, ONodeAdapter, 'first');
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('"first"'),
        );
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('2 nodes'),
        );
      });

      it('should not warn when list has a single item', () => {
        const list = [source];
        getValue(list, ONodeAdapter, 'first');
        expect(warnSpy).not.toHaveBeenCalled();
      });

      it('should not warn when node is not a list', () => {
        getValue(source, ONodeAdapter, 'first');
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('getSingleNode()', () => {
    it('should result with child node', () => {
      expect(getSingleNode(source, ONodeAdapter, 'third')).toEqual(
        expect.objectContaining({ name: 'third', data: { level: 1 } }),
      );
    });

    describe('When child name is undefined', () => {
      it('should result with same node', () => {
        expect(getSingleNode(source, ONodeAdapter)).toBe(source);
      });
    });
  });

  describe('getNodeList()', () => {
    it('should result with child nodes list', () => {
      const result = getNodeList(source, ONodeAdapter, 'third') as unknown[];
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({ name: 'third', data: { level: 1 } }),
      );
    });

    describe('When child name is undefined', () => {
      it('should result with one-item list of same node', () => {
        const result = getNodeList(source, ONodeAdapter) as unknown[];
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(source);
      });
    });
  });
});
