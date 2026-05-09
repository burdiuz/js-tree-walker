import type { Adapter, WalkerUtils } from '../types';

type NodeCallback = (...args: unknown[]) => unknown;

const length = (node: unknown, adapter: Adapter): number => {
  if (adapter.isList(node)) {
    return adapter.getLength(node);
  }
  if (adapter.isNode(node)) {
    return 1;
  }
  return 0;
};

const at = (node: unknown, adapter: Adapter, args: unknown[], utils: WalkerUtils): unknown => {
  const [index = 0] = args;
  let result: unknown;

  if (adapter.isList(node)) {
    const child = adapter.getNodeAt(node, index as number);
    if (child) {
      result = child;
    }
  } else if (!index) {
    result = node;
  }

  return utils.wrap(result ?? [], adapter);
};

const first = (
  node: unknown,
  adapter: Adapter,
  _args: unknown[],
  utils: WalkerUtils,
): unknown => at(node, adapter, [0], utils);

const filter = (
  node: unknown,
  adapter: Adapter,
  [callback]: unknown[],
  utils: WalkerUtils,
): unknown => {
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  const result: unknown[] = [];
  const wrappedNode = utils.wrap(list, adapter);

  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    if ((callback as NodeCallback)(utils.wrap(child, adapter), index, wrappedNode)) {
      result.push(child);
    }
  }

  return utils.wrap(result, adapter);
};

const map = (
  node: unknown,
  adapter: Adapter,
  [callback]: unknown[],
  utils: WalkerUtils,
): unknown[] => {
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  const result: unknown[] = [];
  const wrappedList = utils.wrap(list, adapter);

  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    result.push((callback as NodeCallback)(utils.wrap(child, adapter), index, wrappedList));
  }

  return result;
};

const forEach = (
  node: unknown,
  adapter: Adapter,
  [callback]: unknown[],
  utils: WalkerUtils,
): void => {
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  const wrappedList = utils.wrap(list, adapter);

  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    (callback as NodeCallback)(utils.wrap(child, adapter), index, wrappedList);
  }
};

const reduce = (
  node: unknown,
  adapter: Adapter,
  [callback, result]: unknown[],
  utils: WalkerUtils,
): unknown => {
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  let lastResult = result;
  const wrappedNode = utils.wrap(list, adapter);

  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    lastResult = (callback as NodeCallback)(lastResult, utils.wrap(child, adapter), index, wrappedNode);
  }

  return lastResult;
};

export default { length, at, first, filter, map, forEach, reduce };
