import type { Adapter } from './types';

export const isIntKey = (key: unknown): boolean =>
  (typeof key === 'number' && key >>> 0 === key) || `${parseInt(String(key), 10)}` === key;

export const getValue = (node: unknown, adapter: Adapter, childName?: string): unknown => {
  if (childName !== undefined) {
    if (
      (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') &&
      adapter.isList(node) &&
      adapter.getLength(node) > 1
    ) {
      console.warn(
        `TreeWalker: accessing "${childName}" children from a list of ${adapter.getLength(node)} nodes; only the first node is traversed. Use an index to select a specific node.`,
      );
    }
    return adapter.getChildrenByName(node, childName);
  }
  return node;
};

export const getSingleNode = (node: unknown, adapter: Adapter, childName?: string): unknown =>
  adapter.toNode(getValue(node, adapter, childName));

export const getNodeList = (node: unknown, adapter: Adapter, childName?: string): unknown =>
  adapter.toList(getValue(node, adapter, childName));
