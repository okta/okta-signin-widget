const sessionExpiresDuringPassword = {
  '/idp/idx/introspect': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'error-pre-versioning-ff-session-expired'
  ]
};

const mockCannotForgotPassword = {
  '/idp/idx/introspect': [
    'authenticator-verification-password'
  ],
  '/idp/idx/recover': [
    'error-forgot-password'
  ]
};

const resetPasswordSuccess = {
  '/idp/idx/introspect': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'terminal-reset-password-success'
  ]
};

module.exports = {
  sessionExpiresDuringPassword,
  mockCannotForgotPassword,
  resetPasswordSuccess
};
