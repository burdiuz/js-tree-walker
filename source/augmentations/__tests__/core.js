import { create } from '../../index';
import { ONode, ONodeAdapter, getSourceTree } from '../../../fixtures';

describe('Core augmentations', () => {
  let source;
  let root;

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
      it('should return unwrapped source node', () => {
        expect(root.first.toString()).toBe('ONode String');
      });
    });

    describe('valueOf()', () => {
      it('should return unwrapped source node', () => {
        expect(root.first.valueOf()).toBe('ONode Value');
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
      it('should return unwrapped source node', () => {
        expect(root.first.toString()).toBe('[ONode name="first" {"level":1}]');
      });
    });

    describe('valueOf()', () => {
      it('should return unwrapped source node', () => {
        expect(root.first.valueOf()[0]).toBeInstanceOf(ONode);
        expect(root.first.valueOf()[0].name).toBe('first');
      });
    });
  });
});
