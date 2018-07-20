((target) => {
  class ONode {
    constructor(name, parent, root) {
      this.name = name;
      this.children = [];
      this.parent = parent;
      this.root = root;
    }

    toString() {
      return `[ONode name="${this.name}" level="${this.level}"]`;
    }
  };

  const parseONodes = (obj, name = '#root', parent = undefined, root = undefined) => {
    const node = new ONode(name, parent, root);
    Object.assign(node, obj.data);
    const children = [];

    Object.keys(obj).forEach((key) => {
      if (key !== 'data') {
        children.push(parseONodes(obj[key], key, node, root || node));
      }
    });

    node.children = children;

    return node;
  };

  target.parseONodes = parseONodes;
})(window);
