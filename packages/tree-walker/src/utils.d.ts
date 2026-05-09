import type { Adapter } from './types';
export declare const isIntKey: (key: unknown) => boolean;
export declare const getValue: (node: unknown, adapter: Adapter, childName?: string) => unknown;
export declare const getSingleNode: (node: unknown, adapter: Adapter, childName?: string) => unknown;
export declare const getNodeList: (node: unknown, adapter: Adapter, childName?: string) => unknown;
