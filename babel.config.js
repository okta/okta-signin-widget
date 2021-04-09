// Used by babel-jest
const presets = [
  ['@babel/preset-env', {
    exclude: [
      '@babel/plugin-transform-regenerator'
    ]
  }],
  '@babel/preset-typescript', // must run before preset-env: https://github.com/babel/babel/issues/12066
];
const plugins = [
  './packages/@okta/babel-plugin-handlebars-inline-precompile',
];

module.exports = { presets, plugins };