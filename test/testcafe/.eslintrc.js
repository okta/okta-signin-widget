/* eslint-env node */
module.exports = {
  'extends': [
    'eslint:recommended',
    'plugin:testcafe/recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 2017,
    'sourceType': 'module'
  },
  'plugins': [
    'testcafe'
  ],
  "env": {
    "browser": true,
  },
  'rules': {
    'semi': 2,
    'max-len': 0,
  },
  'root': true
};
