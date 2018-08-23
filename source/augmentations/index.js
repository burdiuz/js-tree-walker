import hasOwn from '@actualwave/has-own';

let augmentations = {};

export const resetAugmentations = (augs = {}) => {
  augmentations = augs;
};

export const addAugmentations = (augs) => {
  augmentations = {
    ...augmentations,
    ...augs,
  };
};

export const hasAugmentation = (key) =>
  key && typeof key === 'string' && hasOwn(augmentations, key);

export const getAugmentation = (key) => augmentations[key];

export const applyAugmentation = (key, ...args) => augmentations[key](...args);
