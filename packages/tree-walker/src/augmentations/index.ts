import type { Adapter, AugmentationFunction, AugmentationMap, WalkerUtils } from '../types';

let augmentations: AugmentationMap = {};

export const resetAugmentations = (augs: AugmentationMap = {}): void => {
  augmentations = augs;
};

export const addAugmentations = (augs: AugmentationMap): void => {
  augmentations = {
    ...augmentations,
    ...augs,
  };
};

export const hasAugmentation = (key: unknown): boolean =>
  !!key && typeof key === 'string' && Object.hasOwn(augmentations, key);

export const getAugmentation = (key: string): AugmentationFunction | undefined =>
  augmentations[key];

export const applyAugmentation = (
  key: string,
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
): unknown => augmentations[key](node, adapter, args, utils);
