const createResolvePath = require('babel-plugin-tsconfig-paths-module-resolver').createResolvePath;
const defaultResolvePath = createResolvePath();
function customResolvePath(sourceFile, currentFile, opts) {
  // Do not transform handlebars-inline-precompile
  if (sourceFile === 'handlebars-inline-precompile') {
    return sourceFile;
  }
  return defaultResolvePath(sourceFile, currentFile, opts);
}

const presets = [
  '@babel/preset-typescript', // must run before preset-env: https://github.com/babel/babel/issues/12066
];

const COURAGE_DIST = './packages/@okta/courage-dist/esm';

const plugins = [
  './packages/@okta/babel-plugin-handlebars-inline-precompile', // should always come first
  // tsconfig.paths replaces babel/webpack aliases
  ['tsconfig-paths-module-resolver', {
    resolvePath: customResolvePath,
    alias: {
      '^handlebars(/runtime)?$': `${COURAGE_DIST}/lib/handlebars/dist/cjs/handlebars.runtime.js`,
      '^backbone$': `${COURAGE_DIST}/src/courage/vendor/backbone.js`,
      '^underscore$': `${COURAGE_DIST}/lib/underscore/underscore-min.js`
    }
  }],
  ['transform-amd-to-commonjs', {
    restrictToTopLevelDefine: false
  }],
  '@babel/plugin-proposal-optional-chaining',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-nullish-coalescing-operator', // double question mark
  '@babel/plugin-transform-shorthand-properties' // ES shorthand functions cannot be used as constructors
];

const assumptions = {
  setPublicClassFields: true
};

// Used by babel-jest
if (process.env.NODE_ENV === 'test') {
  presets.unshift(
    ['@babel/preset-env', {
      exclude: [
        '@babel/plugin-transform-regenerator'
      ]
    }]
  );
}

module.exports = {
  presets,
  plugins,
  assumptions,
  sourceMaps: true
};