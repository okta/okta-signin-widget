module.exports = {
  extends: 'plugin:jasmine/recommended',
  plugins: [
    'jasmine'
  ],
  globals: {
    jest: true
  },
  env: {
    node: true,
    jasmine: true,
    es6: true,
  },
  rules: {
    'max-len': 0,
    'complexity': 0,
    'max-params': 0,
    'max-statements': 0,
    'jasmine/no-expect-in-setup-teardown': 0,
    'jasmine/new-line-before-expect': 0,
    'jasmine/new-line-between-declarations': 0,
    'jasmine/no-spec-dupes': [1, 'branch'],
    'jasmine/no-suite-dupes': [1, 'branch'],

    // Consider enabling these
    'jasmine/no-unsafe-spy': 0,
    'jasmine/prefer-toHaveBeenCalledWith': 0,

    // disable to prevent auto-fix
    'jasmine/prefer-promise-strategies': 0,
  }
};
