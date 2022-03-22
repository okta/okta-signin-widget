const sessionExpiresDuringPassword = {
  '/idp/idx/introspect': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'error-pre-versioning-ff-session-expired'
  ]
};

module.exports = {
  sessionExpiresDuringPassword
};
