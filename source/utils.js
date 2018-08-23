export const isIntKey = (key) =>
  // it is unsigned int
  (typeof key === 'number' && key >>> 0 === key) ||
  // it is integer number string
  `${parseInt(String(key), 10)}` === key;

export const getValue = (node, adapter, childName = undefined) => {
  if (childName !== undefined) {
    return adapter.getChildrenByName(node, childName);
  }

  return node;
};

export const getSingleNode = (node, adapter, childName = undefined) =>
  adapter.toNode(getValue(node, adapter, childName));

export const getNodeList = (node, adapter, childName = undefined) =>
  adapter.toList(getValue(node, adapter, childName));
