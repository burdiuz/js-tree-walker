---
name: tree-walker
description: >
  ES6 Proxy-based library for traversing tree-shaped data structures with a
  fluent dot-notation API. Use when you need to navigate nested objects or
  arrays by node name, apply augmentations (callable methods) to traversed
  nodes, or build custom tree-traversal APIs backed by a data-source adapter.
license: MIT
compatibility: Node.js 14+, modern browsers (ES2022). No runtime dependencies.
metadata:
  package: "@actualwave/tree-walker"
  npm: https://www.npmjs.com/package/@actualwave/tree-walker
---

## Overview

TreeWalker wraps any tree-shaped value in an ES6 Proxy. Accessing a property on
the proxy traverses one level into the tree. Calling a property as a function
invokes an **augmentation** — a named method registered globally. The library is
data-source agnostic; an **adapter** object teaches it how to navigate any tree
structure.

## Installation

```bash
npm install @actualwave/tree-walker
```

## Quick Start

```js
import { create } from '@actualwave/tree-walker';
import createAdapter from '@actualwave/tree-walker/children-adapter';

const tree = {
  name: 'root',
  children: [
    { name: 'section', children: [{ name: 'item', children: [] }] },
  ],
};

const adapter = createAdapter();
const root = create(tree, adapter);

root.section.name();       // 'section'
root.section.item.name();  // 'item'
root.section.children();   // wrapped list of section's children
```

## Core Concepts

### Traversal

Property access lazily moves through the tree. The proxy stores the current
node and the name of the last accessed child — the child is resolved only when
the proxy is called (as an augmentation) or when an integer index is accessed.

```js
const node = root.a.b.c;   // proxy; no DOM/data lookup yet
node.name();                // resolves now → name of node 'c' under a→b
node[0];                    // first child of 'c'
```

### Integer Index Access

Accessing a numeric index on a proxy resolves the current child list and
returns the node at that position, wrapped in a new proxy.

```js
root.items[0];   // first child named 'items'
root.items[2];   // third child named 'items'
```

### Augmentations

Augmentations are named functions called on wrapped nodes. They are registered
globally and receive `(node, adapter, args, utils)`.

```js
import { addAugmentations, resetAugmentations } from '@actualwave/tree-walker';

addAugmentations({
  size: (node, adapter) => adapter.getLength(adapter.getChildren(node)),
  label: (node, adapter, [prefix = '']) => prefix + adapter.getName(node),
});

root.section.size();         // number of direct children
root.section.label('>>> ');  // '>>> section'
```

Built-in augmentation sets exported from the package:

| Export | Methods |
|--------|---------|
| `coreAugmentations` | `toString`, `valueOf` |
| `nodeAugmentations` | `name`, `children`, `childAt`, `descendants`, `parent`, `root` |
| `listAugmentations` | `length`, `at`, `first`, `forEach`, `map`, `filter`, `reduce` |

Import and register them explicitly:

```js
import {
  addAugmentations,
  coreAugmentations,
  nodeAugmentations,
  listAugmentations,
} from '@actualwave/tree-walker';

addAugmentations(coreAugmentations);
addAugmentations(nodeAugmentations);
addAugmentations(listAugmentations);
```

### Node Augmentations

```js
root.section.name();               // tag/key name of the node
root.section.children();           // all direct children, wrapped
root.section.children('item');     // children named 'item', wrapped
root.section.childAt(0);           // first child, wrapped
root.section.descendants();        // all descendants, wrapped
root.section.descendants('item');  // all descendants named 'item', wrapped
root.section.parent();             // parent node, wrapped
root.section.root();               // root of the tree, wrapped
```

### List Augmentations

When a traversal step returns multiple nodes (a list), list augmentations apply:

```js
const items = root.section.item;   // list of 'item' nodes

items.length();                          // count
items.at(1);                             // second item
items.first();                           // first item
items.forEach((node) => { ... });
items.map((node) => node.name());        // returns plain array
items.filter((node) => node.name() !== 'x');
items.reduce((acc, node) => acc + 1, 0);
```

### Prefix Handlers

A named prefix (e.g. `$`) can be registered to intercept property access and
dispatch to a custom handler set. This enables reading/writing node properties
through the proxy without triggering child traversal.

```js
import { setNamePrefix } from '@actualwave/tree-walker';
import { createHandlers } from '@actualwave/tree-walker/property-handlers';

setNamePrefix('$', createHandlers());

// reads node['value'] from the underlying data object
root.section.$value;
// writes node['checked'] = true
root.section.$checked = true;
```

## Adapters

An adapter is a plain object implementing the `Adapter` interface. It
abstracts all data-source access so TreeWalker stays generic.

```ts
interface Adapter {
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
  string?(item: unknown): string;   // optional: used by toString augmentation
  value?(item: unknown): unknown;   // optional: used by valueOf augmentation
}
```

### children-adapter — objects with `children` arrays

```js
import createAdapter from '@actualwave/tree-walker/children-adapter';

// default: nodes have { name, children } shape
const adapter = createAdapter();

// custom accessors
const adapter = createAdapter(
  (node) => node.id,           // getName
  (node) => node.items ?? [],  // getChildren
);
```

### denormalize-adapter — normalised store (string keys → records)

Traversal uses string keys; nodes are looked up in a flat store object.

```js
import { createAdapter } from '@actualwave/tree-walker/denormalize-adapter';

const store = {
  root:    { children: ['a', 'b'] },
  a:       { children: ['c'] },
  b:       { children: [] },
  c:       { children: [] },
};

const adapter = createAdapter(() => store);
const root = create('root', adapter);

root.a.name();   // 'a'
root.a.c.name(); // 'c'
```

### property-handlers — `$`-prefix read/write

```js
import { createHandlers, createROHandlers } from '@actualwave/tree-walker/property-handlers';

// read-write access to node properties
const handlers = createHandlers();

// read-only access
const roHandlers = createROHandlers();

// custom data getter — receives the raw node, returns a record to read/write
const handlers = createHandlers((node) => node.metadata);

setNamePrefix('$', handlers);
```

## API Reference

### `create(root, adapter)`

Creates a wrapped proxy for `root` using the given `adapter`. Returns an opaque
proxy — do not rely on its type.

### `addAugmentations(map)`

Registers augmentation functions. Keys are method names; values are
`(node, adapter, args, utils) => unknown`. Calling `node.foo()` on a proxy
invokes the augmentation registered as `'foo'`.

### `resetAugmentations()`

Removes all registered augmentations (including built-ins). Re-register any
you need after calling this.

### `setNamePrefix(prefix, handlers)`

Registers a one-character prefix that intercepts property access. The
`handlers` object may provide `get`, `has`, `set`, and `deleteProperty`
handler functions.

## Common Patterns

### Wrap results before returning from augmentations

Use `utils.wrap(value, adapter)` inside a custom augmentation to ensure the
returned value is itself a traversable proxy (if the value is a node or list).

```js
addAugmentations({
  firstChild: (node, adapter, _args, utils) =>
    utils.wrap(adapter.getChildAt(node, 0), adapter),
});
```

### Augmentation receives raw node, not proxy

Inside an augmentation, `node` is the **raw** underlying value (e.g. the plain
object or DOM element), not a proxy. Access it directly or through the adapter.

### Integer keys resolve the pending child

`root.items` does not fetch the children yet; `root.items[0]` does. If you
need the full child list as a wrapped proxy, call `root.items.children()` or
`root.items.at(0)`.
