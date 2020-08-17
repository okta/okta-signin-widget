/* eslint-env node */
module.exports = {
  'parserOptions': {
    'ecmaVersion': 2017,
    'sourceType': 'module'
  },
  globals: {
    fixture: false,
    test: false,
  },
  'env': {
    'browser': true,
    'es6': true,
  },
  'rules': {
    'space-before-function-paren': 0, // remove me after clear up root eslintrc.
    'new-cap': 0, // for testcafe functions like RequestLogger, RequestMock
    'semi': 2,
    'max-len': 0,
    'max-statements': 0,
  },
};
