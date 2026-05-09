import type { Adapter } from '../types';

export type GetNodeName<TNode> = (node: TNode) => string;
export type GetNodeChildren<TNode> = (node: TNode) => TNode[];

export const defaultGetNodeName = <TNode extends { name: string }>(node: TNode): string =>
  node.name;

export const defaultGetNodeChildren = <TNode extends { children: TNode[] }>(
  node: TNode,
): TNode[] => node.children;

const createAdapter = <TNode extends object>(
  getNodeName: GetNodeName<TNode> = defaultGetNodeName as GetNodeName<TNode>,
  getNodeChildren: GetNodeChildren<TNode> = defaultGetNodeChildren as GetNodeChildren<TNode>,
): Adapter => {
  const adapter: Adapter = {
    validateRoot: (item) => item,

    isList: (item) => item instanceof Array,
    toList: (item) => (adapter.isList(item) ? (item as unknown[]) : [item]),
    getLength: (item) => (adapter.toList(item) as unknown[]).length,
    getNodeAt: (item, index = 0) => (adapter.toList(item) as unknown[])[index],

    isNode: (item) => item instanceof Object && !adapter.isList(item),
    toNode: (item) => (adapter.isList(item) ? (item as unknown[])[0] : item),
    getName: (item) => {
      const node = adapter.toNode(item) as TNode | null;
      return node ? getNodeName(node) : '';
    },
    hasChild: (item, name) =>
      !!(adapter.getChildrenByName(item, name) as unknown[]).length,
    getChildren: (item) => {
      const node = adapter.toNode(item) as TNode | null;
      return (node && getNodeChildren(node)) || [];
    },
    getChildrenByName: (item, name) =>
      (adapter.getChildren(item) as TNode[]).filter(
        (child) => adapter.getName(child) === name,
      ),
    getChildAt: (item, index = 0) =>
      (getNodeChildren(adapter.toNode(item) as TNode) || [])[index],
    getNodeParent: () => {
      throw new Error('adapter.getNodeParent() is not implemented.');
    },
    getNodeRoot: () => {
      throw new Error('adapter.getNodeRoot() is not implemented.');
    },
  };

  return adapter;
};

export default createAdapter;
