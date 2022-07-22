const identifyWithEmailAuthenticator = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

const identifyMock = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

module.exports = {
  identifyWithEmailAuthenticator,
  identifyMock
};
