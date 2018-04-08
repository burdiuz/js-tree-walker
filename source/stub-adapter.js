const fn = () => {
  throw new Error('Method not implemented');
};

const adapter = {
  validateRoot: fn,

  // list methods
  isList: fn,
  toList: fn,
  getLength: fn,
  getNodeAt: fn,

  // node methods
  isNode: fn,
  toNode: fn,
  hasChild: fn,
  getChildren: fn,
  getChildrenByName: fn,
  getChildAt: fn,
  getNodeParent: fn,
  getNodeRoot: fn,
};

export default adapter;
