const length = (node, adapter) => {
  if (adapter.isList(node)) {
    return adapter.getLength(node);
  } else if (adapter.isNode(node)) {
    return 1;
  }

  return 0;
};

const at = (node, adapter, args, utils) => {
  const [index] = args;
  // return empty array, which will create empty wrapper for chained calls,
  // this will make next calls errorless.
  let result = [];

  if (adapter.isList(node)) {
    const child = adapter.getNodeAt(node, index);

    if (child) {
      result = child;
    }
  }

  return utils.wrap(result, adapter);
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

const map = (node, adapter, [callback, wrapNodes = true], utils) => {
  // apply map on element collection
  // if wrapNodes in FALSE, will generate normal Array with RAW results in it
  // if wrapNodes in TRUE and all elements of resulting list are nodes, will
  //   generate wrapped list and put all result into it
  const list = adapter.toList(node);
  const listLength = adapter.getLength(list);
  const result = [];

  let areNodes = true;
  const wrappedNode = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    const childResult = callback(
      utils.wrap(child, adapter),
      index,
      wrappedNode
    );
    areNodes = areNodes && adapter.isNode(childResult);
    result.push(childResult);
  }

  return wrapNodes && areNodes ? utils.wrap(result, adapter) : result;
};

const reduce = (node, adapter, [callback, result], utils) => {
  // apply reduce on element collection
  const list = adapter.toList(node);
  const listLength = adapter.getLength(node);
  let lastResult = result;

  const wrappedNode = utils.wrap(list, adapter);
  for (let index = 0; index < listLength; index += 1) {
    const child = adapter.getNodeAt(list, index);
    lastResult = callback(
      result,
      utils.wrap(child, adapter),
      index,
      wrappedNode
    );
  }

  return lastResult;
};

export default {
  length,
  at,
  first,
  filter,
  map,
  reduce
};
