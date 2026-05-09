import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const extensions = ['.ts', '.js'];

const createPlugins = () => [
  resolve({ extensions, exportConditions: ['source'] }),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    extensions,
    presets: ['@babel/preset-typescript'],
  }),
  commonjs(),
  json(),
];

const createCopyPlugin = () =>
  copy({
    targets: [
      { src: 'README.md', dest: 'dist' },
      { src: 'SKILL.md', dest: 'dist' },
      { src: 'package.json', dest: 'dist' },
      { src: 'LICENSE', dest: 'dist' },
    ],
  });

export const createConfigs = ({
  name,
  file = 'dist/index',
  input = 'src/index.ts',
  umdFileName = 'dist/index',
  umdInput,
  external = [],
  cjsOnly = false,
  copyFiles = false,
}) => {
  const firstPlugins = createPlugins();
  if (copyFiles) {
    firstPlugins.push(createCopyPlugin());
  }

  const configs = [
    {
      input,
      output: {
        file: `${file}.js`,
        sourcemap: true,
        exports: 'named',
        name,
        format: 'cjs',
      },
      plugins: firstPlugins,
      external,
    },
  ];

  if (!cjsOnly) {
    configs.push({
      input: umdInput || input,
      output: {
        file: `${umdFileName}.umd.js`,
        sourcemap: true,
        exports: 'named',
        name,
        format: 'umd',
      },
      plugins: [...createPlugins(), terser()],
    });
  }

  return configs;
};
