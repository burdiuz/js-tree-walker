'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var hasOwn = _interopDefault(require('@actualwave/has-own'));

let defaultAdapter;

const setDefaultAdapter = adapter => {
  defaultAdapter = adapter;
};
const getDefaultAdapter = () => defaultAdapter;

const GET_KEY = 'get';
const HAS_KEY = 'has';
const SET_KEY = 'set';
const DELETE_KEY = 'deleteProperty';

const namePrefixes = {};

const isValidPrefix = prefix => typeof prefix === 'string' && hasOwn(namePrefixes, prefix);

const getPrefix = key => key.charAt();

const isPrefixedKey = key => {
  if (key && typeof key === 'string' && key.length > 1) {
    return hasOwn(namePrefixes, getPrefix(key));
  }

  return false;
};

const getPrefixHandlers = key => namePrefixes[getPrefix(key)];

const createPrefixHandlerGetter = type => key => {
  const handlers = getPrefixHandlers(key);

  return handlers && handlers[type];
};

const getPrefixGetHandler = createPrefixHandlerGetter(GET_KEY);

const getPrefixHasHandler = createPrefixHandlerGetter(HAS_KEY);

const getPrefixSetHandler = createPrefixHandlerGetter(SET_KEY);

const getPrefixDeleteHandler = createPrefixHandlerGetter(DELETE_KEY);

const setNamePrefix = (prefix, handler) => {
  if (typeof prefix !== 'string' || prefix.length !== 1) {
    throw new Error('Name Prefix must be one character string.');
  }

  if (typeof handler === 'function') {
    namePrefixes[prefix] = {
      get: handler,
      has: (...args) => handler(...args) !== undefined
    };
  } else {
    const { get, set, has, deleteProperty } = handler;

    namePrefixes[prefix] = { get, set, has, deleteProperty };
  }
};

const isIntKey = key => typeof key === 'number' && key >>> 0 === key ||
// it is integer number string
`${parseInt(String(key), 10)}` === key;

const getValue = (node, adapter, childName = undefined) => {
  if (childName !== undefined) {
    return adapter.getChildrenByName(node, childName);
  }

  return node;
};

const getSingleNode = (node, adapter, childName = undefined) => adapter.toNode(getValue(node, adapter, childName));

const getNodeList = (node, adapter, childName = undefined) => adapter.toList(getValue(node, adapter, childName));

let augmentations = {};

const resetAugmentations = (augs = {}) => {
  augmentations = augs;
};

const addAugmentations = augs => {
  augmentations = Object.assign({}, augmentations, augs);
};

const hasAugmentation = key => key && typeof key === 'string' && hasOwn(augmentations, key);

const applyAugmentation = (key, ...args) => augmentations[key](...args);

let handlers;
let utils;

const GET_RESTRICTED_NAMES = {
  constructor: true,
  prototype: true
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
  wrap
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
  deleteProperty
};

const toString = (node, adapter) => adapter.string ? adapter.string(node) : node.toString();
const valueOf = (node, adapter) => adapter.value ? adapter.value(node) : node;

var coreAugmentations = {
  toString,
  valueOf
};

/* eslint-disable prefer-spread */
const name = (node, adapter) => adapter.getName(node);

const children = (node, adapter, [childName], utils) => {
  let list;

  if (childName) {
    list = adapter.getChildrenByName(node, childName);
  } else {
    list = adapter.getChildren(node);
  }

  return utils.wrap(list, adapter);
};

/**
 * @internal
 */
const descendantsAll = (node, adapter, args, utils) => {
  const children = []; // eslint-disable-line no-shadow
  const descendants = [];
  const list = adapter.getChildren(node);
  const length = adapter.getLength(list, adapter);

  for (let index = 0; index < length; index += 1) {
    const child = list[index];
    children.push(child);
    descendants.push.apply(descendants, descendantsAll(child, adapter, args, utils));
  }

  /* children go first, then other descendants */
  return [...children, ...descendants];
};

/**
 * @internal
 */
