(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.DOMWalker = {})));
}(this, (function (exports) { 'use strict';

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

  let augmentations = {};

  const resetAugmentations = (augs = {}) => {
    augmentations = augs;
  };

  const addAugmentations = (augs = {}) => {
    augmentations = Object.assign({}, augmentations, augs);
  };

  const hasAugmentation = key => key && typeof key === 'string' && augmentations.hasOwnProperty(key);

  const applyAugmentation = (key, ...args) => augmentations[key](...args);

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

  const on = (node, adapter, [eventType, callback], utils) => {
    // add even listener
  };

  const off = (node, adapter, [eventType, callback], utils) => {
    // remove even listener
  };

  const emmit = (node, adapter, [event], utils) => {
    // dispatch event
  };

  var htmlEventAugmentations = {
    on,
    off,
    emmit
  };

  const length = (node, adapter) => {
    if (adapter.isList(node)) {
      return adapter.getLength(node);
    } else if (adapter.isNode(node)) {
      return 1;
    }
    return 0;
  };

  const first = (node, adapter, args, utils) => {};

  const filter = (node, adapter, [callback], utils) => {
    // apply filter on element collection
    // allways return wrapped HTMLCollection
  };

  const map = (node, adapter, [callback, wrapNodes = true], utils) => {
    // apply map on element collection
    // if wrapNodes in FALSE, will generate normal Array with RAW results in it
    // if wrapNodes in TRUE, will generate wrapped HTMLCollection and put all result into it
  };

  const reduce = (node, adapter, [callback, head], utils) => {
    // apply reduce on element collection
  };

  var htmlListAugmentations = {
    length,
    first,
    filter,
    map,
    reduce
  };

  const name = (node, adapter, args, utils) => adapter.getName(utils.getSingleNode(node, adapter));

  const text = (node, adapter) => adapter.getText(node);

  const children = (node, adapter, [childName], utils) => {
    node = utils.getSingleNode(node, adapter);
    let list;

    if (childName) {
      list = adapter.getChildrenByName(node, childName);
    } else {
      list = adapter.getChildren(node);
    }

    return utils.wrapWithProxy(list, adapter);
  };

  // FIXME move parts to adapter
  const attributes = (node, adapter, args, utils) => {
    const target = utils.getSingleNode(node, adapter);
    if (target.hasAttributes()) {
      return target.attributes;
    }

    return null;
  };

  // FIXME move parts to adapter
  const attribute = (node, adapter, [attrName], utils) => {
    const attrs = attributes(node, adapter, [], utils);
    if (attrs) {
      const attr = attrs.getNamedItem(attrName);
      if (attr) {
        return attr.value;
      }
    }
    return '';
  };

  const childAt = (node, adapter, [index = 0], utils) => adapter.getChildAt(utils.getSingleNode(node, adapter), index);

  const root = (node, adapter, args, utils) => utils.wrapWithProxy(adapter.getNodeRoot(node), adapter);

  const parent = (node, adapter, args, utils) => utils.wrapWithProxy(adapter.getNodeParent(node), adapter);

  const query = (node, adapter, [queryString], utils) => {};

  const queryAll = (node, adapter, [queryString], utils) => {};

  var htmlNodeAugmentations = {
    name,
    text,
    children,
    attributes,
    attribute,
    childAt,
    root,
    parent,
    query,
    queryAll
  };

  const isList = node => node instanceof HTMLCollection || node instanceof Array;

  const toList = (...args) => {
    const { length } = args;
    const [node] = args;

    if (length === 1 && isList(node)) {
      return node;
    }

    const list = [];

    for (let index = 0; index < length; index++) {
      const part = args[index];
      if (isList(part)) {
        list.push.call(part);
      } else {
        list.push(part);
      }
    }

    return list;
  };

  const isNode = node => node instanceof HTMLElement;

  const toNode = node => {
    // if list we use only first node
    if (isList(node)) {
      return node.length ? node[0] : null;
    }

    return isNode(node) ? node : null;
  };

  const getNodeAt = (list, index = 0) => {
    if (isList(list)) {
      return list[index];
    }

    return list;
  };

  const getLength = list => list.length;

  // Node
  const getChildren = node => {
    node = toNode(node);

    // if not a node, return empty list
    return isNode(node) ? node.children : toList();
  };

  const getChildrenByName = (node, name) => {
    name = name.toLowerCase();
    const children = getChildren(node);
    const { length } = children;

    if (!length) {
      return children;
    }

    const list = [];

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child.nodeName.toLowerCase() === name) {
        list.push(child);
      }
    }

    return list;
  };

  const hasChildren = node => !!toNode(node).childElementCount;

  const hasChild = (node, name) => {
    const children = getChildren(node);
    const { length } = children;

    for (let index = 0; index < length; index++) {
      if (children[index].nodeName === name) {
        return true;
      }
    }

    return false;
  };

  const getChildAt = (node, index) => getChildren(node)[index];

  const hasAttribute = (node, name) => toNode(node).hasAttribute(name);

  const getAttributeValue = (node, name) => toNode(node).getAttribute(name);

  const getName = node => toNode(node).nodeName;

  const getText = node => toNode(node).innerText;

  const getNodeParent = node => toNode(node).parentNode;

  const getNodeRoot = node => toNode(node).getRootNode();

  const validateRoot = root => {
    if (root === undefined || root === document) {
      return document.firstElementChild;
    } else if (typeof root === 'string') {
      return document.querySelector(root);
    }

    return root;
  };

  var HTMLROAdapter = {
    isList,
    toList,
    isNode,
    getNodeAt,
    getLength,
    getChildren,
    getChildrenByName,
    hasChildren,
    hasChild,
    getChildAt,
    hasAttribute,
    getAttributeValue,
    getName,
    getText,
    getNodeParent,
    getNodeRoot,
    validateRoot
  };

  const ATTRIBUTE_KEY = '$';

  setDefaultAdapter(HTMLROAdapter);

  addAugmentations(coreAugmentations);
  addAugmentations(htmlNodeAugmentations);
  addAugmentations(htmlListAugmentations);
  addAugmentations(htmlEventAugmentations);

  setNamePrefix(ATTRIBUTE_KEY, (node, adapter, [name]) => adapter.getAttributeValue(node, name));

  const create = (root, adapter = getDefaultAdapter()) => wrapWithProxy(adapter.validateRoot(root), adapter);

  exports.setDefaultAdapter = setDefaultAdapter;
  exports.getDefaultAdapter = getDefaultAdapter;
  exports.addAugmentations = addAugmentations;
  exports.resetAugmentations = resetAugmentations;
  exports.setNamePrefix = setNamePrefix;
  exports.create = create;
  exports.default = create;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=dom-walker.js.map
