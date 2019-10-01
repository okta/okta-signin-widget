module.exports = {
  mocks: {
    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['factor-verification-email'],
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
      'factor-required-password-with-options',
      'success'
    ]
  },
};
