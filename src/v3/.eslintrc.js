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
    ecmaVersion: 2020,
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
    {
      // typescript config files
      env: { node: true },
      files: ['./*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.node.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      plugins: [
        '@typescript-eslint',
        'jsx-a11y',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'airbnb-base',
      ],
      rules: {
        // enforce simple-import-sort recommendations
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',

        // require follow curly brace convention
        curly: ['error', 'all'],

        // prefer named exports
        // 'import/named': 'off',
        // 'import/prefer-default-export': 'off',
        // 'import/no-default-export': 'off',
        'import/no-unresolved': ['error', {
          ignore: [
            '\\?\\w+',
          ],
          caseSensitiveStrict: true,
        }],
        // configs often import devDependencies
        'import/no-extraneous-dependencies': ['off'],

        // prevent conflicts with ts lint rule
        'import/extensions': ['error', {
          ts: 'never',
          tsx: 'never',
          json: 'always',
        }],

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
          allowedStrings: ['*'],
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
        'import/no-default-export': 'warn',
        'import/no-unresolved': ['error', {
          ignore: [
            'util\\/LanguageUtil',
            'util\\/TimeUtil',
          ],
        }],

        // prevent conflicts with ts lint rule
        'import/extensions': ['error', {
          ts: 'never',
          tsx: 'never',
          json: 'always',
        }],

        'react/forbid-component-props': [
          'error',
          {
            forbid: [
              // prevent inline styles which cause CSP violations
              { propName: 'style', message: 'Inline styles cause CSP issues' },
              // ensure RTL friendly properties
              { propName: 'margin', message: 'Use "marginBlock" and "marginInline" instead.' },
              { propName: 'marginTop', message: 'Use "marginBlockStart" instead.' },
              { propName: 'marginBottom', message: 'Use "marginBlockEnd" instead.' },
              { propName: 'marginLeft', message: 'Use "marginInlineStart" instead.' },
              { propName: 'marginRight', message: 'Use "marginInlineEnd" instead.' },
              { propName: 'mt', message: 'Use "marginBlockStart" instead.' },
              { propName: 'mb', message: 'Use "marginBlockEnd" instead.' },
              { propName: 'ml', message: 'Use "marginInlineStart" instead.' },
              { propName: 'mr', message: 'Use "marginInlineEnd" instead.' },

              { propName: 'padding', message: 'Use "paddingBlock" and "paddingInline" instead.' },
              { propName: 'paddingTop', message: 'Use "paddingBlockStart" instead.' },
              { propName: 'paddingBottom', message: 'Use "paddingBlockEnd" instead.' },
              { propName: 'paddingLeft', message: 'Use "paddingInlineStart" instead.' },
              { propName: 'paddingRight', message: 'Use "paddingInlineEnd" instead.' },
              { propName: 'pt', message: 'Use "paddingBlockStart" instead.' },
              { propName: 'pb', message: 'Use "paddingBlockEnd" instead.' },
              { propName: 'pl', message: 'Use "paddingInlineStart" instead.' },
              { propName: 'pr', message: 'Use "paddingInlineEnd" instead.' },

              { propName: 'borderTop', message: 'Use "borderBlockStart" instead.' },
              { propName: 'borderBottom', message: 'Use "borderBlockEnd" instead.' },
              { propName: 'borderLeft', message: 'Use "borderInlineStart" instead.' },
              { propName: 'borderRight', message: 'Use "borderInlineEnd" instead.' },

              { propName: 'borderTopLeftRadius', message: 'Use "borderStartStartRadius" instead.' },
              { propName: 'borderTopRightRadius', message: 'Use "borderEndStartRadius" instead.' },
              { propName: 'borderBottomLeftRadius', message: 'Use "borderEndStartRadius" instead.' },
              { propName: 'borderBottomRightRadius', message: 'Use "borderEndEndRadius" instead.' },

              { propName: 'top', message: 'Use "insetBlockStart" instead.' },
              { propName: 'bottom', message: 'Use "insetBlockEnd" instead.' },
              { propName: 'left', message: 'Use "insetInlineStart" instead.' },
              { propName: 'right', message: 'Use "insetInlineEnd" instead.' },
              // do not use IE11 incompatible properties that cannot be transformed
              { propName: 'gap', message: '"gap" is not compatible with IE11 and cannot be transformed by CSS post-processors' },
            ],
          },
        ],
        'react/forbid-dom-props': ['error', {
          forbid: [{
            propName: 'style',
            message: 'Inline styles cause CSP issues',
          }],
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
        OKTA_SIW_COMMIT_HASH: false,
        OKTA_SIW_VERSION: false,
      },
    },
    // unit test files in src
    // integration test files in test
    {
      env: { browser: true, jest: true, node: true },
      files: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.tsx',
        'test/integration/**/*.ts',
        'test/integration/**/*.tsx',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './src/tsconfig.json',
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      plugins: [
        '@typescript-eslint',
        'testing-library',
      ],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:testing-library/react',
        'airbnb-typescript',
        'airbnb/hooks',
        'preact',
      ],
      rules: {
        'import/prefer-default-export': 'off',
        'react/jsx-props-no-spreading': 'off',
        'jest/no-restricted-matchers': [
          'error',
          {
            toBeTruthy: 'Avoid `toBeTruthy`',
            toBeFalsy: 'Avoid `toBeFalsy`',
          },
        ],
        'testing-library/no-wait-for-multiple-assertions': 'warn',
        'testing-library/no-node-access': 'warn',
        'testing-library/no-container': 'warn',
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/render-result-naming-convention': 'off',
        'testing-library/prefer-explicit-assert': [
          'warn',
          {
            assertion: 'toBeInTheDocument',
            includeFindQueries: true,
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
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    // all typescript files in test/e2e
    {
      files: ['test/e2e/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './test/e2e/tsconfig.json',
        ecmaVersion: 2020,
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
    // disabling param re-assign in transaction transformer
    {
      files: [
        'src/transformer/transaction/*.ts',
        'src/transformer/terminal/*.ts',
        'src/transformer/terminal/**/*.ts',
      ],
      rules: {
        'no-param-reassign': 0,
      },
    },
  ],
};
