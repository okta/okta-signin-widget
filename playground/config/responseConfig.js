module.exports = {
  mocks: {
    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['terminal-return-expired-email'],
    '/idp/idx/challenge': [
      'factor-required-password-with-options',
      'success'
    ]
  },
};
