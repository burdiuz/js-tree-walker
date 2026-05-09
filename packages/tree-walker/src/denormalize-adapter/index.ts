import type { Adapter } from '../types';

export type Store = Record<string, unknown>;
export type GetStore = () => Store;

const defaults: Partial<Adapter> = {
  validateRoot: (item) => item,

  isList: (item) => item instanceof Array,
  isNode: (item) => typeof item === 'string',
  getName: (item) => item as string,

  getNodeParent: () => {
    throw new Error('adapter.getNodeParent() is not implemented.');
  },
  getNodeRoot: () => {
    throw new Error('adapter.getNodeRoot() is not implemented.');
  },

  string: (item) => item as string,
};

export const createAdapter = (getStore: GetStore): Adapter => {
  const adapter: Adapter = {
    ...(defaults as Adapter),

    toList: (item) => (adapter.isList(item) ? (item as unknown[]) : [item]),
    getLength: (item) => (adapter.toList(item) as unknown[]).length,
    getNodeAt: (item, index = 0) => (adapter.toList(item) as unknown[])[index],

    toNode: (item) => (adapter.isList(item) ? (item as unknown[])[0] : item),

    hasChild: (item, name) =>
      !!(adapter.getChildrenByName(item, name) as unknown[]).length,

    getChildren: (item) => {
      const node = adapter.value!(item) as { children?: unknown[] } | undefined;
      if (!node || !node.children) return [];
      return node.children;
    },

    getChildrenByName: (item, name) =>
      (adapter.getChildren(item) as unknown[]).filter(
        (child) => adapter.getName(child) === name.toLowerCase(),
      ),

    getChildAt: (item, index = 0) =>
      (adapter.getChildren(item) as unknown[])[index],

    value: (item) => getStore()[item as string],
  };

  return adapter;
};
