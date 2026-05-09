import { isIntKey, getValue, getSingleNode, getNodeList } from './utils';

import {
  GET_KEY,
  HAS_KEY,
  SET_KEY,
  DELETE_KEY,
  getPrefix,
  isPrefixedKey,
  getPrefixGetHandler,
  getPrefixHasHandler,
  getPrefixSetHandler,
  getPrefixDeleteHandler,
} from './prefixes';

import { hasAugmentation, applyAugmentation } from './augmentations';
import type { Adapter, WalkerUtils } from './types';

interface TreeWalkerTarget {
  (): never;
  node: unknown;
  childName: string | undefined;
  adapter: Adapter;
}

const handlers = {} as ProxyHandler<TreeWalkerTarget>;
const utils = {} as WalkerUtils;

const GET_RESTRICTED_NAMES: Record<string, boolean> = {
  constructor: true,
  prototype: true,
};

const createWalkerNode = (
  node: unknown,
  adapter: Adapter,
  childName?: string,
): TreeWalkerTarget => {
  function TreeWalker(): never {
    throw new Error('Should have been never called');
  }

  (TreeWalker as unknown as TreeWalkerTarget).node = node;
  (TreeWalker as unknown as TreeWalkerTarget).childName = childName;
  (TreeWalker as unknown as TreeWalkerTarget).adapter = adapter;
  return TreeWalker as unknown as TreeWalkerTarget;
};

const wrap = (node: unknown, adapter: Adapter, childName?: string): unknown => {
  if (!adapter.isNode(node) && !adapter.isList(node)) {
    return node;
  }

  return new Proxy(createWalkerNode(node, adapter, childName), handlers);
};

utils.isIntKey = isIntKey;
utils.getValue = getValue;
utils.getSingleNode = getSingleNode;
utils.getNodeList = getNodeList;
utils.wrap = wrap;

const throwHandlerNotAvailable = (
  operation: string,
  key: string,
  handler: unknown,
): void => {
  if (!handler) {
    throw new Error(`Operation "${operation}" is not supported for prefix "${getPrefix(key)}".`);
  }
};

const get = (
  { node, adapter, childName }: TreeWalkerTarget,
  key: string | symbol,
): unknown => {
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key as string] === true) {
    return (getSingleNode(node, adapter, childName) as Record<string | symbol, unknown>)[key];
  }

  if (isIntKey(key)) {
    return wrap(adapter.getNodeAt(getNodeList(node, adapter, childName) as unknown[], Number(key)), adapter);
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixGetHandler(key as string);
    throwHandlerNotAvailable(GET_KEY, key as string, handler);
    return handler!(getValue(node, adapter, childName), adapter, [(key as string).slice(1)], utils);
  }

  const result = getValue(node, adapter, childName);
  return wrap(result, adapter, key as string);
};

const has = (
  { node, adapter, childName }: TreeWalkerTarget,
  key: string | symbol,
): boolean => {
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key as string] === true) {
    return key in (getSingleNode(node, adapter, childName) as object);
  }

  if (isIntKey(key)) {
    return !!adapter.getNodeAt(getNodeList(node, adapter, childName) as unknown[], Number(key));
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixHasHandler(key as string);
    throwHandlerNotAvailable(HAS_KEY, key as string, handler);
    return !!handler!(getValue(node, adapter, childName), adapter, [(key as string).slice(1)], utils);
  }

  return adapter.hasChild(getSingleNode(node, adapter, childName), key as string);
};

const apply = (
  { node, adapter, childName }: TreeWalkerTarget,
  _thisArg: unknown,
  argumentsList: unknown[],
): unknown => {
  if (childName === undefined) {
    throw new Error('Cannot call on TreeWalker Node');
  }

  if (hasAugmentation(childName)) {
    return applyAugmentation(childName, node, adapter, argumentsList, utils);
  }

  const targetNode = adapter.toNode(node);
  if (typeof (targetNode as Record<string, unknown>)[childName] === 'function') {
    const result = ((targetNode as Record<string, unknown>)[childName] as (...args: unknown[]) => unknown)(
      ...argumentsList,
    );
    return utils.wrap(result, adapter);
  }

  throw new Error(`"${childName}" is not a callable object.`);
};

const set = (
  { node, adapter, childName }: TreeWalkerTarget,
  key: string | symbol,
  value: unknown,
): boolean => {
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key as string] === true) {
    (getSingleNode(node, adapter, childName) as Record<string | symbol, unknown>)[key] = value;
    return true;
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixSetHandler(key as string);
    throwHandlerNotAvailable(SET_KEY, key as string, handler);
    return !!handler!(
      getValue(node, adapter, childName),
      adapter,
      [(key as string).slice(1), value],
      utils,
    );
  }

  throw new Error(`Operation "${SET_KEY}" is not supported for nodes.`);
};

const deleteProperty = (
  { node, adapter, childName }: TreeWalkerTarget,
  key: string | symbol,
): boolean => {
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key as string] === true) {
    return delete (getSingleNode(node, adapter, childName) as Record<string | symbol, unknown>)[key];
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixDeleteHandler(key as string);
    throwHandlerNotAvailable(DELETE_KEY, key as string, handler);
    return !!handler!(
      getValue(node, adapter, childName),
      adapter,
      [(key as string).slice(1)],
      utils,
    );
  }

  throw new Error(`Operation "${DELETE_KEY}" is not supported for nodes.`);
};

handlers.get = get;
handlers.has = has;
handlers.apply = apply;
handlers.set = set;
handlers.deleteProperty = deleteProperty;

export default wrap;
