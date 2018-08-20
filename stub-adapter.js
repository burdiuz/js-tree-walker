const fn = () => {
  throw new Error('Method not implemented');
};

/**
 * @typedef {Object[]} List
 */

/**
 * List with single Node should be treated as Node
 * @typedef {Object|List} Node
 */

/**
 * Name could be of any type, Proxy wrapper supports only String(even for array
 * indexes) and Symbol. But augmentations may pass any type.
 * @typedef {number|string|symbol} Name
 */

/**
 * @type {Adapter}
 */
const adapter = {
  /**
   * Prepare root node before using, called when root wrapper created.
   * @param {Object} root
   * @return {Object}
   */
  validateRoot: () => fn(),

  // list methods
  /**
   * Check if any object is a list of nodes.
   * @param {Object} list
   * @return {Boolean}
   */
  isList: fn,
  /**
   * Convert any object to list of nodes.
   * @param {...Object} nodes
   * @return {List}
   */
  toList: fn,
  /**
   * Get length of node list or return 1 of single node.
   * @param {Node} list
   * @return {Number}
   */
  getLength: fn,
  /**
   * Get node by index from list.
   * @param {Node} node
   * @param {Number} [index=0]
   * @return {Object}
   */
  getNodeAt: fn,

  // node methods
  /**
   * Is any object a node.
   * @param {Object} node
   * @return {Boolean}
   */
  isNode: fn,
  /**
   * Convert any object to node, if list passed, should return first node
   * available on the list.
   * @param {Object} node
   * @return {Node}
   */
  toNode: fn,
  /**
   * Return name, key or value of the node.
   * @param {Node} node
   * @return {Name}
   */
  getName: fn,
  /**
   * Check if list contains node with specified name.
   * @param {Node} node
   * @param {Name} [name]
   * @return {Boolean}
   */
  hasChild: fn,
  /**
   * Get list of children nodes.
   * @param {Node} node
   * @return {List}
   */
  getChildren: fn,
  /**
   * Get children nodes with specified name.
   * @param {Node} node
   * @param {Name} name
   * @return {List}
   */
  getChildrenByName: fn,
  /**
   * Get child node by index.
   * @param {List} node
   * @param {Number} [index=0]
   * @return {Node}
   */
  getChildAt: fn,
  /**
   * Get parent node, if list, return parent node of first child.
   * @param {Node} node
   * @return {Node}
   */
  getNodeParent: fn,
  /**
   * Get root node.
   * @param {Node} node
   * @return {Node}
   */
  getNodeRoot: fn,
};

export default adapter;
