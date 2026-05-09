import type { Adapter, WalkerUtils } from '../types';
declare const _default: {
    length: (node: unknown, adapter: Adapter) => number;
    at: (node: unknown, adapter: Adapter, args: unknown[], utils: WalkerUtils) => unknown;
    first: (node: unknown, adapter: Adapter, _args: unknown[], utils: WalkerUtils) => unknown;
    filter: (node: unknown, adapter: Adapter, [callback]: unknown[], utils: WalkerUtils) => unknown;
    map: (node: unknown, adapter: Adapter, [callback]: unknown[], utils: WalkerUtils) => unknown[];
    forEach: (node: unknown, adapter: Adapter, [callback]: unknown[], utils: WalkerUtils) => void;
    reduce: (node: unknown, adapter: Adapter, [callback, result]: unknown[], utils: WalkerUtils) => unknown;
};
export default _default;
