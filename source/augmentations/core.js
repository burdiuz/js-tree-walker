const toString = (node) => node.toString();
const valueOf = (node) => node;

export default {
  toString,
  valueOf,
  [Symbol.toPrimitive]: (node) => node,
};
