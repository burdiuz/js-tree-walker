import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create } from './index';
import { ONodeAdapter, getSourceTree } from '../fixtures';

describe('When initialized', () => {
  let addAugs: jest.Mock;
  let coreAugs: unknown;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('./augmentations/core', () => ({ type: 'core-augmentations' }));
    jest.doMock('./augmentations', () => ({
      addAugmentations: jest.fn(),
      resetAugmentations: jest.fn(),
    }));

    coreAugs = require('./augmentations/core');
    ({ addAugmentations: addAugs } = require('./augmentations') as {
      addAugmentations: jest.Mock;
    });
    require('./index');
  });

  it('should add core augmentations', () => {
    expect(addAugs).toHaveBeenCalledTimes(1);
    expect(addAugs).toHaveBeenCalledWith(coreAugs);
  });
});

describe('create()', () => {
  let source: ReturnType<typeof getSourceTree>;
  let root: unknown;

  beforeEach(() => {
    source = getSourceTree();
    jest.spyOn(ONodeAdapter, 'validateRoot');
    root = create(source, ONodeAdapter);
  });

  afterEach(() => {
    (ONodeAdapter.validateRoot as jest.Mock).mockRestore();
  });

  it('should validate root node', () => {
    expect(ONodeAdapter.validateRoot).toHaveBeenCalledTimes(1);
    expect(ONodeAdapter.validateRoot).toHaveBeenCalledWith(source);
  });

  it('should result with wrapped root node', () => {
    const result = (
      (root as Record<string, unknown>).first as Record<string, unknown>
    ).first as Record<string, unknown>;
    expect((result.uniqueName as { valueOf(): unknown }).valueOf()).toEqual([
      expect.objectContaining({
        name: 'uniqueName',
        data: { uniqueParam: '123-456', level: 3 },
      }),
    ]);
  });
});
