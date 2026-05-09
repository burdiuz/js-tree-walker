import type { Adapter, WalkerUtils } from '../types';
declare const _default: {
    name: (node: unknown, adapter: Adapter) => string;
    children: (node: unknown, adapter: Adapter, [childName]: unknown[], utils: WalkerUtils) => unknown;
    descendants: (node: unknown, adapter: Adapter, args: unknown[], utils: WalkerUtils) => unknown;
    childAt: (node: unknown, adapter: Adapter, [index]: unknown[], utils: WalkerUtils) => unknown;
    root: (node: unknown, adapter: Adapter, _args: unknown[], utils: WalkerUtils) => unknown;
    parent: (node: unknown, adapter: Adapter, _args: unknown[], utils: WalkerUtils) => unknown;
};
export default _default;
