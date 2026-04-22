import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { visualizer } from 'rollup-plugin-visualizer';
import multiInput from 'rollup-plugin-multi-input';
import path from 'path';

const ESM_OUTPUT_DIR = './target/esm';
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

let entries = {
  'default': 'src/exports/default.ts',
  'classic': 'src/exports/classic.ts',
  'oie': 'src/exports/oie.ts',
};
let preserveModules = true;
const combinedOutputDir = true; // all entries share an output dir
function getOuptutDir(entryName) {
  return combinedOutputDir ? `${ESM_OUTPUT_DIR}` : `${ESM_OUTPUT_DIR}/${entryName}`;
}

// if ENTRY env var is passed, filter the entries to include only the named ENTRY
if (process.env.ENTRY) {
  entries = {
    [process.env.ENTRY]: entries[process.env.ENTRY]
  };
}


const output = {
  dir: `${ESM_OUTPUT_DIR}`,
  format: 'es',
  sourcemap: true,
  preserveModules
};

const getPlugins = (entryName) => {
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
    multiInput({ 
      relative: 'src/',
    })
  ];
  
  // if ANALZYE env var is passed, output analyzer html
  if (process.env.ANALYZE) {
    plugins = plugins.concat([
      visualizer({
        sourcemap: true,
        projectRoot: path.join(__dirname, './src'),
        filename: `${ESM_OUTPUT_DIR}/${entryName}.analzyer.html`,
        template: 'treemap' // sunburst | treemap | network
      }),
    ]);
  }

  return plugins;
};

// Optimization: can we run once?
if (combinedOutputDir && !process.env.ANALYZE) {
  const combined = Object.values(entries);
  entries = { combined };
}

export default function buildRollupConfig(callbackFn) {
  return Object.keys(entries).reduce((res, entryName) => {
    const entryValue = entries[entryName];
    let config = {
      input: Array.isArray(entryValue) ? entryValue : [entryValue],
      external,
      plugins: getPlugins(entryName),
      output: [
        {
          ...output,
          dir: getOuptutDir(entryName)
        }
      ]
    };
    config = callbackFn ? callbackFn(config): config;
    return res.concat([config]);
  }, []);
}