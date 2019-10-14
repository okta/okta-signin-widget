module.exports = {
  mocks: {
    '/idp/idx/introspect': ['identify'],
    '/idp/idx': ['select-factor-authenticate'],
    '/idp/idx/enroll': ['enroll-profile'],
    '/idp/idx/challenge/answer': [
      // 'error-email-verify',
      'terminal-return-expired-email',
    ],
    '/idp/idx/challenge/send': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge/poll': [
      'factor-verification-email',
    ],
    '/idp/idx/challenge': [
      'factor-verification-webauthn',
      'factor-verification-password',
      'factor-verification-email',
    ]
  },
};