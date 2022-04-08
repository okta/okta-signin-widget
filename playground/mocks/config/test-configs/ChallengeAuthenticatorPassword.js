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

module.exports = {
  sessionExpiresDuringPassword,
  mockCannotForgotPassword
};
