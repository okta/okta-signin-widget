// Lint to find missing dependencies and externals
module.exports = {
  parser: 'babel-eslint',
  plugins: [
    'import',
    'dirs'
  ],
  extends: [
    'plugin:import/recommended',
  ],
  settings: {
    polyfills: [
      'Promise' // Assume Promise is polyfilled for IE11
    ]
  },
  rules: {
    // do not allow node_modules in file path in ESM dist
    'dirs/dirnames': [2, { 'pattern': '^(?!.*node_modules).*$' }],

    'import/no-named-as-default-member': 'off'
  }
};
