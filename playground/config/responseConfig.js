/* eslint no-unused-vars: 0 */

const idx = {
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
};

// ===== AUTHN
const authn = {
  '/api/v1/authn': [
    'unauthenticated',
    'success-001'
  ],
};

// email enroll
const emailEnrollMocks = {
  '/api/v1/authn': [
    'mfa-enroll-email-with-sms-enrolled'
  ],
  '/api/v1/authn/skip': [
    'mfa-enroll-email-with-sms-enrolled'
  ],
  '/api/v1/authn/factors': [
    'mfa-enroll-activate-email'
  ],
  '/api/v1/authn/factors/:factorid/lifecycle/resend': [
    'mfa-enroll-activate-email'
  ],
  '/api/v1/authn/factors/:factorid/lifecycle/activate': [
    'success-001'
  ],
};

// email verification
const emailVerificationMocks = {
  '/api/v1/authn': [
    'mfa-required-email'
  ],
  '/api/v1/authn/factors/:factorid/verify/resend': [
    'mfa-challenge-email',
  ],
  '/api/v1/authn/factors/:factorid/verify': [
    'mfa-challenge-email',
    'success-001'
  ],
};


// ===== IDX
// Windows authenticator with loopback server
const windowAuthnLoopback = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback', // 1 (response order)
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback', // 2
    'identify-with-device-probing-loopback', // 3
    'identify', // 4: as a signal of success
  ],
};

//Windows authenticator with loopback server failfast
const windowAuthnLoopbackFailfast = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback',
  ],
  '/idp/idx/authenticators/poll': [
    'identify',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-device-launch-authenticator',
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
};

// Windows/Android authenticator with custom URI
const windowAuthnCustomUri = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-launch-authenticator',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-device-launch-authenticator', // 5
    'identify-with-device-probing-loopback-challenge-not-received' // 7
  ]
};

// Apple authenticator (SSO extension)
const appleSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-sso-extension',
  ],
  '/idp/idx/authenticators/sso_extension/transactions/123/verify': [
    'identify', // as a signal of success
  ],
};

module.exports = {
  mocks: authn,
};
