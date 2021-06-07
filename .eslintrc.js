module.exports = {
  'root': true,
  'extends': [
    'plugin:@okta/okta/courage-app' // apply courage-app rules to all files including properties
  ],
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2017
  },
  'overrides': [
    {
      // temporarily ignoring files that violate the @okta/okta/no-exclusive-language rule
      'files': [
        'packages/**/login.properties',
        'packages/**/country_fr.properties',
      ],
      'rules': {
        '@okta/okta/no-exclusive-language': 0,
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
      'files': ['src/**/*.js'],
      'rules': {
        'local-rules/no-bare-templates': 2, // we dont want no-bare-templates rule to be applied to test files
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
      'overrides': [
        {
          'files': [
            'playground/**/error-internal-server-error.json', //OKTA-389430
            'playground/**/error-user-is-not-assigned.json', //OKTA-389249
            'playground/**/identify-unknown-user.json', //OKTA-386386
          ],
          'rules': {
            'local-rules/no-missing-api-keys': 0
          }
        }
      ]
    }
  ],
};
