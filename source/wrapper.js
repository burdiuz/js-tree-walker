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

let handlers;
let utils;

const GET_RESTRICTED_NAMES = {
  constructor: true,
  prototype: true,
  /*
  call: true,
  apply: true,
  */
};

const createWalkerNode = (node, adapter, childName = undefined) => {
  function TreeWalker() {
    throw new Error('Should have been never called');
  }

  // can be single Node and NodeList with length >= 0
  // should it be always NodeList?
  TreeWalker.node = node;
  // childName always String/Symbol, Number's are being handled in proxy get wrapper
  // INFO "name" is RO property of Function object
  TreeWalker.childName = childName;
  TreeWalker.adapter = adapter;
  return TreeWalker;
};

const wrap = (node, adapter, childName = undefined) => {
  if (!adapter.isNode(node) && !adapter.isList(node)) {
    return node;
  }

  return new Proxy(createWalkerNode(node, adapter, childName), handlers);
};

// eslint-disable-next-line
utils = {
  isIntKey,
  getValue,
  getSingleNode,
  getNodeList,
  wrap,
};

const throwHandlerNotAvailable = (operation, key, handler) => {
  if (!handler) {
    throw new Error(`Operation "${operation}" is not supported for prefix "${getPrefix(key)}".`);
  }
};

const get = ({ node, adapter, childName }, key) => {
  /*
   if symbol, return node property
   if string childName used
   if starts with prefix, call GET handler
   else return wrapper with current single node and property childName
   if numeric index used, use node as parent and childName is undefined
   */
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key] === true) {
    return getSingleNode(node, adapter, childName)[key];
  }

  if (isIntKey(key)) {
    return wrap(adapter.getNodeAt(getNodeList(node, adapter, childName), key), adapter);
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixGetHandler(key);

    throwHandlerNotAvailable(GET_KEY, key, handler);

    return handler(getValue(node, adapter, childName), adapter, [key.substr(1)], utils);
  }

  const result = getValue(node, adapter, childName);

  // return wrap with node and childName
  return wrap(result, adapter, key);
};

const has = ({ node, adapter, childName }, key) => {
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key] === true) {
    return key in getSingleNode(node, adapter, childName);
  }

  if (isIntKey(key)) {
    return !!adapter.getNodeAt(getNodeList(node, adapter, childName), key);
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixHasHandler(key);

    throwHandlerNotAvailable(HAS_KEY, key, handler);

    return handler(getValue(node, adapter, childName), adapter, [key.substr(1)], utils);
  }

  return adapter.hasChild(getSingleNode(node, adapter, childName), key);
};

const apply = ({ node, adapter, childName }, thisArg, argumentsList) => {
  if (childName === undefined) {
    throw new Error('Cannot call on TreeWalker Node');
  }

  /* GET always return result of prefixed property, means there are
     no cases when we get a wrapped node to APPLY trap with prefixed name.

  if (isValidPrefix(childName)) {
    const handler = getPrefixApplyHandler(childName);

    throwHandlerNotAvailable(APPLY_KEY, childName, handler);

    return handler(
      node,
      adapter,
      [childName.substr(1), ...argumentsList],
      utils,
    );
  }
  */

  if (hasAugmentation(childName)) {
    // INFO cannot use target because it contains method's childName, not Node childName
    // call the function with saving context, so other augmentations are accessible via "this"
    return applyAugmentation(childName, node, adapter, argumentsList, utils);
  }

  // in case of normal function being called out of the tree node
  const targetNode = adapter.toNode(node);
  if (typeof targetNode[childName] === 'function') {
    return targetNode[childName](...argumentsList);
  }

  // FIXME might throw only in dev mode(needs implementation)
  throw new Error(`"${childName}" is not a callable object.`);
};

const set = ({ node, adapter, childName }, key, value) => {
  /*
   if symbol, set value directly
   if starts with prefix, call SET handler
   else throw an error
   */
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key] === true) {
    getSingleNode(node, adapter, childName)[key] = value;
    return true;
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixSetHandler(key);

    throwHandlerNotAvailable(SET_KEY, key, handler);

    return handler(getValue(node, adapter, childName), adapter, [key.substr(1), value], utils);
  }

  throw new Error(`Operation "${SET_KEY}" is not supported for nodes.`);
};

const deleteProperty = ({ node, adapter, childName }, key) => {
  /*
   if symbol, delete value directly
   if starts with prefix, call DELETE handler
   else throw an error
   */
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key] === true) {
    return delete getSingleNode(node, adapter, childName)[key];
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixDeleteHandler(key);

    throwHandlerNotAvailable(DELETE_KEY, key, handler);

    return handler(getValue(node, adapter, childName), adapter, [key.substr(1)], utils);
  }

  throw new Error(`Operation "${DELETE_KEY}" is not supported for nodes.`);
};

handlers = {
  get,
  has,
  apply,
  // only for prefixed keys
  set,
  deleteProperty,
};

export default wrap;
