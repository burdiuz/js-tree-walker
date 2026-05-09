---
name: dom-walker
description: >
  Fluent ES6 Proxy API for traversing and manipulating HTML DOM using dot
  notation. Built on TreeWalker. Use when you need to navigate the DOM by
  tag name, query elements, read/set attributes or properties, listen to
  events, or iterate over matched element sets — all without boilerplate.
license: MIT
compatibility: Modern browsers with ES2022 support. Requires a live DOM (window/document).
metadata:
  package: "@actualwave/dom-walker"
  npm: https://www.npmjs.com/package/@actualwave/dom-walker
---

## Overview

DOMWalker wraps a DOM element (or the document root) in an ES6 Proxy. Child
elements are accessed by lowercase tag name; calling a name as a function
invokes an augmentation (a named helper method). Results are always wrapped
proxies, so the API chains naturally.

## Installation

```bash
npm install @actualwave/dom-walker
```

## Setup

```js
import { create } from '@actualwave/dom-walker';

// wrap document.firstElementChild (<html>)
const dom = create();

// wrap a specific element
const dom = create(document.getElementById('app'));

// wrap using a CSS selector string
const dom = create('#app');

// wrap document — resolves to document.firstElementChild
const dom = create(document);
```

## Traversal

Access children by lowercase tag name. Each step returns a new wrapped proxy.
When multiple siblings share the same tag, the result is a wrapped list.

```js
const dom = create();

dom.html.body;                   // <body>
dom.html.body.header;            // first <header> inside <body>
dom.html.body.ul.li;             // all <li> inside <ul> (list proxy)
dom.html.body.ul.li[0];          // first <li>
dom.html.body.ul.li[2];          // third <li>
```

> **Note:** traversal of a multi-element list follows only the first node.
> Use list augmentations (`forEach`, `map`, `filter`) to operate on all nodes,
> or `descendants()` to collect matching elements across the whole subtree.

## Augmentations

### Node Augmentations

Available on any wrapped single node:

```js
const section = dom.html.body.section;

section.name();               // lowercase tag name, e.g. 'section'
section.children();           // all direct children, wrapped
section.children('div');      // direct <div> children, wrapped
section.childAt(0);           // first child, wrapped
section.descendants();        // every descendant, wrapped
section.descendants('h2');    // all <h2> descendants (case-insensitive)
section.parent();             // parent element, wrapped
section.root();               // root of the DOM tree, wrapped
```

### List Augmentations

When the current proxy holds multiple nodes:

```js
const items = dom.html.body.ul.li;

items.length();                                 // number of <li> elements
items.at(1);                                    // second <li>, wrapped
items.first();                                  // first <li>, wrapped
items.forEach((item, i) => console.log(i));
items.map((item) => item.text());               // plain array of strings
items.filter((item) => item.attribute('hidden') === null);
items.reduce((acc, item) => acc + item.text(), '');
```

### Element Augmentations

Read and mutate DOM element properties:

```js
const el = dom.html.body.div;

el.name();                        // lowercase tag name
el.text();                        // innerText of the element
el.attributes();                  // NamedNodeMap of all attributes

el.attribute('id');               // get attribute
el.attribute('id', 'main');       // set attribute
el.attribute('data-x', undefined); // remove attribute

el.query('p.highlight');          // querySelector — first match, wrapped
el.queryAll('p.highlight');       // querySelectorAll — all matches, wrapped

el.parent();                      // parentElement (unwrapped Element)
el.root();                        // getRootNode() (unwrapped Node)
```

### Event Augmentations

```js
const btn = dom.html.body.button;

// on — addEventListener, returns an unsubscribe function
const off = btn.on('click', (e) => console.log('clicked', e.target));

// off — removeEventListener
btn.off('click', handler);

// emit — dispatch an event
btn.emit('click');
btn.emit(new MouseEvent('click', { bubbles: true }));

// unsubscribe via the returned function
off();
```

