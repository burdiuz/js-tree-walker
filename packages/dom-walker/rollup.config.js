import { createConfigs } from '../../rollup.helpers.js';

const external = (id) => id.startsWith('@actualwave/tree-walker');

export default [
  ...createConfigs({
    name: 'DOMWalker',
    external,
    umdInput: 'src/umd.ts',
    umdFileName: 'dist/dom-walker',
    copyFiles: true,
  }),
  ...createConfigs({
    name: 'BrowserDOMAdapter',
    input: 'src/adapter/index.ts',
    file: 'dist/adapter',
    cjsOnly: true,
    external,
  }),
  ...createConfigs({
    name: 'BrowserDOMAugmentations',
    input: 'src/augmentations/index.ts',
    file: 'dist/augmentations',
    cjsOnly: true,
    external,
  }),
];
