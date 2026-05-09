import type { Adapter, WalkerUtils } from '../types';

const name = (node: unknown, adapter: Adapter): string => adapter.getName(node);

const children = (
  node: unknown,
  adapter: Adapter,
  [childName]: unknown[],
  utils: WalkerUtils,
): unknown => {
  const list = childName
    ? adapter.getChildrenByName(node, childName as string)
    : adapter.getChildren(node);
  return utils.wrap(list, adapter);
};

const descendantsAll = (
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
): unknown[] => {
  const directChildren: unknown[] = [];
  const descendants: unknown[] = [];
  const list = adapter.getChildren(node);
  const length = adapter.getLength(list);

  for (let index = 0; index < length; index += 1) {
    const child = adapter.getNodeAt(list, index);
    directChildren.push(child);
    descendants.push(...descendantsAll(child, adapter, args, utils));
  }

  return [...directChildren, ...descendants];
};

const descendantsByName = (
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
): unknown[] => {
  const [childName] = args;
  const matching: unknown[] = [];
  const descendants: unknown[] = [];
  const list = adapter.getChildren(node);
  const length = adapter.getLength(list);

  for (let index = 0; index < length; index += 1) {
    const child = adapter.getNodeAt(list, index);
    if (adapter.getName(child) === childName) {
      matching.push(child);
    }
    descendants.push(...descendantsByName(child, adapter, args, utils));
  }

  return [...matching, ...descendants];
};

const descendants = (
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
): unknown => {
  const [childName] = args;
  if (childName) {
    return utils.wrap(descendantsByName(node, adapter, args, utils), adapter);
  }
  return utils.wrap(descendantsAll(node, adapter, args, utils), adapter);
};

const childAt = (
  node: unknown,
  adapter: Adapter,
  [index = 0]: unknown[],
  utils: WalkerUtils,
): unknown => utils.wrap(adapter.getChildAt(node, index as number), adapter);

const root = (
  node: unknown,
  adapter: Adapter,
  _args: unknown[],
  utils: WalkerUtils,
): unknown => utils.wrap(adapter.getNodeRoot(node), adapter);

const parent = (
  node: unknown,
  adapter: Adapter,
  _args: unknown[],
  utils: WalkerUtils,
): unknown => utils.wrap(adapter.getNodeParent(node), adapter);

export default { name, children, descendants, childAt, root, parent };
