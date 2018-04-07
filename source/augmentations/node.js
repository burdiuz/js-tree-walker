const children = (node, adapter, [childName], utils) => {
  let list;

  if (childName) {
    list = adapter.getChildrenByName(node, childName);
  } else {
    list = adapter.getChildren(node);
  }

  return utils.wrapWithProxy(list, adapter);
};

const childAt = (node, adapter, [index = 0], utils) =>
  utils.wrapWithProxy(adapter.getChildAt(node, index), adapter);

const root = (node, adapter, args, utils) =>
  utils.wrapWithProxy(adapter.getNodeRoot(node), adapter);

const parent = (node, adapter, args, utils) =>
  utils.wrapWithProxy(adapter.getNodeParent(node), adapter);


export default {
  children,
  childAt,
  root,
  parent,
};
