import { isIntKey, getValue, getSingleNode, getNodeList } from '../utils';
import { ONodeAdapter, getSourceTree } from '../../fixtures';

describe('When using utils', () => {
  let source;

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
    beforeEach(() => {
      jest.spyOn(ONodeAdapter, 'getChildrenByName');
    });

    afterEach(() => {
      ONodeAdapter.getChildrenByName.mockRestore();
    });

    describe('When has child name', () => {
      it('should result with child node', () => {
        expect(getValue(source, ONodeAdapter, 'third')).toHaveLength(1);
        expect(getValue(source, ONodeAdapter, 'third')[0]).toEqual(
          expect.objectContaining({
            name: 'third',
            data: { level: 1 },
          }),
        );
      });
    });

    describe('When has child name is undefined', () => {
      it('should result with same node', () => {
        expect(getValue(source, ONodeAdapter)).toBe(source);
      });
    });
  });

  describe('getSingleNode()', () => {
    it('should result with child node', () => {
      expect(getSingleNode(source, ONodeAdapter, 'third')).toEqual(
        expect.objectContaining({
          name: 'third',
          data: { level: 1 },
        }),
      );
    });
  });

  describe('When has child name is undefined', () => {
    it('should result with same node', () => {
      expect(getSingleNode(source, ONodeAdapter)).toBe(source);
    });
  });

  describe('getNodeList()', () => {
    it('should result with child nodes list', () => {
      expect(getNodeList(source, ONodeAdapter, 'third')).toHaveLength(1);
      expect(getNodeList(source, ONodeAdapter, 'third')[0]).toEqual(
        expect.objectContaining({
          name: 'third',
          data: { level: 1 },
        }),
      );
    });
  });

  describe('When has child name is undefined', () => {
    it('should result with one-item-list of same node', () => {
      expect(getNodeList(source, ONodeAdapter)).toHaveLength(1);
      expect(getNodeList(source, ONodeAdapter)[0]).toBe(source);
    });
  });
});
