/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { pattern, template, header } = require('./config/header');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  settings: {
    react: {
      pragma: 'h',
      version: '17.0.0',
    },
    'import/resolver': {
      alias: {
        map: [
          ['src', './src'],
        ],
        extensions: [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
        ],
      },
    },
  },
  globals: {
    NodeJS: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb',
  ],
  plugins: [
    'simple-import-sort',
    'import',
  ],
  overrides: [
    // format json
    {
      settings: {
        'json/sort-package-json': 'standard',
        'json/json-with-comments-files': [],
      },
      files: ['*.json', '**/*.json'],
      plugins: [
        'json-format',
      ],
    },
    // all typescript files in src
    {
      env: { browser: true },
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './src/tsconfig.json',
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      plugins: [
        '@typescript-eslint',
        'jsx-a11y',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'airbnb-typescript',
        'airbnb/hooks',
        'preact',
      ],
      rules: {
        // disable prop-type checks
        'react/prop-types': 'off',

        // preact allows class vs className
        'react/no-unknown-property': ['error', {
          ignore: ['class'],
        }],
        // force props to be on separate lines for readability
        'react/jsx-max-props-per-line': ['error', {
          maximum: 1,
          when: 'always',
        }],
        // prevent hardcoded strings
        'react/jsx-no-literals': ['error', {
          noStrings: true,
          ignoreProps: true,
          noAttributeStrings: true,
        }],
        // check hooks deps
        'react-hooks/exhaustive-deps': 'error',
        // enforce simple-import-sort recommendations
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',

        // require follow curly brace convention
        curly: ['error', 'all'],

        // prefer named exports
        'import/named': 'error',
        'import/prefer-default-export': 'off',
        // 'import/no-default-export': 'error', // FIXME re-enable rule
        'import/no-unresolved': 'error',

        // prevent conflicts with ts lint rule
        'import/extensions': ['error', {
          ts: 'never',
          tsx: 'never',
          json: 'always',
        }],

        // use @typescript-eslint/no-unused-vars
        'no-unused-vars': 'off',

        // allow '_' prefix for unuse vars
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
          },
        ],

        // allow ts-directives with a description >= 8 chars
        '@typescript-eslint/ban-ts-comment': ['warn', {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': 'allow-with-description',
          'ts-check': 'allow-with-description',
          minimumDescriptionLength: 8,
        }],

        'class-methods-use-this': 'off',
      },
      globals: {
        COMMITHASH: false,
        VERSION: false,
      },
    },
    // unit test files in src
    {
      env: { browser: true, jest: true, node: true },
      files: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.tsx',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './src/tsconfig.json',
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'airbnb-typescript',
        'airbnb/hooks',
        'preact',
      ],
      rules: {
        'react/jsx-props-no-spreading': 'off',
        'jest/no-restricted-matchers': [
          'error',
          {
            toBeTruthy: 'Avoid `toBeTruthy`',
            toBeFalsy: 'Avoid `toBeFalsy`',
          },
        ],

      },
    },
    // integration test files in test
    {
      env: { browser: true, jest: true, node: true },
      files: [
        'test/integration/**/*.ts',
        'test/integration/**/*.tsx',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './test/integration/tsconfig.json',
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'airbnb-typescript',
        'airbnb/hooks',
        'preact',
      ],
      rules: {
        'import/prefer-default-export': 'off',
      },
    },
    // all typescript files in test/e2e
    {
      files: ['test/e2e/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './test/e2e/tsconfig.json',
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      plugins: [
        'testcafe-community',
        '@typescript-eslint',
      ],
      extends: [
        'plugin:testcafe-community/recommended',
        'airbnb-typescript/base',
      ],
      rules: {},
    },
    // all javascript files in bin/properties-to-json
    {
      env: { node: true },
      files: ['src/bin/properties-to-json.js'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error', {
            // allow importing dev dependencies in this utility
            devDependencies: true,
          },
        ],
      },
    },
    // license header for all files
    {
      env: { browser: true, jest: true, node: true },
      files: ['*.+(js|jsx|ts|tsx)'],
      plugins: ['header'],
      rules: {
        'header/header': [
          'error',
          'block',
          ['', { pattern, template }, ...header.split('\n')],
          2,
        ],
        // added "ignoreComments": true, the rest is default
        'max-len': [
          'error',
          100,
          2,
          {
            ignoreUrls: true,
            ignoreComments: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
          },
        ],
      },
    },
  ],
};
