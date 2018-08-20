import { create } from '../../index';
import { ONode, ONodeAdapter, getSourceTree } from '../../../fixtures';

describe('Core augmentations', () => {
  let source;
  let root;

  beforeEach(() => {
    source = getSourceTree();
    root = create(source, ONodeAdapter);
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
