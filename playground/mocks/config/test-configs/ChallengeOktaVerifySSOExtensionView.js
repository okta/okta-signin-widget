const credentialSSOExtensionBiometricsErrorMobileMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],

  // TODO: this one does not work as expected. See mocks/spec-okta-api/idp/idx/index.js
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify': [
    'error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile'
  ]
};

const credentialSSONotExistMock = {
  '/idp/idx/introspect': [
    'identify-with-no-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'
  ]
};

module.exports = {
  credentialSSOExtensionBiometricsErrorMobileMock,
  credentialSSONotExistMock
};
