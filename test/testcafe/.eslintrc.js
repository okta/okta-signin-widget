/* eslint-env node */
module.exports = {
  plugins: [
    'testcafe-extended'
  ],
  extends: [
    'plugin:testcafe-extended/recommended'
  ],
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
    'new-cap': 0, // for testcafe functions like RequestLogger, RequestMock
    'semi': 2,
    'max-len': 0,
    'max-statements': 0,
  },
};
