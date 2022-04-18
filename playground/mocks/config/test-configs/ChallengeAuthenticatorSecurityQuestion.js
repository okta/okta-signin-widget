const authenticatorRequiredSecurityQuestionMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-security-question'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ]
};

module.exports = {
  authenticatorRequiredSecurityQuestionMock
};
