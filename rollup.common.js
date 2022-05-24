import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { visualizer } from 'rollup-plugin-visualizer';

const extensions = ['.js', '.ts'];

// External dependencies should also exist in the package.json dependencies
// Users of the ESM module will install their own copy
const external = [
  '@okta/okta-auth-js',
  '@sindresorhus/to-milliseconds',
  'clipboard',
  'cross-fetch',
  'jquery',
  'parse-ms',
  'q',
  'u2f-api-polyfill'
];

const input = 'src/index.ts';
const output = {
  dir: './target/esm',
  format: 'es',
  sourcemap: true,
  preserveModules: true
};
let plugins = [
  babel({
    babelHelpers: 'bundled',
    extensions
  }),
  commonjs(),
  json(),
  resolve({
    extensions,
    browser: true
  }),
  visualizer({
    filename: './target/esm/okta-sign-in.html',
    template: 'treemap' // sunburst | treemap | network
  })
];

export default {
  input,
  output,
  plugins,
  external
};
