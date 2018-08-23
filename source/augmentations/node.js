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
    descendants.push.apply(
      descendants,
      descendantsAll(child, adapter, args, utils),
    );
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

    descendants.push.apply(
      descendants,
      descendantsByName(child, adapter, args, utils),
    );
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

const childAt = (node, adapter, [index = 0], utils) =>
  utils.wrap(adapter.getChildAt(node, index), adapter);

const root = (node, adapter, args, utils) =>
  utils.wrap(adapter.getNodeRoot(node), adapter);

const parent = (node, adapter, args, utils) =>
  utils.wrap(adapter.getNodeParent(node), adapter);

export default {
  children,
  descendants,
  childAt,
  root,
  parent,
};
