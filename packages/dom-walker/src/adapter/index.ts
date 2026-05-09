import type { Adapter } from '@actualwave/tree-walker';

type DOMList = HTMLCollection | NodeList | Element[];
type DOMNode = Element;

const isList = (node: unknown): node is DOMList =>
  node instanceof Array || node instanceof HTMLCollection || node instanceof NodeList;

const toList = (...args: unknown[]): DOMList => {
  const { length } = args;
  const [node] = args;

  if (length === 1 && isList(node)) {
    return node;
  }

  const list: Element[] = [];

  for (let index = 0; index < length; index++) {
    const part = args[index];
    if (isList(part)) {
      list.push(...Array.from(part as HTMLCollection));
    } else {
      list.push(part as Element);
    }
  }

  return list;
};

const isNode = (node: unknown): node is DOMNode => node instanceof HTMLElement;

const toNode = (node: unknown): DOMNode | null => {
  if (isList(node)) {
    return (node as DOMList).length ? (node as DOMList)[0] as Element : null;
  }
  return isNode(node) ? node : null;
};

const getNodeAt = (list: unknown, index = 0): Element | undefined => {
  if (isList(list)) {
    return (list as DOMList)[index] as Element;
  }
  return list as Element;
};

const getLength = (list: unknown): number => (list as { length: number }).length;

const getName = (node: unknown): string => toNode(node)!.nodeName.toLowerCase();

const getChildren = (node: unknown): DOMList => {
  const el = toNode(node);
  return isNode(el) ? el.children : toList();
};

const getChildrenByName = (node: unknown, name: string): Element[] => {
  const normalizedName = name.toLowerCase();
  const children = getChildren(node);
  const { length } = children;

  if (!length) {
    return [];
  }

  const list: Element[] = [];
  for (let index = 0; index < length; index++) {
    const child = children[index] as Element;
    if (child.nodeName.toLowerCase() === normalizedName) {
      list.push(child);
    }
  }

  return list;
};

const hasChild = (node: unknown, name: string): boolean => {
  const children = getChildren(node);
  const { length } = children;
  const normalizedName = name.toLowerCase();

  for (let index = 0; index < length; index++) {
    if ((children[index] as Element).nodeName.toLowerCase() === normalizedName) {
      return true;
    }
  }

  return false;
};

const getChildAt = (node: unknown, index: number): Element =>
  getChildren(node)[index] as Element;

const getNodeParent = (node: unknown): Element | null =>
  toNode(node)!.parentElement;

const getNodeRoot = (node: unknown): Node => toNode(node)!.getRootNode();

const validateRoot = (root: unknown): Element | null => {
  if (root === undefined || root === document) {
    return document.firstElementChild;
  }

  if (typeof root === 'string') {
    return document.querySelector(root);
  }

  return root as Element;
};

const adapter: Adapter = {
  isList,
  toList: (...args: unknown[]) => toList(...args) as unknown[],
  isNode,
  toNode,
  getNodeAt,
  getLength,
  getName,
  getChildren,
  getChildrenByName,
  hasChild,
  getChildAt,
  getNodeParent,
  getNodeRoot,
  validateRoot,
  value: toNode,
};

export default adapter;
