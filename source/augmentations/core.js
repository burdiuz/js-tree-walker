const toString = (node, adapter) =>
  adapter.string ? adapter.string(node) : node.toString();
const valueOf = (node, adapter) => (adapter.value ? adapter.value(node) : node);

export default {
  toString,
  valueOf,
};
