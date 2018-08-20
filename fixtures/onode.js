export const toString = (node) => {
  if (!node) return '';

  const source = node.valueOf();
  if (source instanceof Array) {
    return source.map((item) => item ? item.toString() : String(item)).join('\n');
  }

  return source.toString();
};

export const valueOf = (node) => {
  if (!node) return null;

  const source = node.valueOf();
  if (source instanceof Array) {
    return source.map((item) => item && item.valueOf());
  }

  return source.valueOf();
};

export class ONode {
  constructor(name, parent, root) {
    this.name = name;
    this.children = [];
    this.parent = parent;
    this.root = root || this;
  }

  toString = () => `[ONode name="${this.name}" ${JSON.stringify(this.data)}]`;
  valueOf = () => ({ name: this.name, data: this.data });
  normalMethod() {
    return this.data;
  }
}

export const parseONodes = (
  obj,
  name = '#root',
  parent = undefined,
  root = undefined,
) => {
  const node = new ONode(name, parent, root);
  const children = [];

  Object.keys(obj).forEach((key) => {
    const source = obj[key];
    if (key !== 'data') {
      if (source instanceof Array) {
        children.push.apply(
          children,
          source.map((item) => parseONodes(item, key, node, root || node)),
        );
      } else {
        children.push(parseONodes(source, key, node, root || node));
      }
    }
  });

  node.children = children;
  node.data = obj.data;

  return node;
};

export default parseONodes;
