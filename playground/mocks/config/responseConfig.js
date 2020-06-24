/* eslint no-unused-vars: 0 */

const idx = {
  // ===== IDX

  '/idp/idx/introspect': [
    // 'authenticator-enroll-password',
    // 'authenticator-select-verify-options',
    // 'authenticator-verification-security-question',
    // 'authenticator-select-enroll-options',
    // 'identify',
    // 'identify-with-third-party-idps',
    // 'identify-locked-user,
    // 'authenticator-enroll-security-question',
    // 'authenticator-select-enroll-options',
    // 'authenticator-enroll-security-question',
    // 'terminal-return-expired-email',
    // 'factor-verification-email'
    // 'authenticator-enroll-phone',
    // 'authenticator-verification-data-phone-sms-then-voice',
    // 'authenticator-verification-data-phone-voice-then-sms',
    // 'authenticator-verification-select-authenticator',
    // 'authenticator-verification-data-phone-voice-only',
    // 'authenticator-verification-phone-sms',
    // 'authenticator-verification-phone-voice',
    // 'authenticator-verification-password'
    'authenticator-verification-email'
  ],
  '/idp/idx/enroll': [
    // 'enroll-profile',
    'enroll-profile-new'
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-security-question',
  ],
  '/idp/idx/identify': [
    // 'error-identify-access-denied',
    'error-identify-user-locked-unable-challenge'
  ],
  '/idp/idx/challenge/answer': [
    // 'error-email-verify',
    // 'terminal-return-expired-email',
    // 'factor-verification-email',
    'error-answer-passcode-invalid'
  ],
  '/idp/idx/challenge/send': [
    'factor-verification-email',
  ],
  '/idp/idx/challenge/resend': [
    // 'factor-verification-email',
    'authenticator-verification-phone',
    // 'authenticator-verification-phone-voice'
  ],
  '/idp/idx/challenge/poll': [
    // 'authenticator-enroll-email',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-webauthn',
    // 'authenticator-verification-password',
    // 'factor-verification-password',
    // 'factor-verification-email',
  ],
  '/idp/idx/enroll/new': [
    'error-new-signup-email',
    'error-new-signup-email-exists'
  ],
  '/idp/idx/cancel': [
    'identify',
  ]
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
    'identify-with-device-probing-loopback-2', // 2
    'identify-with-device-probing-loopback-3', // 3
    'identify', // 4: as a signal of success
  ],
};

// Windows authenticator with loopback server polling error (device not registered deny access)
const windowAuthnLoopbackPollingFail = {
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
    'identify-with-device-launch-authenticator',
  ]
};

// Apple authenticator with Redirect SSO extension
const appleSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-sso-extension',
  ],
};

// Apple authenticator when Credential SSO extension
const appleCredentialSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-credential-sso-extension',
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'
  ],
};

const appleUniversalLink = {
  '/idp/idx/introspect': [
    'identify-with-apple-sso-extension-fallback'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-universal-link',
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-universal-link',
    'identify-with-universal-link',
    'identify-with-universal-link',
    'success',
  ],
};

module.exports = {
  mocks: idx,
};
