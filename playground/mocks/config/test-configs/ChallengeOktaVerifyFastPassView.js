const universalLinkWithoutLaunchMock = {
  '/idp/idx/introspect': [
    'identify-with-apple-sso-extension-fallback-no-link'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link'
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-apple-sso-extension-fallback'
  ],
};


const customURIMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri'
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri'
  ],
};

const loginHintAppLinkMock = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-okta-verify-signed-nonce-app-link'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-app-link'
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-app-link'
  ],
};

module.exports = {
  universalLinkWithoutLaunchMock,
  customURIMock,
  loginHintAppLinkMock
};
