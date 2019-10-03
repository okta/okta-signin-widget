module.exports = {
  mocks: {
    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['select-factor-authenticate'],
    '/idp/idx/enroll': ['enroll-profile'],
    '/idp/idx/challenge/answer': [
      'error-email-verify',
      'success',
    ],
    '/idp/idx/challenge/send': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge/poll': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge': [
      'factor-required-email-with-options',
    ]
  },
};
