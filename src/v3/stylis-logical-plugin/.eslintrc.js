module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    project: './stylis-logical-plugin/tsconfig.json',
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
  ],
  rules: {
    // enforce simple-import-sort recommendations
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // require follow curly brace convention
    curly: ['error', 'all'],

    // prefer named exports
    'import/named': 'error',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',
    'import/no-unresolved': 'error',

    // use @typescript-eslint/no-unused-vars
    'no-unused-vars': 'off',

    // allow ts-directives with a description >= 8 chars
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      'ts-check': 'allow-with-description',
      minimumDescriptionLength: 8,
    }],
  },
};
