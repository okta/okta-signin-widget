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

// OKTA-1257415: the two-step password challenge returns a generic, non-attributive
// "Unable to sign in" at form level. Used to verify the password input is associated with
// that message via aria-describedby, without being marked aria-invalid.
const wrongPasswordFormLevelError = {
  '/idp/idx/introspect': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'error-401-authenticator-verify-password-generic'
  ]
};

module.exports = {
  sessionExpiresDuringPassword,
  mockCannotForgotPassword,
  resetPasswordSuccess,
  wrongPasswordFormLevelError
};
