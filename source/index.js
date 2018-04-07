import { setDefaultAdapter, getDefaultAdapter } from './default-adapter';
import { setNamePrefix, isValidPrefix } from './prefixes';
import wrapWithProxy from './wrapper';
import { addAugmentations, resetAugmentations, hasAugmentation } from './augmentations';
import coreAugmentations from './augmentations/core';

addAugmentations(coreAugmentations);

const create = (root, adapter = getDefaultAdapter()) =>
  wrapWithProxy(adapter.validateRoot(root), adapter);

export {
  setDefaultAdapter,
  getDefaultAdapter,

  addAugmentations,
  hasAugmentation,
  resetAugmentations,
  coreAugmentations,

  setNamePrefix,
  isValidPrefix,

  create,
};

export default create;
