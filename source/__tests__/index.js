/* eslint-disable global-require */
import { create } from '../index';
import { ONodeAdapter, getSourceTree } from '../../fixtures';

describe('When initialized', () => {
  let addAugs;
  let coreAugs;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../augmentations/core', () => ({
      type: 'core-augmentations',
    }));
    jest.doMock('../augmentations', () => ({
      addAugmentations: jest.fn(),
      resetAugmentations: jest.fn(),
    }));

    coreAugs = require('../augmentations/core');
    ({ addAugmentations: addAugs } = require('../augmentations'));
    require('../index');
  });

  it('should add core augmentations', () => {
    expect(addAugs).toHaveBeenCalledTimes(1);
    expect(addAugs).toHaveBeenCalledWith(coreAugs);
  });
});

describe('create()', () => {
  let source;
  let root;

  beforeEach(() => {
    source = getSourceTree();
    jest.spyOn(ONodeAdapter, 'validateRoot');
    root = create(source, ONodeAdapter);
  });

  afterEach(() => {
    ONodeAdapter.validateRoot.mockRestore();
  });

  it('should validate root node', () => {
    expect(ONodeAdapter.validateRoot).toHaveBeenCalledTimes(1);
    expect(ONodeAdapter.validateRoot).toHaveBeenCalledWith(source);
  });

  it('should result with wrapped root node', () => {
    expect(root.first.first.uniqueName.valueOf()).toEqual([
      expect.objectContaining({
        name: 'uniqueName',
        data: { uniqueParam: '123-456', level: 3 },
      }),
    ]);
  });
});
