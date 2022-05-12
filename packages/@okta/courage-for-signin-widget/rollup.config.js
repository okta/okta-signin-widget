import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import amd from 'rollup-plugin-amd';
import replace from '@rollup/plugin-replace';

const NODE_MODULES = path.resolve(__dirname, 'node_modules');
const NODE_MODULES_SRC = path.resolve(NODE_MODULES, '@okta');
const NODE_MODULES_DEST = path.resolve(__dirname, '..');
const COURAGE_DIST = path.resolve(NODE_MODULES_SRC, 'courage/dist');
const I18N_DIR = path.resolve(NODE_MODULES_DEST, 'i18n');

const extensions = ['.js', '.ts'];
const external = [
  'qtip',
  'okta-i18n-bundles',
  'clipboard'
];

export default {
  input: 'src/index.ts',
  output: {
    dir: './target/esm',
    format: 'es',
    sourcemap: false,
    preserveModules: true
  },
  preserveSymlinks: true,
  moduleContext: (id) => {
    // run yarn build:babel to see output pre-rollup
    if (/.*chosen\.jquery\.js$/.test(id)) {
      return '$'; // the variable holding the result of import('jquery')
    }
    return 'undefined';
  },
  external,
  plugins: [
    amd({
      // babel-plugin-transform-amd-to-commonjs cannot handle this one, process before babel
      include: 'src/courage/vendor/plugins/chosen.jquery.js'
    }),
    babel({
      babelHelpers: 'bundled',
      extensions
    }),
    // Path output from babel
    replace({
      // patch backbone so it uses jQuery default export
      include: ['**/courage/vendor/lib/backbone.js'],
      values: {
        // import named symbol (run yarn build:babel to see output pre-rollup)
        '(function (factory) {': `const jQuery = require('jquery');\n(function (factory) {`,
        // remove require, replace with imported symbol
        'require(\'jquery\')': 'jQuery'
      },
      delimiters: ['', ''],
      preventAssignment: true
    }),
    replace({
      // remove ConfirmationDialog which is not used in the widget
      include: ['**/courage/util/BaseRouter.*'],
      values: {
        '../views/components/ConfirmationDialog': '../../empty'
      },
      delimiters: ['', ''],
      preventAssignment: true
    }),
    replace({
      // remove moment / helper-date
      include: ['**/courage/util/handlebars-wrapper.*'],
      values: {
        'import "./handlebars/helper-date";': '// helper-date removed by rollup'
      },
      delimiters: ['', ''],
      preventAssignment: true
    }),
    commonjs(),
    resolve({
      extensions,
      rootDir: __dirname,
      jail: __dirname
    }),
    copy({
      targets: [
        {
          src: `${NODE_MODULES_SRC}/babel-plugin-handlebars-inline-precompile`,
          dest: `${NODE_MODULES_DEST}`
        },
        {
          src: `${NODE_MODULES_SRC}/eslint-plugin-okta-ui/lib/rules/no-bare-templates.js`,
          dest: `${NODE_MODULES_DEST}/eslint-plugin-okta-ui/lib/rules`,
        },
        {
          src: `${COURAGE_DIST}/properties/translations/country*.properties`,
          dest: `${I18N_DIR}/dist/properties`,
        }
      ]
    }),
    visualizer({
      filename: '../courage-dist/esm.visualizer.html',
    })
  ]
};