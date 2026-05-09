# DOM Walker

Library built on ES6 Proxies using [TreeWalker](https://github.com/burdiuz/js-tree-walker) for traversing HTML DOM. Provides a fluent proxy-based API for navigating and querying DOM trees.

## Installation

```bash
npm install @actualwave/dom-walker
```

## Usage

```js
import { create } from '@actualwave/dom-walker';

// wrap document root (document.firstElementChild by default)
const dom = create();

// wrap a specific element
const dom = create(document.getElementById('app'));

// wrap using a CSS selector string
const dom = create('#app');

// wrap using document directly — resolves to document.firstElementChild
const dom = create(document);
```

## Traversal

Child elements are accessed by tag name (case-insensitive). Each step returns a new wrapped node.

```js
const dom = create();

// access children by tag name
const body = dom.html.body;
const header = dom.html.body.header;

// numeric index access returns a wrapped node from a list
const firstDiv = dom.html.body.div[0];
const secondDiv = dom.html.body.div[1];
```

When a tag name matches multiple siblings, the result is a wrapped list of all matching nodes.

## Node Augmentations

Methods available on any wrapped node:

```js
const dom = create();

// name — tag name of the current node
dom.html.body.name(); // "BODY"

// children — direct child nodes, optionally filtered by tag name
dom.html.body.children();          // all children
dom.html.body.children('section'); // only <section> children

// childAt — child at a specific index
dom.html.body.childAt(0); // first child
dom.html.body.childAt(2); // third child

// descendants — all descendants, optionally filtered by tag name
dom.html.body.descendants();      // every descendant
dom.html.body.descendants('div'); // all <div> descendants (case-insensitive)

// parent — parent of the current node
dom.html.body.header.parent();

// root — root node of the tree
dom.html.body.header.root();
```

## List Augmentations

When the current node is a list (multiple matches), these methods are available:

```js
const items = dom.html.body.ul.li;

// length — number of nodes in the list
items.length(); // e.g. 5

// at — node at a specific index
items.at(0); // first <li>
items.at(2); // third <li>

// first — first node in the list
items.first();

// forEach — iterate over each node
items.forEach((item, index) => {
  console.log(index, item.text());
});

// map — transform each node
const texts = items.map((item) => item.text());

// filter — keep nodes matching a predicate
const visible = items.filter((item) => item.attribute('hidden') === null);

// reduce — accumulate a value
const combined = items.reduce((acc, item) => acc + item.text(), '');
```

## Element Augmentations

Methods for reading and manipulating DOM elements:

```js
const dom = create();
const section = dom.html.body.section;

// name — tag name
section.name(); // "SECTION"

// text — innerText of the element
section.text(); // "Hello world"

// attributes — NamedNodeMap of all attributes
section.attributes();

// attribute — get, set, or remove an attribute
section.attribute('id');              // get
section.attribute('id', 'main');      // set
section.attribute('data-value', undefined); // remove

// query / queryAll — CSS selector search within the node
section.query('p.highlight');    // first match, wrapped
section.queryAll('p.highlight'); // all matches, wrapped

// parent — parent element (unwrapped)
section.parent();

// root — root node (unwrapped)
section.root();
```

## Event Augmentations

Attach and dispatch DOM events:

```js
const dom = create();
const btn = dom.html.body.button;

// on — addEventListener, returns an unsubscribe function
const unsubscribe = btn.on('click', (event) => {
  console.log('clicked', event.target);
});

// off — removeEventListener
btn.off('click', handler);

// emit — dispatch an event (accepts an Event instance or event type string)
btn.emit('click');
btn.emit(new MouseEvent('click', { bubbles: true }));

// unsubscribe via the returned function
unsubscribe();
```

## `$` Prefix — Property Handlers

Prefixing a property name with `$` gives access to element properties rather than child traversal:

```js
const dom = create();
const input = dom.html.body.form.input;

// read element property
input.$value;       // input.value
input.$checked;     // input.checked
input.$className;   // input.className
input.$scrollTop;   // input.scrollTop

// set element property (returns a setter function)
input.$value('hello world');
input.$checked(true);
```

## Core Augmentations

```js
const dom = create();
const node = dom.html.body;

// toString — string representation of the node
node.toString();

// valueOf — underlying raw node value
node.valueOf();
```

## Sub-Entry Imports

Individual sub-entries can be imported independently:

```js
// BrowserDOM adapter only
import BrowserDOMAdapter from '@actualwave/dom-walker/adapter';

// augmentations only
import { eventAugmentations, elementAugmentations } from '@actualwave/dom-walker/augmentations';
```

## Custom Adapter

Pass a custom adapter as the second argument to `create()`:

```js
import { create } from '@actualwave/dom-walker';
import BrowserDOMAdapter from '@actualwave/dom-walker/adapter';

const myAdapter = {
  ...BrowserDOMAdapter,
  getName: (node) => node.localName, // override specific methods
};

const dom = create(document.body, myAdapter);
```

## Extending Augmentations

```js
import { addAugmentations, resetAugmentations } from '@actualwave/dom-walker';

// add custom augmentations
addAugmentations({
  html: (node, adapter) => adapter.toNode(node)?.outerHTML ?? '',
  hasClass: (node, adapter, [cls]) => adapter.toNode(node)?.classList.contains(cls) ?? false,
});

const dom = create();
dom.html.body.section.html();           // outerHTML string
dom.html.body.section.hasClass('hero'); // true / false

// reset to defaults
resetAugmentations();
```

## UMD / Browser

A single bundled UMD file (including all sub-entries) is available for direct browser use:

```html
<script src="node_modules/@actualwave/dom-walker/dom-walker.umd.js"></script>
<script>
  const { create } = DOMWalker;
  const dom = create();
  console.log(dom.html.body.name()); // "BODY"
</script>
```

The UMD global exposes:
- `DOMWalker.create`
- `DOMWalker.addAugmentations`
- `DOMWalker.resetAugmentations`
- `DOMWalker.setNamePrefix`
- `DOMWalker.BrowserDOMAdapter`
- `DOMWalker.augmentations.eventAugmentations`
- `DOMWalker.augmentations.elementAugmentations`

## API Reference

### `create(root?, adapter?)`

Creates a wrapped DOM walker.

| Argument | Type | Default | Description |
|---|---|---|---|
| `root` | `Element \| string \| Document` | `document` | Root element, CSS selector, or document |
| `adapter` | `Adapter` | `BrowserDOMAdapter` | Adapter used for DOM traversal |

### `addAugmentations(augmentations)`

Registers additional augmentations available on all wrapped nodes.

### `resetAugmentations()`

Resets all augmentations back to the built-in defaults.

### `setNamePrefix(prefix, handlers)`

Registers a property name prefix that activates a handler set. The built-in `$` prefix provides element property access.
