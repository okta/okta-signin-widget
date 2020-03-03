/* eslint no-unused-vars: 0 */

const idx = {
  // ===== IDX

  '/idp/idx/introspect': ['identify'],
  '/idp/idx': ['select-factor-authenticate'],
  '/idp/idx/enroll': ['enroll-profile'],
  '/idp/idx/challenge/answer': [
    'error-email-verify',
    // 'terminal-return-expired-email',
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
const windowsAuthnLoopback = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback', // 1 (response order)
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback-2', // 2
    'identify-with-device-probing-loopback-3', // 3
    'identify', // 4: as a signal of success
  ],
};

// Windows authenticator with loopback server polling error (device not registered deny access)
const windowsAuthnLoopbackPollingFail = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback', // 1 (response order)
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback-2', // 2
    'identify-with-device-probing-loopback-3', // 3
    'error-email-verify', // 4 as a signal of failure
    'error-email-verify', // 5 should not come here as it has error out in step 4
  ],
};

//Windows authenticator with loopback server failfast
const windowsAuthnLoopbackFailfast = {
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
const windowsAuthnCustomUri = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-launch-authenticator',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-device-launch-authenticator',
  ]
};

// Apple authenticator while redirect SSO extension is available
const appleRedirectSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-redirect-sso-extension',
  ],
  '/idp/idx/authenticators/sso_extension/transactions/123/verify': [
    'identify', // as a signal of success
  ],
};

// Apple authenticator when credential SSO extension is NOT available
const appleCredentialSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-credential-sso-extension',
  ],
  '/idp/idx/authenticators/sso_extension/transactions/123/verify': [
    'identify'
  ],
  '/idp/idx': [
    'error-email-verify',
  ],
  // '/idp/idx/authenticators/okta-verify/launch': [
  //   'identify-with-device-launch-authenticator',
  // ]
  // '/idp/idx/authenticators/sso_extension/transactions/123/verifies': [
  //   'identify-with-device-probing-loopback-challenge-not-received'
  // ],
};

module.exports = {
  mocks: idx ,
};
