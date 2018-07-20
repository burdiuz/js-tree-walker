export class Node {
  constructor(root, parent, name) {
    this.root = root;
    this.parent = parent;
    this.name = name;
  }
}

export class ParentNode extends Node {
  constructor(root, parent, name, children) {
    super(root, parent, name);
    this.children = children;
  }
}

export class ValueNode extends Node {
  constructor(root, parent, name, value) {
    super(root, parent, name);
    this.value = value;
  }
}

export class RootNode extends ParentNode {
  constructor(children = []) {
    super(this, this, '#root', children);
  }
}

const construct = (value, name = '') => {
  if (value instanceof Array) {
    return value.map((item) => construct(item, name));
  } else if (typeof value === 'object') {
    return constructList(value);
  }

  return new ValueNode();
};

const constructList = (data) => {
  const children = [];

  Object.keys(data).map((name) => {
    const value = data[name];
  });

  return children;
};

const constructTree = (data) => {
  const children = constructList(data);

  return new RootNode(children);
};

export default construct;
