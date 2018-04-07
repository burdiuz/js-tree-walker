export const isIntKey = (key) => (`${parseInt(key, 10)}` === key);

export const getValue = (node, adapter, childName = undefined) => {
  if (childName !== undefined) {
    return adapter.getChildrenByName(node, childName);
  }

  return node;
};

export const getSingleNode = (node, adapter, childName = undefined) => {
  const value = getValue(node, adapter, childName);

  if (adapter.isList(value)) {
    return adapter.getNodeAt(node);
  }

  return value;
};

export const getNodeList = (node, adapter, childName = undefined) => {
  return adapter.toList(getValue(node, adapter, childName));
};
