# TreeWalker
[![Build Status](https://travis-ci.org/burdiuz/js-tree-walker.svg?branch=master)](https://travis-ci.org/burdiuz/js-tree-walker) [![Coverage Status](https://coveralls.io/repos/github/burdiuz/js-tree-walker/badge.svg?branch=master)](https://coveralls.io/github/burdiuz/js-tree-walker?branch=master)
This is wireframe based on ES6 Proxies for making tree traversing APIs.  
You may check ready to use implementation DOMWalker for better understanding.  
Inspired by [E4X(ECMAScript for XML)](https://en.wikipedia.org/wiki/ECMAScript_for_XML) and its ActionScript 3 implementation. RIP.

## Installation

Via NPM
```
npm install @actualwave/tree-walker --save
```
Or Yarn
```
yarn add @actualwave/tree-walker
```

After importing TreeWalker, it needs to be configured to specify default adapter and augmentations, prefixes. Without any configurations you will be able to access child nodes
```
const root = create(mySourceTreeData);
const myDescendants = root.child.otherChild.descendant;
```
but no methods can be called on them except
 * valueOf() -- to return raw data(source node)
 * toString() -- to call `toString()` method on source node

## How it works
When you call `create()` function, you pass source data and adapter object. These two will be packed into [wrapper Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Proxy object works with adapter(with its `getChildren()`, `getChildrenByName()` and other methods) to retrieve a list of child nodes when requested  by name or index.
```
const root = create(mySourceTreeData);
const myDescendants = root.child.otherChild.descendant;
const myThirdChild = root.child[2];
const jerries = myDescendants.jerry;
```
With this code, on line 1, Proxy object for root node of the source tree is created. On line 2 additional Proxies are created for `child`, `otherChild` and proxy for `descendant` nodes is stored in `myDescendants`.   

When requesting a child node by name, it returns not one node but a list of all child nodes with same name, but when children requested from the list(like `myDescendants.jerry`), Proxy will take first node from this list and return its children.   
So, if you have a list of 2 nodes where first does not have children
```
const root = <source data>;
/**
node structure
    root
    /   \
one[0] one[1]
        / \
   two[0] two[1]
*/

const rootProxy = create(root, myAdapter);
const twoProxy = rootProxy.one.two;
```
`twoProxy` will contain empty list, because only first `one` node is checked for children. Here are equivalent code
```
const rootProxy = create(root, myAdapter);
const twoProxy = rootProxy.one[0].two;
```
To retrieve children from second `one` node you should specify it, like this
```
const rootProxy = create(root, myAdapter);
const twoProxy = rootProxy.one[1].two;
```
Now we will have two `two` nodes in `twoProxy`.

Adapter should always return empty list if no nodes found
```
const rootProxy = create(root, myAdapter);
const veryDeepNode = rootProxy.one.five.seven.anyOther.dont.know.if.it.exists;
```
in this way you can request any descendants from any depth without worrying about their existence.


## Usage
  
To use TreeWalker, it should be supplied with two required components:
1. Source data - Tree data structure, that you want to work with
2. Adapter - Provides standardized API to work with source data
Additionally augmentations and prefixes could be used to enrich final API.

Before using, TreeWalker must be created via factory function `create()`, it returns source data wrapped into a Proxy wrapper(just "wrapper" in text below) which will use adapter to get children nodes, call augmentations and apply prefixes. TreeWrapper is read-only tree traverser, so it has only `get`, `has` and `apply` traps, `set` or `deleteProperty` are not implemented. But you may create an augmentation for source data mutations(explained below).
```
import { create } from '@actualwave/tree-walker';

// root is a wrapped "source" node
const root  =  create(source, myAdapter);
```
After instantiating, you can access child nodes as properties and augmentations as methods. Its possible to have methods and nodes of same name, because, when wrapper is created for child object, it stores parent node and name of child node.   

 If property is requested from wrapper, it will return new wrapper with that node and name of the property:
```
// stores { target: node, name: "parent" }
const parent = node.parent;
// stores { target: parent, name: "otherChild" }
const child = parent.otherChild;
// stores { target: child, name: "sibblings" }
const sibblings = child.sibblings;
```
or
```
// stores { target: otherChild, name: "sibblings" }
const sibblings = node.parent.otherChild.sibblings;
```
If `sibblings` node from example above will be replaced in a source tree or removed, your wrapper object will reflect changes.

When requesting a child, wrapper uses `getChildren()` and `getChildrenByName()` methods of adapter, so its always a list of nodes, even if single child available -- it will be a list with one child.
```
const firstSibbling = sibblings[0];
```
When requesting a child from wrapped list of nodes, wrapper will request children of first node from the list.
 
> Adapter methods `toList()`, `getChildren()` and `getChildrenByName()` must always return list of nodes. In case of 0 nodes it should be empty list. Single node must have length 1 and, if requested, index 0 must return same node.

If you wish to have specific node in a wrapper, you can request it by specifying index:
```
// stores { target: otherChild }
const sibblings = node.parent.otherChild[0];
```
In this case wrapper will contain one node resolved by name.

If wrapper is being called as function, it will look for augmentation registered for that name:
```
// stores { target: node, name: "parent" }
const parent = node.parent;
// will call augmentation
console.log(parent());
```
or
```
// will call augmentation "descendants" on "otherChild" node
console.log(node.child.otherChild.descendants());
```
Important to say, that wrapper has set of restricted names for child nodes
**constructor**
**prototype**
Values of these properties will be requested directly from source node or list and returned as is.

## API
* **create(rootNode, adapter)** -- create wrapper for node and use supplied adapter to work with it
* **setDefaultAdapter(adapter)** -- specifying default adapter makes optional defining adapter in `create()` factory function
* **getDefaultAdapter(adapter)** -- get default adapter
* **addAugmentations({...})** -- add augmentations to the pool, accepts an object with functions, name of the property will be used as name of augmentation.
```
addAugmentations({
    children: (node, adapter, utils) => {...},
    parent: (node, adapter, utils) => {...},
    name: (node, adapter, utils) => {...},
});
```
* **hasAugmentation(name)** -- check if augmentation was added
* **resetAugmentations({...})** -- remove all currently registered augmentations(including core augmentations) and, replace them with augmentations if passed
* **setNamePrefix(char, handlerFunc)** -- set prefix handler
* **isValidPrefix(char)** -- check if prefix is valid and has handler registered

## Adapter
Adapter is an object with set of methods required by wrapper and augmentations to work with source data. Each instance of wrapper and augmentation calls receive instance of adapter as well as target node or list of nodes to pass into adapter. All calls to source data should be done via adapter API.

Adapter API(required methods marked with bold)
* **validateRoot(item)** -- is called before crating wrapper for root node, could accept anything and must return root node.
* **isList(item)** -- check if item is a list
* **toList(item)** -- convert anything to list, node to list with one item or nothing to empty list
* getLength(item) -- returns length of the item, in case of node it should be 1
* **getNodeAt(item, index  =  0)** -- return node from a list by its index
* **isNode(item)** -- check if item is single node
* **toNode(item)** -- convert anything to node, if possible. If list, get first node from it
* getName(item) -- return name of the node
* hasChild(item, name) -- check if node has children with specified name
* **getChildren(item)** -- get list of all children from node
* **getChildrenByName(item, name)** -- get list of children with specified name
* getChildAt: (item, index  =  0) -- get child of the node by index
* getNodeParent(item) -- get node parent
* getNodeRoot(item) -- get root node of the tree

All methods should work equally with lists and nodes, if it requires node but was supplied with list, it should get first node from the list and continue and vice versa -- if list is required but node supplied, convert it to list with one node and proceed.

> You are free to add any methods or properties to adapter for your custom augmentations, but its not recommended to change signature of described here methods.

## Augmentations
Augmentations are simple functions which receive set of arguments and result with any kind of data(not limited to nodes). Augmentations work only when called as function, otherwise it's treated as wrapped node:
```
// add "children" augmentation
addAugmentations({
	 children: (node, adapter, [childName], utils) => {
		let  list;
	
		if (childName) {
			list  =  adapter.getChildrenByName(node, childName);
		} else {
			list  =  adapter.getChildren(node);
		}
	
		return  utils.wrap(list, adapter);
	},
}};

// now augmentation may be called from any wrapped node
const root = create(source, myAdapter);

// list of "children" nodes
const children1 = root.children;

// result of "children" augmentation call
const children2 = root.children();
```
When wrapper received a function call, it checks for available augmentations and if its available, its being called. In other cases it will act as node list retrieved by name, so this will work too.
```
// result of "children" augmentation call
const children2 = children1();
```
Because wrapper in `children1` have stored its parent `root` node and `children` name.

TreeWalker supplied with set of basic augmentations:
#### coreAugmentations
There are only two augmentations `toString()` and `valueOf()`, they are pre-applied.
 * **valueOf():any** -- Unwrap source node or list of nodes and return it
 * **toString():String** -- Call `toString()` method on source node

#### nodeAugmentations
Set of augmentations to work with nodes and their children.
* **children(name:String?):WrappedNode[]** - List of all children nodes, if name is supplied, list will be filtered by name.
* **descendants(name:String?):WrappedNode[]** -  List of all descendant nodes, if name is supplied, list will be filtered by name.
* **childAt (index:Number=0):WrappedNode** - Child node at index
* **root():WrappedNode** - Root node of the tree
* **parent():WrappedNode** - Parent node

#### listAugmentations
Set of augmentations to work with lists.
* **length():Number** - Length of the list, will return 1 for single wrapped node
* **at(index:Number=0):WrappedNode** - Get item from list by index, can be called on single node as on list with one item
* **first():WrappedNode** - Get first item from the list, can be called in single node, will return itself
* **filter(handler:Function):WrappedNode[]** - Filter list of nodes, will return filtered list
* **map(handler:Function):any[]** - Map list of nodes, will return list with map results for each node
* **reduce(handler:Function, initialValue:any?):any** - Reduce list of nodes will return final value


## Prefixes
Prefix is always a one symbol string, any character. It registers a handler which will be called when property which prefixed by that symbol was requested(`get` Proxy trap).
For example, every node in our tree has some `data` object which holds additional properties of the node. We register such handler:
```
const  dataPrefixGetHandler  = (target, adapter, [name]) => {
	const  node  =  adapter.toNode(target);
	return  node.data  ?  node.data[name] :  undefined;
};

setNamePrefix("$", dataPrefixGetHandler);
```
Handler receives source node, adapter, list of arguments in case of function call and utils object which contains method to wrap with Proxy.

After registering this prefix, we may access node properties stored in `data` like this
```
const root  =  create(source, myAdapter);
console.log(root.@prop1); // will request "prop1" from "data" object
console.log(root.child.@prop1); // will request "prop1" from "data" object of "child" node
```

For additional example of prefix utilization, check `js-dom-walker` project, it uses `$` as prefix for DOM node attributes.
