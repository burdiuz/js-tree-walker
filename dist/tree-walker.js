'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let defaultAdapter = null;

const setDefaultAdapter = adapter => {
  defaultAdapter = adapter;
};
const getDefaultAdapter = () => defaultAdapter;

const namePrefixes = {};

const isValidPrefix = prefix => typeof prefix === 'string' && prefix.length === 1 && namePrefixes.hasOwnProperty(prefix);

const isPrefixedKey = key => key && typeof key === 'string' && key.length > 1 && namePrefixes.hasOwnProperty(key.charAt());

const getPrefixHandler = key => namePrefixes[key.charAt()];

const setNamePrefix = (prefix, handler) => {
  if (typeof prefix !== 'string' || prefix.length !== 1) {
    throw new Error('Name Prefix must be one character string.');
  }

  namePrefixes[prefix] = handler;
};

const isIntKey = key => `${parseInt(key, 10)}` === key;

const getValue = (node, adapter, childName = undefined) => {
  if (childName !== undefined) {
    return adapter.getChildrenByName(node, childName);
  }

  return node;
};

const getSingleNode = (node, adapter, childName = undefined) => {
  const value = getValue(node, adapter, childName);

  if (adapter.isList(value)) {
    return adapter.getNodeAt(node);
  }

  return value;
};

const getNodeList = (node, adapter, childName = undefined) => {
  return adapter.toList(getValue(node, adapter, childName));
};

let augmentations = {};

const resetAugmentations = (augs = {}) => {
  augmentations = augs;
};

const addAugmentations = (augs = {}) => {
  augmentations = Object.assign({}, augmentations, augs);
};

const hasAugmentation = key => key && typeof key === 'string' && augmentations.hasOwnProperty(key);

const applyAugmentation = (key, ...args) => augmentations[key](...args);

let handlers;
let utils;

const createWalkerNode = (node, adapter, childName = undefined) => {
  function TreeWalker() {
    throw new Error('should have been never called');
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

const wrapWithProxy = (node, adapter, childName = undefined) => {
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
  wrapWithProxy
};

const get = ({ node, adapter, childName }, key) => {
  /*
   if string childName used
   if starts with $, return attribute value
   else return wrapper with current single node and property childName
   if numeric index used, use node as parent and childName is undefined
   */
  if (isIntKey(key)) {
    return wrapWithProxy(adapter.getNodeAt(getNodeList(node, adapter, childName), key), adapter);
  }

  if (isPrefixedKey(key)) {
    const handler = getPrefixHandler(key);
    return handler(getValue(node, adapter, childName), adapter, [key.substr(1)], utils);
  }

  // return wrap with node and childName
  return wrapWithProxy(getValue(node, adapter, childName), adapter, key);
};

const has = ({ node, adapter, childName }, key) => {
  if (isIntKey(key)) {
    return !!adapter.getNodeAt(getNodeList(node, adapter, childName), key);
  }

  if (isPrefixedKey(key)) {
    // return adapter.hasAttribute(getSingleNode(node, adapter, childName), key.substr(1));
    // don't know how to implement this, calling same handler as in GET seems overkill
    return true;
  }

  return adapter.hasChild(getSingleNode(), key);
};

const apply = ({ node, adapter, childName }, thisArg, argumentsList) => {
  if (childName === undefined) {
    throw new Error('Cannot call on TreeWalker Node');
  }

  // this works only of childName === prefix, one char string
  // otherwise it should be passed into arguments
  if (isValidPrefix(childName)) {
    const handler = getPrefixHandler(childName);
    return handler(node, adapter, argumentsList, utils);
  }

  if (hasAugmentation(childName)) {
    // INFO cannot use target because it contains method's childName, not Node childName
    // call the function with saving context, so other augmentations are accessible via "this"
    return applyAugmentation(childName, node, adapter, argumentsList, utils);
  }

  // FIXME might throw only in dev mode(needs implmentation)
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
  valueOf,
  [Symbol.toPrimitive]: node => node
};

const children = (node, adapter, [childName], utils) => {
  let list;

  if (childName) {
    list = adapter.getChildrenByName(node, childName);
  } else {
    list = adapter.getChildren(node);
  }

  return utils.wrapWithProxy(list, adapter);
};

const childAt = (node, adapter, [index = 0], utils) => utils.wrapWithProxy(adapter.getChildAt(node, index), adapter);

const root = (node, adapter, args, utils) => utils.wrapWithProxy(adapter.getNodeRoot(node), adapter);

const parent = (node, adapter, args, utils) => utils.wrapWithProxy(adapter.getNodeParent(node), adapter);

var node = {
  children,
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

const first = (node, adapter, args, utils) => {
  let result = node;

  if (adapter.isList(node)) {
    if (node.length) {
      [result] = node;
    } else {
      result = [];
    }
  }

  return utils.wrapWithProxy(result, adapter);
};

const filter = (node, adapter, [callback], utils) => {
  // apply filter on element collection
  // allways return wrapped list
  node = adapter.toList(node);
  const list = [];

  const wrappedNode = utils.wrapWithProxy(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    if (callback(utils.wrapWithProxy(child, adapter), index, wrappedNode)) {
      list.push(child);
    }
  }

  return utils.wrapWithProxy(list, adapter);
};

const map = (node, adapter, [callback, wrapNodes = true], utils) => {
  // apply map on element collection
  // if wrapNodes in FALSE, will generate normal Array with RAW results in it
  // if wrapNodes in TRUE and all elements of resulting list are nodes, will
  //   generate wrapped list and put all result into it
  node = adapter.toList(node);
  const list = [];

  let areNodes = true;
  const wrappedNode = utils.wrapWithProxy(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    const result = callback(utils.wrapWithProxy(child, adapter), index, wrappedNode);
    areNodes = areNodes && adapter.isNode(result);
    list.push(result);
  }

  return wrapNodes && areNodes ? utils.wrapWithProxy(list, adapter) : list;
};

const reduce = (node, adapter, [callback, result], utils) => {
  // apply reduce on element collection
  node = adapter.toList(node);

  const wrappedNode = utils.wrapWithProxy(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    result = callback(result, utils.wrapWithProxy(child, adapter), index, wrappedNode);
  }

  return result;
};

var list = {
  length,
  first,
  filter,
  map,
  reduce
};

addAugmentations(coreAugmentations);

const create = (root, adapter = getDefaultAdapter()) => wrapWithProxy(adapter.validateRoot(root), adapter);

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