const descendantsByName = (node, adapter, args, utils) => {
  const [childName] = args;
  const children = []; // eslint-disable-line no-shadow
  const descendants = [];
  const list = adapter.getChildren(node);
  const length = adapter.getLength(list, adapter);

  for (let index = 0; index < length; index += 1) {
    const child = adapter.getNodeAt(list, index);

    if (adapter.getName(child) === childName) {
      children.push(child);
    }

    descendants.push.apply(descendants, descendantsByName(child, adapter, args, utils));
  }

  /* children go first, then other descendants */
  return [...children, ...descendants];
};

const descendants = (node, adapter, args, utils) => {
  const [childName] = args;

  if (childName) {
    return utils.wrap(descendantsByName(node, adapter, args, utils), adapter);
  }

  return utils.wrap(descendantsAll(node, adapter, args, utils), adapter);
};

const childAt = (node, adapter, [index = 0], utils) => utils.wrap(adapter.getChildAt(node, index), adapter);

const root = (node, adapter, args, utils) => utils.wrap(adapter.getNodeRoot(node), adapter);

const parent = (node, adapter, args, utils) => utils.wrap(adapter.getNodeParent(node), adapter);

var node = {
  name,
  children,
  descendants,
  childAt,
  root,
  parent
};

const length = (node, adapter) => {
  if (adapter.isList(node)) {
    return adapter.getLength(node);
  }

  if (adapter.isNode(node)) {
    return 1;
  }

  return 0;
};

const at = (node, adapter, args, utils) => {
  const [index = 0] = args;
  let result;

  if (adapter.isList(node)) {
    const child = adapter.getNodeAt(node, index);

    if (child) {
      result = child;
    }
  } else if (!index) {
    result = node;
  }

  // if nothing found return empty array, which will create empty wrapper for
  // chained calls, this will make next calls errorless.
  return utils.wrap(result || [], adapter);
};

const first = (node, adapter, args, utils) => at(node, adapter, [0], utils);

const filter = (node, adapter, [callback], utils) => {
  // apply filter on element collection
  // always return wrapped list
  const list = adapter.toList(node);
  const listLength = adapter.getLength(node);
  const result = [];

  const wrappedNode = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    if (callback(utils.wrap(child, adapter), index, wrappedNode)) {
      result.push(child);
    }
  }

  return utils.wrap(result, adapter);
};

const map = (node, adapter, [callback], utils) => {
  // apply map on element collection
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  const result = [];

  const wrappedList = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    const childResult = callback(utils.wrap(child, adapter), index, wrappedList);
    result.push(childResult);
  }

  // returns normal array because we don't know if all items in result are nodes
  // and if they are, they will be likely already wrapped
  return result;
};

const forEach = (node, adapter, [callback], utils) => {
  // apply map on element collection
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);

  const wrappedList = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    callback(utils.wrap(child, adapter), index, wrappedList);
  }
};

const reduce = (node, adapter, [callback, result], utils) => {
  // apply reduce on element collection
  const list = adapter.toList(node);
  const listLength = adapter.getLength(node);
  let lastResult = result;

  const wrappedNode = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    lastResult = callback(lastResult, utils.wrap(child, adapter), index, wrappedNode);
  }

  return lastResult;
};

var list = {
  length,
  at,
  first,
  filter,
  map,
  forEach,
  reduce
};

addAugmentations(coreAugmentations);

const create = (root, adapter = getDefaultAdapter()) => wrap(adapter.validateRoot(root), adapter);

exports.setDefaultAdapter = setDefaultAdapter;
exports.getDefaultAdapter = getDefaultAdapter;
exports.addAugmentations = addAugmentations;
exports.hasAugmentation = hasAugmentation;
exports.resetAugmentations = resetAugmentations;
exports.coreAugmentations = coreAugmentations;
exports.nodeAugmentations = node;
exports.listAugmentations = list;
exports.setNamePrefix = setNamePrefix;
exports.isValidPrefix = isValidPrefix;
exports.create = create;
exports.default = create;
//# sourceMappingURL=tree-walker.js.map
