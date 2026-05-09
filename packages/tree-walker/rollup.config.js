import { createConfigs } from '../../rollup.helpers.js';

export default [
  ...createConfigs({
    name: 'TreeWalker',
    umdInput: 'src/umd.ts',
    umdFileName: 'dist/tree-walker',
    copyFiles: true,
  }),
  ...createConfigs({
    name: 'ChildrenAdapter',
    input: 'src/children-adapter/index.ts',
    file: 'dist/children-adapter',
    cjsOnly: true,
  }),
  ...createConfigs({
    name: 'DenormalizeAdapter',
    input: 'src/denormalize-adapter/index.ts',
    file: 'dist/denormalize-adapter',
    cjsOnly: true,
  }),
  ...createConfigs({
    name: 'PropertyHandlers',
    input: 'src/property-handlers/index.ts',
    file: 'dist/property-handlers',
    cjsOnly: true,
  }),
];
