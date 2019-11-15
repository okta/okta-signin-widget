module.exports = {
  mocks: {
    // ===== IDX

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
      'factor-verification-password',
      'factor-verification-email',
    ],

    // ===== AUTHN
    '/api/v1/authn': [
      'consent-required',
      // 'success-001'
    ],

  },
};
