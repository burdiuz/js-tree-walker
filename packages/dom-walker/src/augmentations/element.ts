import type { Adapter, WalkerUtils } from '@actualwave/tree-walker';

const name = (node: unknown, adapter: Adapter): string => adapter.getName(node);

const text = (node: unknown, adapter: Adapter): string | undefined =>
  (adapter.toNode(node) as HTMLElement | null)?.innerText;

const attributes = (node: unknown, adapter: Adapter): NamedNodeMap | undefined =>
  (adapter.toNode(node) as Element | null)?.attributes;

const attribute = (node: unknown, adapter: Adapter, args: unknown[]): string | null => {
  const [attrName] = args as string[];
  const target = adapter.toNode(node) as Element;

  if (args.length === 2) {
    const [, value] = args as [string, string | undefined];

    if (value === undefined) {
      target.removeAttribute(attrName);
    } else {
      target.setAttribute(attrName, value);
    }
  }

  return target.getAttribute(attrName);
};

const parent = (node: unknown, adapter: Adapter): unknown => adapter.getNodeParent(node);

const root = (node: unknown, adapter: Adapter): unknown => adapter.getNodeRoot(node);

const query = (
  node: unknown,
  adapter: Adapter,
  [queryString]: unknown[],
  utils: WalkerUtils,
): unknown => {
  const result = (adapter.toNode(node) as Element).querySelector(queryString as string);
  return utils.wrap(adapter.isNode(result) ? result : [], adapter);
};

const queryAll = (
  node: unknown,
  adapter: Adapter,
  [queryString]: unknown[],
  utils: WalkerUtils,
): unknown => {
  const result = (adapter.toNode(node) as Element).querySelectorAll(queryString as string);
  return utils.wrap(result, adapter);
};

export default { name, text, attributes, attribute, parent, root, query, queryAll };
