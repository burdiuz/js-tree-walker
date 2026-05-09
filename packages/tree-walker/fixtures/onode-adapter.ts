import type { Adapter } from '../src/types';
import type { ONode } from './onode';

const adapter: Adapter = {
  validateRoot: (item) => item,

  isList: (item) => item instanceof Array,
  toList: (item) => (adapter.isList(item) ? (item as unknown[]) : [item]),
  getLength: (item) => (adapter.toList(item) as unknown[]).length,
  getNodeAt: (item, index = 0) => (adapter.toList(item) as unknown[])[index],

  isNode: (item) => item instanceof Object && !adapter.isList(item),
  toNode: (item) => (adapter.isList(item) ? (item as unknown[])[0] : item),
  getName: (item) => (adapter.toNode(item) as ONode).name,
  hasChild: (item, name) =>
    !!(adapter.getChildrenByName(item, name) as unknown[]).length,
  getChildren: (item) => {
    const node = adapter.toNode(item) as ONode;
    return (node && node.children) || [];
  },
  getChildrenByName: (item, name) =>
    (adapter.getChildren(item) as ONode[]).filter(
      (child) => adapter.getName(child) === name,
    ),
  getChildAt: (item, index = 0) => (adapter.toNode(item) as ONode).children[index],
  getNodeParent: (item) => (adapter.toNode(item) as ONode).parent,
  getNodeRoot: (item) => (adapter.toNode(item) as ONode).root,
};

export default adapter;
