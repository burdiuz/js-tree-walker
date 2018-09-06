import { setDefaultAdapter, getDefaultAdapter } from './default-adapter';
import { setNamePrefix, isValidPrefix } from './prefixes';
import wrap from './wrapper';
import { addAugmentations, resetAugmentations, hasAugmentation } from './augmentations';
import coreAugmentations from './augmentations/core';
import nodeAugmentations from './augmentations/node';
import listAugmentations from './augmentations/list';

addAugmentations(coreAugmentations);

const create = (root, adapter = getDefaultAdapter()) => wrap(adapter.validateRoot(root), adapter);

export {
  setDefaultAdapter,
  getDefaultAdapter,
  addAugmentations,
  hasAugmentation,
  resetAugmentations,
  coreAugmentations,
  nodeAugmentations,
  listAugmentations,
  setNamePrefix,
  isValidPrefix,
  create,
};

export default create;
