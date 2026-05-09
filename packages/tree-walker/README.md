
# TreeWalker

This is a wireframe based on ES6 Proxies for making tree traversing APIs.
You may check the ready-to-use implementation [DOMWalker](https://github.com/burdiuz/js-tree-walker/tree/master/packages/dom-walker) for better understanding.
Inspired by [E4X (ECMAScript for XML)](https://en.wikipedia.org/wiki/ECMAScript_for_XML) and its ActionScript 3 implementation.

### Demo
* Using with Object Children Adapter: [TreeWalker Object Tree Demo](https://jsfiddle.net/actualwave/6kw7z4xj/)
* Using with Denormalize Adapter: [TreeWalker Normalized Tree Demo](https://jsfiddle.net/actualwave/5euz47hq/)
* Using with Browser DOM Adapter: [TreeWalker BrowserDOM Tree Demo](https://jsfiddle.net/actualwave/p1k4wjy2/)

### Table of Contents
* [Installation](#installation)
* [How it works](#how-it-works)
* [Usage](#usage)
* [API](#api)
* [Adapter](#adapter)
* [Augmentations](#augmentations)
* [Prefixes](#prefixes)
* [Sub-Entries](#sub-entries)

## Installation

```bash
npm install @actualwave/tree-walker
```

## How it works

To start working with a source data tree, it should be wrapped into a [Proxy wrapper object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) using the `create()` function. The wrapper does not interact with source data directly — all communication goes through an `adapter` object that implements a specific API.

```javascript
const root = create(sourceData, myAdapter);
```

When requesting any field, property or index from the Proxy wrapper, it does not return values of corresponding properties of the source node — instead it looks for children nodes of the same name or index.

```javascript
// this looks for all children nodes with name "child"
const child = root.child;

// this looks for the fifth child node named "child"
const fifth = root.child[5];
```

The wrapper accesses children via `getChildren()` and `getChildrenByName()` adapter methods.

When a child node is accessed by name on a list of nodes, the wrapper operates on the **first** node from that list:

```javascript
/**
 * node structure:
 *      root
 *      / \
 * one[0] one[1]
 *         /  \
 *     two[0] two[1]
 */
const rootProxy = create(root, myAdapter);

// twoProxy will be empty — only one[0] is checked for children
const twoProxy = rootProxy.one.two;

// equivalent — explicitly selects one[0]
const twoProxy = rootProxy.one[0].two;

// to get two children from one[1], select it explicitly
const twoProxy = rootProxy.one[1].two; // two nodes in twoProxy
```

Adapters must always return an empty list when no nodes are found, so you can safely traverse any depth without worrying about nulls:

```javascript
const veryDeepNode = rootProxy.one.five.seven.anyOther.dont.know.if.it.exists;
```

## Usage

TreeWalker requires two components:

1. **Source data** — a tree-shaped data structure
2. **Adapter** — provides a standardised API to navigate source data

Augmentations and prefixes can optionally enrich the resulting API.

```javascript
import { create, addAugmentations, nodeAugmentations, listAugmentations } from '@actualwave/tree-walker';

// only coreAugmentations (toString, valueOf) are pre-applied
// register node and list augmentations explicitly
addAugmentations(nodeAugmentations);
addAugmentations(listAugmentations);

const root = create(source, myAdapter);
```

Once created, child nodes are accessed as properties and augmentations as method calls. The proxy stores the current node and the last accessed child name — resolution is deferred until a call or index access occurs.

```javascript
// stores { target: node, name: "parent" } — no data lookup yet
const parent = node.parent;

// stores { target: parent, name: "otherChild" }
const child = parent.otherChild;

// calls the "descendants" augmentation on "otherChild"
console.log(node.child.otherChild.descendants());
```

The following property names cannot be used as child node names — they are forwarded directly to the underlying node:

- **constructor**
- **prototype**

## API

### `create(rootNode, adapter)`

Create a wrapped proxy for `rootNode` using the supplied `adapter`.

### `setDefaultAdapter(adapter)`

Set a default adapter so it does not need to be passed to every `create()` call.

### `getDefaultAdapter()`

Return the currently registered default adapter.

### `addAugmentations(map)`

Add augmentation functions to the pool. Each key becomes a callable method name on wrapped nodes. The function signature is `(node, adapter, args, utils) => unknown`.

```javascript
addAugmentations({
  children: (node, adapter, args, utils) => { /* ... */ },
  parent:   (node, adapter, args, utils) => { /* ... */ },
  name:     (node, adapter, args, utils) => { /* ... */ },
});
```

### `hasAugmentation(name)`

Return `true` if an augmentation with that name is registered.

### `resetAugmentations(map?)`

Remove all currently registered augmentations (including core augmentations). If a `map` is passed, it replaces the augmentation pool.

### `setNamePrefix(char, handler)`

Register a single-character prefix. `handler` is either:
- A **function** `(node, adapter, args, utils) => unknown` — used as the `get` handler
- A **`PrefixHandlers` object** `{ get?, has?, set?, deleteProperty? }` for full trap control

### `isValidPrefix(char)`

Return `true` if a prefix handler is registered for `char`.

## Adapter

An adapter is a plain object that abstracts all data-source access. Every augmentation and proxy operation receives the adapter alongside the current node.

```typescript
interface Adapter {
  // required
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
  // optional
  string?(item: unknown): string;   // used by toString augmentation
  value?(item: unknown): unknown;   // used by valueOf augmentation
}
```

All methods must handle both nodes and lists. If a method expects a node but receives a list, it should take the first element; if it expects a list but receives a node, it should convert it.

> You are free to add additional methods or properties to your adapter for use in custom augmentations.

## Augmentations

Augmentations are functions called on a wrapped node when you invoke it as a method. The same name can be accessed as a child node (property access) or as an augmentation (function call):

```javascript
addAugmentations({
  children: (node, adapter, [childName], utils) => {
    const list = childName
      ? adapter.getChildrenByName(node, childName)
      : adapter.getChildren(node);
    return utils.wrap(list, adapter);
  },
});

const root = create(source, myAdapter);

const children1 = root.children;    // wrapped child — stores (root, 'children')
const children2 = root.children();  // augmentation call — returns child list
const children3 = children1();      // same result — proxy remembers its name
```

Use `utils.wrap(value, adapter)` to return a traversable proxy from an augmentation.

### coreAugmentations

Pre-applied automatically. Contains `toString` and `valueOf`.

- **`valueOf(): any`** — calls `adapter.value(node)` if defined, otherwise returns the raw node
- **`toString(): string`** — calls `adapter.string(node)` if defined, otherwise calls `.toString()` on the node

### nodeAugmentations

Must be registered explicitly with `addAugmentations(nodeAugmentations)`.

- **`name(): string`** — name of the current node
- **`children(name?: string): WrappedNode`** — direct children, optionally filtered by name
- **`descendants(name?: string): WrappedNode`** — all descendants, optionally filtered by name
- **`childAt(index?: number): WrappedNode`** — child at the given index (default `0`)
- **`root(): WrappedNode`** — root of the tree
- **`parent(): WrappedNode`** — parent node

### listAugmentations

Must be registered explicitly with `addAugmentations(listAugmentations)`.

- **`length(): number`** — number of nodes in the list; returns `1` for a single node
- **`at(index?: number): WrappedNode`** — node at index; works on single nodes too
- **`first(): WrappedNode`** — first node in the list
- **`forEach(fn: Function): void`** — iterate over each wrapped node
- **`map(fn: Function): any[]`** — transform each wrapped node; returns a plain array
- **`filter(fn: Function): WrappedNode`** — keep nodes matching the predicate
- **`reduce(fn: Function, initial?: any): any`** — accumulate a value across nodes

## Prefixes

A prefix is a single character that intercepts property access and routes it to a registered handler instead of performing child traversal. This lets you read/write node properties through the proxy without naming conflicts.

```javascript
import { setNamePrefix } from '@actualwave/tree-walker';

// function form — registers a get handler only
const dataPrefixGetHandler = (target, adapter, [name]) => {
  const node = adapter.toNode(target);
  return node.data ? node.data[name] : undefined;
};

setNamePrefix('$', dataPrefixGetHandler);
```

With this prefix registered:

```javascript
const root = create(source, myAdapter);

console.log(root.$prop1);       // reads prop1 from node.data
console.log(root.child.$prop1); // reads prop1 from child node's data
```

For full control over all Proxy traps, pass a handlers object instead:

```javascript
setNamePrefix('$', {
  get(target, adapter, [name]) {
    const node = adapter.toNode(target);
    return node.data ? node.data[name] : undefined;
  },
  has(target, adapter, [name]) {
    const node = adapter.toNode(target);
    return node.data ? Object.hasOwn(node.data, name) : false;
  },
  set(target, adapter, [name, value]) {
    const node = adapter.toNode(target);
    if (!node.data) node.data = {};
    node.data[name] = value;
    return true;
  },
  deleteProperty(target, adapter, [name]) {
    const node = adapter.toNode(target);
    return node.data ? delete node.data[name] : false;
  },
});
```

## Sub-Entries

The package exposes three optional utilities as independent sub-path imports:

### `@actualwave/tree-walker/children-adapter`

An adapter factory for trees where nodes are plain objects with `name` and `children` properties.

```javascript
import createAdapter from '@actualwave/tree-walker/children-adapter';

const tree = {
  name: 'root',
  children: [
    { name: 'section', children: [{ name: 'item', children: [] }] },
  ],
};

// default: reads node.name and node.children
const adapter = createAdapter();

// custom accessors
const adapter = createAdapter(
  (node) => node.id,           // getName
  (node) => node.items ?? [],  // getChildren
);

const root = create(tree, adapter);
root.section.item.name(); // 'item'
```

### `@actualwave/tree-walker/denormalize-adapter`

An adapter factory for normalised (flat) data stores where nodes are identified by string keys and stored in a lookup object.

```javascript
import { createAdapter } from '@actualwave/tree-walker/denormalize-adapter';

const store = {
  root: { children: ['a', 'b'] },
  a:    { children: ['c'] },
  b:    { children: [] },
  c:    { children: [] },
};

const adapter = createAdapter(() => store);
const root = create('root', adapter);

root.a.name();   // 'a'
root.a.c.name(); // 'c'
```

### `@actualwave/tree-walker/property-handlers`

Creates `PrefixHandlers` objects for reading and writing properties on the underlying node object through a registered prefix.

```javascript
import { createHandlers, createROHandlers } from '@actualwave/tree-walker/property-handlers';
import { setNamePrefix } from '@actualwave/tree-walker';

// read-write access to node properties
setNamePrefix('$', createHandlers());

// read-only access
setNamePrefix('$', createROHandlers());

// custom data getter — receives the raw node, returns a record to read/write
setNamePrefix('$', createHandlers((node) => node.metadata));
```
