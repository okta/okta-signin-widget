// Used by babel-jest
const presets = [
  ['@babel/preset-env', {
    exclude: [
      '@babel/plugin-transform-regenerator'
    ]
  }]
];
const plugins = [
  './packages/@okta/babel-plugin-handlebars-inline-precompile',
];

module.exports = { presets, plugins };