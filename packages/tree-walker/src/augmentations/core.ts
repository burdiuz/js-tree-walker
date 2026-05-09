import type { Adapter } from '../types';

const toString = (node: unknown, adapter: Adapter): string =>
  adapter.string ? adapter.string(node) : String(node);

const valueOf = (node: unknown, adapter: Adapter): unknown =>
  adapter.value ? adapter.value(node) : node;

export default { toString, valueOf };
