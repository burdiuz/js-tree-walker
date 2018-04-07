# TreeWalker

This is wireframe based on ES6 Proxies for making tree traversing APIs.
You may check ready to use implementation DOMWalker for better understanding.
Inspired by [E4X(ECMAScript for XML)](https://en.wikipedia.org/wiki/ECMAScript_for_XML) and its ActionScript 3 implementation. RIP.

To use TreeWalker, developer should implement adapter for source data structure,
additionally augmentations and prefixes could be used to enrich final API.

Augmentations and prefixes should interact with data structure only by using adapter
methods, this way they will be kept agnostic to data structures and can be used with
any adapter i.e. data structure.

### TODO add API docs


