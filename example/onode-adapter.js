((target) => {
  const adapter = {
    validateRoot: (item) => item,

    // list methods
    isList: (item) => item instanceof Array,
    toList: (item) => (adapter.isList(item) ? item : [item]),
    getLength: (item) => adapter.toList(item).length,
    getNodeAt: (item, index = 0) => adapter.toList(item)[index],

    // node methods
    isNode: (item) => item instanceof Object && !adapter.isList(item),
    toNode: (item) => (adapter.isList(item) ? item[0] : item),
    getName: (item) => adapter.toNode(item).name,
    hasChild: (item, name) => !!adapter.getChildrenByName(item, name).length,
    getChildren: (item) => {
      const node = adapter.toNode(item);
      return (node && node.children) || [];
    },
    getChildrenByName: (item, name) =>
      adapter
        .getChildren(item)
        .filter((child) => adapter.getName(child) === name),
    getChildAt: (item, index = 0) => adapter.toNode(item).children[index],
    getNodeParent: (item) => adapter.toNode(item).parent,
    getNodeRoot: (item) => adapter.toNode(item).root,
  };

  target.ONodeAdapter = adapter;
})(window);