### `$` Prefix — Element Property Access

Prefixing any property name with `$` reads or writes the element's own
JavaScript property (not the HTML attribute):

```js
const input = dom.html.body.form.input;

input.$value;           // input.value
input.$checked;         // input.checked
input.$className;       // input.className
input.$scrollTop;       // input.scrollTop

input.$value('hello');  // sets input.value = 'hello'
input.$checked(true);   // sets input.checked = true
```

### Core Augmentations

```js
el.toString();   // string representation of the node
el.valueOf();    // underlying raw DOM Element
```

## Sub-Entry Imports

```js
// adapter only — implement a custom create() setup
import BrowserDOMAdapter from '@actualwave/dom-walker/adapter';

// augmentation objects only — register selectively or extend
import {
  eventAugmentations,
  elementAugmentations,
} from '@actualwave/dom-walker/augmentations';
```

## Extending Augmentations

```js
import { addAugmentations, resetAugmentations } from '@actualwave/dom-walker';

addAugmentations({
  outerHTML: (node, adapter) => adapter.toNode(node)?.outerHTML ?? '',
  hasClass: (node, adapter, [cls]) =>
    adapter.toNode(node)?.classList.contains(cls) ?? false,
  toggleClass: (node, adapter, [cls]) =>
    adapter.toNode(node)?.classList.toggle(cls),
});

const dom = create();
dom.html.body.section.outerHTML();          // full HTML string
dom.html.body.section.hasClass('active');   // boolean
dom.html.body.section.toggleClass('open');  // toggle
```

## Custom Adapter

Pass a custom adapter to `create()` to override specific behaviours:

```js
import { create } from '@actualwave/dom-walker';
import BrowserDOMAdapter from '@actualwave/dom-walker/adapter';

const myAdapter = {
  ...BrowserDOMAdapter,
  getName: (node) => node.localName,  // override as needed
};

const dom = create(document.body, myAdapter);
```

## UMD / Browser (no bundler)

```html
<script src="dom-walker.umd.js"></script>
<script>
  const { create } = DOMWalker;
  const dom = create();

  // traverse
  console.log(dom.html.body.valueOf().tagName); // 'BODY'

  // list all <h2> text
  dom.html.body.descendants('h2').forEach((h) => console.log(h.text()));
</script>
```

Global `DOMWalker` exposes: `create`, `addAugmentations`, `resetAugmentations`,
`setNamePrefix`, `BrowserDOMAdapter`, `augmentations.eventAugmentations`,
`augmentations.elementAugmentations`.

## API Reference

### `create(root?, adapter?)`

| Argument | Type | Default | Description |
|---|---|---|---|
| `root` | `Element \| string \| Document` | `document` | Element, CSS selector string, or document |
| `adapter` | `Adapter` | `BrowserDOMAdapter` | Adapter used for traversal |

Returns an opaque proxy. Do not rely on its type.

### `addAugmentations(map)`

Registers additional augmentations accessible on all wrapped nodes.

### `resetAugmentations()`

Removes all augmentations. Re-register any you need after calling this.

### `setNamePrefix(prefix, handlers)`

Registers a one-character property prefix that activates a handler set.
The built-in `$` prefix uses `createHandlers()` from
`@actualwave/tree-walker/property-handlers` to provide element property access.

## Common Patterns

### Collect text from all matching elements

```js
const headings = create().html.body.descendants('h2');
const texts = headings.map((h) => h.text());
```

### Check element presence before acting

```js
const modal = create('#modal');
if ('button' in modal) {
  modal.button.on('click', close);
}
```

### Batch-remove a class

```js
create('.card').filter((card) => card.hasClass('selected'))
  .forEach((card) => card.toggleClass('selected'));
```

### Event delegation with unsubscribe

```js
const cleanup = create('#list').on('click', (e) => {
  if (e.target.matches('li')) handleClick(e.target);
});
// later:
cleanup();
```
