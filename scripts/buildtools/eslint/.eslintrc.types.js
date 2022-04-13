module.exports = {
  'plugins': [
    '@typescript-eslint',
    'import'
  ],
  'extends': [
    'plugin:import/recommended'
  ],
  'env': {
    'browser': true,
    'node': false,
  },
  'parser': '@typescript-eslint/parser',
  'settings': {
    'import/resolver': {
      'typescript': {
        'project': './types'
      }
    },
  },
  'parserOptions': {
    'ecmaVersion': 2020,
    'sourceType': 'module',
    'project': 'types/tsconfig.json',
  },
  'rules': {
    'no-var': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-empty-interface': 0,
    'import/no-named-as-default-member': 0, // TODO use named exports from backbone,underscore
  }
};
