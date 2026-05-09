import type { Adapter, AugmentationFunction, AugmentationMap, WalkerUtils } from '../types';
export declare const resetAugmentations: (augs?: AugmentationMap) => void;
export declare const addAugmentations: (augs: AugmentationMap) => void;
export declare const hasAugmentation: (key: unknown) => boolean;
export declare const getAugmentation: (key: string) => AugmentationFunction | undefined;
export declare const applyAugmentation: (key: string, node: unknown, adapter: Adapter, args: unknown[], utils: WalkerUtils) => unknown;
