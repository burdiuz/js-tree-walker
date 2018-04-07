import {
  isIntKey,
  getValue,
  getSingleNode,
  getNodeList,
} from './utils';

import {
  isPrefixedKey,
  isValidPrefix,
  getPrefixHandler,
} from './prefixes';

import {
  hasAugmentation,
  applyAugmentation,
} from './augmentations';

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
  wrapWithProxy,
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
  apply,
};

export default wrapWithProxy;

