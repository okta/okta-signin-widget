/* global module */
module.exports = {
  'extends': ['eslint:recommended'],
  'env': {
    'browser': true,
    'jasmine': true,
    'node': true,
    'amd': true
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2017
  },
  'globals': {
    'spyOnEvent': false,
    'JSON': true,
    'DEBUG': true
  },
  'rules': {
    'camelcase': 2,
    'complexity': [2, 10],
    'curly': 2,
    'eqeqeq': 2,
    'guard-for-in': 2,
    'indent': [2, 2, { 'VariableDeclarator': 2 } ],
    'max-depth': [2, 2],
    'max-len': [2, 120],
    'max-params': [2, 10],
    'max-statements': [2, 20],
    'new-cap': [2, { 'properties': false, 'capIsNewExceptions': ['Q'] }],
    'no-caller': 2,
    'no-eval': 2,
    'no-implied-eval': 2,
    'no-new': 2,
    'no-unused-expressions': [2, { 'allowShortCircuit': true, 'allowTernary': true }],
    'no-use-before-define': [2, 'nofunc'],
    'quotes': [2, 'single'],
    'semi': 2,
    'space-before-function-paren': 2,
    'strict': 0,
  },
  'root': true
};
