export interface Adapter {
  validateRoot(root: unknown): unknown;
  isList(item: unknown): boolean;
  toList(item: unknown): unknown[];
  getLength(list: unknown): number;
  getNodeAt(list: unknown, index?: number): unknown;
  isNode(item: unknown): boolean;
  toNode(item: unknown): unknown;
  getName(node: unknown): string;
  hasChild(node: unknown, name: string): boolean;
  getChildren(node: unknown): unknown;
  getChildrenByName(node: unknown, name: string): unknown;
  getChildAt(node: unknown, index?: number): unknown;
  getNodeParent(node: unknown): unknown;
  getNodeRoot(node: unknown): unknown;
  string?(item: unknown): string;
  value?(item: unknown): unknown;
}

export type WalkerProxy = unknown;

export interface WalkerUtils {
  isIntKey(key: unknown): boolean;
  getValue(node: unknown, adapter: Adapter, childName?: string): unknown;
  getSingleNode(node: unknown, adapter: Adapter, childName?: string): unknown;
  getNodeList(node: unknown, adapter: Adapter, childName?: string): unknown;
  wrap(node: unknown, adapter: Adapter, childName?: string): WalkerProxy;
}

export type AugmentationFunction = (
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
) => unknown;

export type AugmentationMap = Record<string, AugmentationFunction>;

export type PrefixHandlerFunction = (
  node: unknown,
  adapter: Adapter,
  args: unknown[],
  utils: WalkerUtils,
) => unknown;

export interface PrefixHandlers {
  get?: PrefixHandlerFunction;
  has?: PrefixHandlerFunction;
  set?: PrefixHandlerFunction;
  deleteProperty?: PrefixHandlerFunction;
}
