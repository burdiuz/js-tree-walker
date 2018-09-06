((target) => {
  class ONode {
    constructor(name, parent, root) {
      this.name = name;
      this.children = [];
      this.parent = parent;
      this.root = root || this;
    }

    toString() {
      return `[ONode name="${this.name}" ${JSON.stringify(this.data)}]`;
    }

    valueOf() {
      return { name: this.name, data: this.data };
    }

    normalMethod() {
      return this.data;
    }
  }

  const parseONodes = (
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

  target.parseONodes = parseONodes;
})(window);
