import { setDefaultAdapter, getDefaultAdapter } from './default-adapter';
import { setNamePrefix, isValidPrefix } from './prefixes';
import wrap from './wrapper';
import { addAugmentations, resetAugmentations, hasAugmentation } from './augmentations';
import coreAugmentations from './augmentations/core';
import nodeAugmentations from './augmentations/node';
import listAugmentations from './augmentations/list';
import type { Adapter } from './types';

addAugmentations(coreAugmentations);

const create = (root: unknown, adapter: Adapter = getDefaultAdapter()!): unknown =>
  wrap(adapter.validateRoot(root), adapter);

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

export type { Adapter, AugmentationFunction, AugmentationMap, WalkerUtils, WalkerProxy, PrefixHandlers, PrefixHandlerFunction } from './types';

export default create;
