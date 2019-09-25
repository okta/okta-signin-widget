module.exports = {
  mocks: {
    '/idp/idx': ['select-factor-authenticate'],
    '/idp/idx/challenge': [
      'factor-required-password-with-options',
      'success'
    ]
  },
};