export const toString = (node: unknown): string => {
  if (!node) return '';
  const source = (node as { valueOf(): unknown }).valueOf();
  if (source instanceof Array) {
    return source.map((item) => (item ? String(item) : String(item))).join('\n');
  }
  return String(source);
};

export const valueOf = (node: unknown): unknown => {
  if (!node) return null;
  const source = (node as { valueOf(): unknown }).valueOf();
  if (source instanceof Array) {
    return source.map((item) => item && (item as { valueOf(): unknown }).valueOf());
  }
  return (source as { valueOf(): unknown }).valueOf();
};

export class ONode {
  name: string;
  children: ONode[];
  parent: ONode | undefined;
  root: ONode;
  data?: Record<string, unknown>;

  constructor(name: string, parent?: ONode, root?: ONode) {
    this.name = name;
    this.children = [];
    this.parent = parent;
    this.root = root ?? this;
  }

  toString = (): string => `[ONode name="${this.name}" ${JSON.stringify(this.data)}]`;
  valueOf = (): { name: string; data: Record<string, unknown> | undefined } => ({
    name: this.name,
    data: this.data,
  });
  normalMethod(): Record<string, unknown> | undefined {
    return this.data;
  }
  getParent(): ONode | undefined {
    return this.parent;
  }
  getChildren(): ONode[] {
    return this.children;
  }
}

export const parseONodes = (
  obj: Record<string, unknown>,
  name = '#root',
  parent?: ONode,
  root?: ONode,
): ONode => {
  const node = new ONode(name, parent, root);
  const children: ONode[] = [];

  Object.keys(obj).forEach((key) => {
    const source = obj[key];
    if (key !== 'data') {
      if (source instanceof Array) {
        children.push(
          ...source.map((item) =>
            parseONodes(item as Record<string, unknown>, key, node, root ?? node),
          ),
        );
      } else {
        children.push(
          parseONodes(source as Record<string, unknown>, key, node, root ?? node),
        );
      }
    }
  });

  node.children = children;
  node.data = obj.data as Record<string, unknown> | undefined;

  return node;
};

export default parseONodes;
