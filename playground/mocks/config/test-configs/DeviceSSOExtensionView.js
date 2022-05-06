// see playground/mocks/spec-okta-api/idp/idx/index.js for details on headers

const stepUpMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify': [
    'error-401-okta-verify-apple-sso-step-up'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'
  ],
};

module.exports = {
  stepUpMock
};
