'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let defaultAdapter;

const setDefaultAdapter = adapter => {
  defaultAdapter = adapter;
};
const getDefaultAdapter = () => defaultAdapter;

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hasOwn_1 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });

const hasOwn = (
  (has) =>
  (target, property) =>
  Boolean(target && has.call(target, property))
)(Object.prototype.hasOwnProperty);

exports.hasOwn = hasOwn;
exports.default = hasOwn;
});

var hasOwn = unwrapExports(hasOwn_1);
var hasOwn_2 = hasOwn_1.hasOwn;

const namePrefixes = {};

const isValidPrefix = prefix => typeof prefix === 'string' && hasOwn(namePrefixes, prefix);

const isPrefixedKey = key => key && typeof key === 'string' && key.length > 1 && hasOwn(namePrefixes, key.charAt());

const getPrefixHandler = key => namePrefixes[key.charAt()];

const setNamePrefix = (prefix, handler) => {
  if (typeof prefix !== 'string' || prefix.length !== 1) {
    throw new Error('Name Prefix must be one character string.');
  }

  namePrefixes[prefix] = handler;
};

const isIntKey = key =>
// it is unsigned int
typeof key === 'number' && key >>> 0 === key ||
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

const get = ({ node, adapter, childName }, key) => {
  /*
   if symbol, return node property
   if string childName used
   if starts with $, return attribute value
   else return wrapper with current single node and property childName
   if numeric index used, use node as parent and childName is undefined
   */
  if (typeof key === 'symbol' || GET_RESTRICTED_NAMES[key] === true) {
    return node[key];
  }

  if (isIntKey(key)) {
    return wrap(adapter.getNodeAt(getNodeList(node, adapter, childName), key), adapter);
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixHandler(key);
    return handler(getValue(node, adapter, childName), adapter, [key.substr(1)], utils);
  }

  const result = getValue(node, adapter, childName);

  // return wrap with node and childName
  return wrap(result, adapter, key);
};

const has = ({ node, adapter, childName }, key) => {
  if (isIntKey(key)) {
    return !!adapter.getNodeAt(getNodeList(node, adapter, childName), key);
  }

  if (isPrefixedKey(key)) {
    // return adapter.hasAttribute(getSingleNode(node, adapter, childName), key.substr(1));
    // don't know how to implement this, calling same handler as in GET seems overkill
    // FIXME let user to register GET and optional SET/HAS handlers
    return true;
  }

  return adapter.hasChild(getSingleNode(node, adapter, childName), key);
};

const apply = ({ node, adapter, childName }, thisArg, argumentsList) => {
  if (childName === undefined) {
    throw new Error('Cannot call on TreeWalker Node');
  }

  // this works only of childName === prefix, one char string
  // otherwise it should be passed into arguments

  // FIXME if GET always return result of prefixed property, means there are
  // no cases when we get a wrapped node to APPLY trap with prefixed name.
  if (isValidPrefix(childName)) {
    const handler = getPrefixHandler(childName);
    return handler(node, adapter, [childName.substr(1), ...argumentsList], utils);
  }

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

handlers = {
  get,
  has,
  apply
};

const toString = node => node.toString();
const valueOf = node => node;

var coreAugmentations = {
  toString,
  valueOf
};

/* eslint-disable prefer-spread */
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
    const child = list[index];
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
  children,
  descendants,
  childAt,
  root,
  parent
};

const length = (node, adapter) => {
  if (adapter.isList(node)) {
    return adapter.getLength(node);
  } else if (adapter.isNode(node)) {
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
