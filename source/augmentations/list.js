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

export default {
  length,
  at,
  first,
  filter,
  map,
  forEach,
  reduce,
};
