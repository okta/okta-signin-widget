module.exports = {
  'root': true,
  'extends': [
    'plugin:@okta/okta/courage-app', // apply courage-app rules to all files including properties
  ],
  'parser': '@babel/eslint-parser',
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2017
  },
  'plugins': [
    '@typescript-eslint',
    'import',
    'compat'
  ],
  'settings': {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts']
    },
  },
  'overrides': [
    {
      // temporarily ignoring files that violate the @okta/okta/no-exclusive-language rule
      'files': [
        'packages/**/login*.properties', // "oktamastered"
        'packages/**/country_fr.properties', // "yougoslave"
      ],
      'rules': {
        '@okta/okta/no-exclusive-language': 0,
      },
    },
    {
      'files': [
        // ignore all translations except for login.properties
        'packages/**/login_*.properties',
        'packages/**/country*.properties',
      ],
      'rules': {
        '@okta/okta/no-missing-i18n-comments': 'off',
      },
    },
    {
      'files': ['*.js'],
      'extends': [
        'eslint:recommended',
      ],
      'env': {
        'browser': true,
        'jasmine': true,
        'node': true,
        'amd': true
      },
      'plugins': [
        'eslint-plugin-local-rules',
        'eslint-plugin-no-only-tests'
      ],
      'globals': {
        'spyOnEvent': false,
        'JSON': true,
        'DEBUG': true,
        'Promise': true
      },
      'rules': {
        'camelcase': 2,
        'complexity': [2, 10],
        'curly': 2,
        'eqeqeq': 2,
        'guard-for-in': 2,
        'indent': [2, 2, { 'VariableDeclarator': 2 }],
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
        'no-only-tests/no-only-tests': 'error',
        'quotes': [2, 'single'],
        'semi': 2,
        'space-before-function-paren': [2, {
          'anonymous': 'never',
          'named': 'never',
          'asyncArrow': 'always'
        }],
        'strict': 0,
      },
    },
    {
      // IE11 compat coverage — scoped to v1/v2 only. v3 (React) does not require IE11 in practice
      // even though its own browserslist mentions it, and running compat rules there produces
      // noise. See /Users/vijet.mahabaleshwar/.claude/plans/can-you-create-a-woolly-ember.md.
      'files': ['src/**/*'],
      'excludedFiles': ['src/v3/**/*'],
      'extends': [
        'plugin:compat/recommended',
        'plugin:import/recommended'
      ],
      'settings': {
        'import/resolver': {
          'typescript': {
            'project': './'
          }
        },
        // Keep this list in sync with polyfill/index.js. eslint-plugin-compat treats these
        // as available in IE11 and suppresses warnings for them. Instance methods (Array.prototype.*,
        // String.prototype.*) are NOT checked by compat plugin — that gap is covered separately by
        // scripts/check-polyfill-coverage.js (Layer 1.5). This list is globals + static methods only.
        'polyfills': [
          'Promise',
          'globalThis',
          'Symbol',
          'Symbol.iterator',
          'Set',
          'WeakMap',
          'URL',
          'Uint8Array',
          'Object.assign',
          'Object.entries',
          'Object.values',
          'Object.fromEntries',
          'Object.setPrototypeOf',
          'Array.from',
          // fast-text-encoding
          'TextEncoder',
          // webcrypto-shim
          'crypto.subtle',
          // Runtime-checked via `typeof AbortController !== 'undefined'` in WebAuthn controllers
          'AbortController'
        ]
      },
      'rules': {
        'import/no-named-as-default-member': 0, // TODO: enable and fix usage with Q
        'local-rules/no-bare-templates': 2, // we dont want no-bare-templates rule to be applied to test files
      },
      'env': {
        // Setting browser to true enables many global variables which may obscure actual errors
        // Instead we specifically enumerate globals below
        'browser': false,
      },
      'globals': {
        'window': true,
        'document': true,
        'navigator': true,
        'localStorage': true,
        'sessionStorage': true,
        'AbortController': true,
      },
      'overrides': [
        {
          // temporarily ignoring files that violate @okta/okta/no-unlocalized-text-in-templates rule
          'files': [
            'src/**/CustomButtons.js',
            'src/**/SignInWithIdps.js',
          ],
          'rules': {
            '@okta/okta/no-unlocalized-text-in-templates': 0,
          },
        },
      ]
    },
    {
      'files': ['playground/**/*.json', 'packages/**/*.json'],
      'extends': [
        'plugin:json/recommended',
      ],
      'rules': {
        'local-rules/no-missing-keys': 2,
        'local-rules/no-missing-api-keys': 2,
      },
    },
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020
      },
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        // TODO: enable these rules
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0
      }
    },
  ],
};
