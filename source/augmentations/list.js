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
      ([result] = node);
    } else {
      result = [];
    }
  }

  return utils.wrap(result, adapter);
};

const filter = (node, adapter, [callback], utils) => {
  // apply filter on element collection
  // always return wrapped list
  node = adapter.toList(node);
  const list = [];

  const wrappedNode = utils.wrap(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    if (callback(utils.wrap(child, adapter), index, wrappedNode)) {
      list.push(child);
    }
  }

  return utils.wrap(list, adapter);
};

const map = (node, adapter, [callback, wrapNodes = true], utils) => {
  // apply map on element collection
  // if wrapNodes in FALSE, will generate normal Array with RAW results in it
  // if wrapNodes in TRUE and all elements of resulting list are nodes, will
  //   generate wrapped list and put all result into it
  node = adapter.toList(node);
  const list = [];

  let areNodes = true;
  const wrappedNode = utils.wrap(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    const result = callback(utils.wrap(child, adapter), index, wrappedNode);
    areNodes = areNodes && adapter.isNode(result);
    list.push(result);
  }

  return wrapNodes && areNodes ? utils.wrap(list, adapter) : list;
};

const reduce = (node, adapter, [callback, result], utils) => {
  // apply reduce on element collection
  node = adapter.toList(node);

  const wrappedNode = utils.wrap(node, adapter);
  for (let index = 0; index < node.length; index += 1) {
    const child = node[index];
    result = callback(result, utils.wrap(child, adapter), index, wrappedNode);
  }

  return result;
};

export default {
  length,
  first,
  filter,
  map,
  reduce,
};
