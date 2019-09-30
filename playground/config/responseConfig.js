module.exports = {
  mocks: {
    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['select-factor-authenticate'],
    '/idp/idx/challenge': [
      'factor-required-password-with-options',
      'success'
    ]
  },
};