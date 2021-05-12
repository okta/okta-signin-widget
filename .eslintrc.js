module.exports = {
  'extends': [
    'eslint:recommended',
    'plugin:json/recommended'
  ],
  'env': {
    'browser': true,
    'jasmine': true,
    'node': true,
    'amd': true
  },
  'parser': 'babel-eslint',
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 2017
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
  'overrides': [
    {
      'files': ['src/**/*.js'],
      'rules': {
        'local-rules/no-bare-templates': 2,
      }
    },
    {
      'files': ['packages/**/*.json'],
      'rules': {
        'local-rules/no-missing-keys': 2,
      }
    },
    {
      'files': ['playground/**/*.json'],
      'rules': {
        'local-rules/no-missing-api-keys': 2,
      },
      'overrides': [
        {
          'files': [
            'playground/**/authenticator-expiry-warning-password.json',
            'playground/**/authenticator-verification-okta-verify-reject-push.json',
            'playground/**/error-403-security-access-denied.json',
            'playground/**/error-with-failure-redirect.json',
            'playground/**/error-authenticator-verify-password.json',
            'playground/**/error-authenticator-webauthn-failure.json',
            'playground/**/error-email-verify.json',
            'playground/**/error-forgot-password.json',
            'playground/**/error-identify-access-denied.json',
            'playground/**/error-internal-server-error.json',
            'playground/**/error-okta-verify-totp.json',
            'playground/**/error-user-is-not-assigned.json',
            'playground/**/identify-unknown-user.json',
            'playground/**/safe-mode-credential-enrollment-intent.json',
            'playground/**/safe-mode-optional-enrollment.json',
            'playground/**/safe-mode-required-enrollment.json',
            'playground/**/terminal-enduser-email-consent-denied.json',
            'playground/**/terminal-polling-window-expired.json',
            'playground/**/terminal-return-email-consent-denied.json',
            'playground/**/terminal-return-email-consent.json',
            'playground/**/terminal-return-email.json',
            'playground/**/terminal-return-expired-email.json',
            'playground/**/terminal-transfered-email.json'
          ],
          'rules': {
            'local-rules/no-missing-api-keys': 0
          }
        }
      ]
    }
  ],
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
  'root': true
};
