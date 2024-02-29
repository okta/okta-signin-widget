/* eslint no-unused-vars: 0 */
const Test = require('./test-configs');

const idx = {
  // ===== IDX

  // PKCE must be enabled with interaction code flow
  '/oauth2/default/.well-known/openid-configuration': [
    'well-known-openid-configuration'
  ],
  '/oauth2/default/v1/interact': [
    'interact'
    // 'error-feature-not-enabled'
    // 'error-recovery-token-invalid'
    // 'error-activation-token-invalid'
  ],
  '/oauth2/default/v1/token': [
    'error-token-invalid-grant-pkce'
  ],

  '/idp/idx/introspect': [
    'identify',
    // 'identify-with-uischema',
    // 'error-identify-multiple-errors',
    // 'authenticator-enroll-ov-qr-enable-biometrics',
    // 'authenticator-verification-okta-verify-push',
    // 'error-401-invalid-otp-passcode',
    // 'error-with-failure-redirect',
    // 'error-feature-not-enabled',
    // 'error-account-creation',
    // 'error-request-not-completed',
    // 'error-403-security-access-denied',
    // 'error-session-expired',
    // 'error-password-reset-failed',
    // 'error-identify-with-only-one-third-party-idp',
    // 'authenticator-enroll-email',
    // 'error-internal-server-error',
    // 'authenticator-enroll-password',
    // 'authenticator-enroll-phone',
    // 'authenticator-enroll-phone-voice',
    // 'authenticator-enroll-data-phone',
    // 'authenticator-enroll-data-phone-voice',
    // 'authenticator-enroll-ov-email-enable-biometrics',
    // 'authenticator-enroll-ov-email',
    // 'authenticator-enroll-ov-via-email',
    // 'authenticator-enroll-ov-sms',
    // 'authenticator-enroll-ov-sms-enable-biometrics',
    // 'authenticator-enroll-ov-via-sms',
    // 'authenticator-enroll-ov-qr',
    // 'authenticator-enroll-ov-same-device',
    // 'authenticator-enroll-ov-device-bootstrap',
    // 'authenticator-enroll-ov-qr-enable-biometrics',
    // 'error-internal-server-error',
    // 'authenticator-enroll-security-question',
    // 'authenticator-enroll-select-authenticator',
    // 'authenticator-enroll-select-authenticator-with-skip',
    // 'authenticator-enroll-webauthn',
    // 'authenticator-verification-data-phone-sms-then-voice',
    // 'authenticator-verification-data-phone-voice-only',
    // 'authenticator-verification-data-phone-voice-then-sms',
    // 'authenticator-verification-email',
    // 'authenticator-verification-password',
    // 'authenticator-verification-phone-sms',
    // 'authenticator-verification-phone-voice',
    // 'authenticator-verification-security-question',
    // 'authenticator-verification-select-authenticator',
    // 'authenticator-verification-select-authenticator-ov-m2',
    // 'authenticator-verification-webauthn',
    // 'authenticator-reset-password',
    // 'authenticator-expired-password',
    // 'authenticator-expired-password-no-complexity',
    // 'authenticator-expired-password-with-enrollment-authenticator',
    // 'authenticator-expiry-warning-password',
    // 'device-code-activate',
    // 'enroll-profile',
    // 'enroll-profile-new',
    // 'enroll-profile-new-custom-labels',
    // 'identify-unknown-user',
    // 'identify-with-apple-credential-sso-extension',
    // 'identify-with-apple-redirect-sso-extension',
    // 'identify-with-apple-sso-extension-fallback',
    // 'identify-with-device-launch-authenticator',
    // 'identify-with-device-probing-loopback',
    // 'identify-with-device-probing-loopback-2',
    // 'identify-with-device-probing-loopback-3',
    // 'identify-with-device-probing-loopback-challenge-not-received',
    // 'identify-with-no-sso-extension',
    // 'identify-with-third-party-idps',
    // 'identify-with-only-third-party-idps',
    // 'identify-with-only-one-third-party-idp',
    // 'identify-with-password',
    // 'identify-with-universal-link',
    // 'identify-with-app-link',
    // 'success',
    // 'success-redirect-remediation',
    // 'failure-redirect-remediation',
    // 'success-with-app-user',
    // 'success-with-interaction-code'
    // 'terminal-return-email',
    // 'terminal-return-error-email',
    // 'terminal-return-expired-email',
    // 'terminal-return-stale-email',
    // 'terminal-transfered-email',
    // 'terminal-registration',
    // 'terminal-enduser-email-consent-denied',
    // 'terminal-invalid-forgot-password-token',
    // 'terminal-invalid-reset-password-token',
    // 'terminal-reset-password-inactive-user',
    // 'terminal-reset-password-success',
    // 'oda-enrollment-ios',
    // 'oda-enrollment-android',
    // 'mdm-enrollment',
    // 'ws1-device-integration-mobile-enrollment',
    // 'authenticator-verification-custom-app-push',
    // 'authenticator-enroll-custom-app-push',
    // 'request-activation-email'    
  ],
  '/idp/idx/enroll': [
    'enroll-profile-new',
    // 'enroll-profile-with-password',
    // 'error-enroll-regisration-unavailable',
    // 'enroll-profile-with-idps'
  ],
  '/idp/idx/credential/enroll': [
    // 'authenticator-enroll-ov-via-sms',
    // 'authenticator-enroll-security-question',
    // 'authenticator-enroll-google-authenticator',
    // 'authenticator-enroll-email-first-emailmagiclink-true',
    'error-authenticator-enroll-phone-invalid-number',
  ],
  '/idp/idx/identify': [
    // 'authenticator-verification-data-ov-only-without-device-known',
    'authenticator-verification-email',
    // 'authenticator-enroll-select-authenticator',
    // 'authenticator-verification-email-without-emailmagiclink',
    // 'identify-with-only-one-third-party-idp',
    // 'error-identify-access-denied',
    // 'error-identify-access-denied-custom-message',
    // 'error-identify-user-locked-unable-challenge',
    // 'error-unable-to-authenticate-user',
    // 'terminal-device-activated',
    // 'terminal-device-not-activated',
    // 'terminal-device-not-activated-consent-denied',
    // 'terminal-device-not-activated-internal-error'
    // 'success-with-interaction-code',
    // 'error-with-failure-redirect',
    // 'error-unsupported-idx-response'
  ],
  '/idp/idx/challenge/answer': [
    'error-401-invalid-otp-passcode',
    // 'error-401-invalid-otp-passcode',
    // 'error-429-too-many-request-operation-ratelimit',
    // 'error-429-too-many-request',
    // 'error-429-api-limit-exceeded',
    // 'terminal-return-expired-email',
    // 'error-answer-passcode-invalid',
    // 'error-authenticator-enroll-security-question',
    // 'error-authenticator-webauthn-failure',
    // 'error-authenticator-enroll-password-common',
    'error-authenticator-reset-password-requirement',
    'error-authenticator-enroll-security-question-html-tags',
    'error-authenticator-enroll-password-common',
    // 'error-authenticator-reset-password-requirement',
    // 'error-authenticator-enroll-security-question-html-tags',
  ],
  '/idp/idx/challenge/send': [
    // 'authenticator-enroll-ov-sms',
    'authenticator-enroll-ov-email',
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-ov-sms',
    // 'authenticator-verification-phone-voice'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email',
    // 'success',
    // 'authenticator-verification-email-polling-long',
    // 'error-429-too-many-request',
    // 'error-429-api-limit-exceeded',
    // 'enroll-profile-new'
    // 'authenticator-enroll-email',
    // 'authenticator-enroll-email-emailmagiclink-true',
    // 'authenticator-enroll-email-emailmagiclink-false',
    // 'authenticator-verification-okta-verify-push',
    // 'authenticator-verification-custom-app-push',
    // 'authenticator-verification-custom-app-push-reject',
    // 'authenticator-enroll-ov-sms-enable-biometrics',
    // 'okta-verify-version-upgrade',
    // 'okta-verify-uv-verify-enable-biometrics'
  ],
  '/idp/idx/challenge': [
    // 'authenticator-verification-webauthn',
    // 'authenticator-verification-password',
    // 'authenticator-verification-okta-verify-totp',
    // 'authenticator-verification-okta-verify-push',
    // 'authenticator-verification-google-authenticator',
    'error-authenticator-phone-sms-ratelimit',
    'error-authenticator-phone-voice-ratelimit',
  ],
  '/idp/idx/enroll/new': [
    'error-new-signup-email',
    'error-new-signup-email-exists'
    // 'authenticator-enroll-email',
    // 'authenticator-enroll-email-emailmagiclink-true',
    // 'authenticator-enroll-email-emailmagiclink-false',
    // 'authenticator-enroll-email-first',
  ],
  '/idp/idx/cancel': [
    'identify',
  ],
  '/idp/idx/recover': [
    'error-forgot-password',
    'authenticator-reset-password'
  ],
  '/idp/idx/activate': [
    'identify-with-password',
    // 'error-invalid-device-code',
  ],
  '/idp/idx/device/activate': [
    'identify-with-password',
    // 'error-invalid-device-code',
  ]
};

const emailActivation = {
  '/idp/idx/introspect': [
    'request-activation-email',
    // 'error-request-activation-email-invalid',
    // 'error-request-activation-email-expired-token',
    // 'error-request-activation-email-suspended',
    // 'terminal-request-activation-email-submitted',
  ],
  '/idp/idx/request-activation': [
    'terminal-request-activation-email-submitted'
  ]
};

const consent = {
  '/idp/idx/introspect': [
    // 'consent-admin',
    'consent-enduser',
    'consent-granular',
  ],
  '/idp/idx/consent': [
    // note that the success 'href' is in reality a redirect (i.e. /login/token/redirect?stateToken={{stateToken}})
    'success',
  ],
};

// ===== AUTHN
const authn = {
  '/api/v1/authn/introspect': [
    // 'mfa-required-email',
    // 'unauthenticated',
    // 'admin-consent-required',
    // 'device-code-activate',
    'mfa-enroll-sms'
  ],
  '/api/v1/authn/factors': [
    'mfa-enroll-activate-sms'
  ],
  '/api/v1/authn/factors/:factorid/lifecycle/activate': [
    'mfa-enroll-sms'
  ],
  '/api/v1/authn': [
    'error-authentication-failed',
    // 'unauthenticated',
    // 'success-001'
    // 'consent-required',
    // 'device-code-activate',
  ],
  '/api/v1/authn/device/activate': [
    'terminal-device-activated',
    // 'terminal-device-not-activated-consent-denied',
    // 'terminal-device-not-activated-internal-error'
    // 'error-invalid-device-code'
  ],
  '/api/v1/authn/recovery/token': [
    'recovery-password'
  ],
  '/api/v1/authn/cancel': [
    'cancel'
  ],
  '/.well-known/webfinger': [
    'forced-idp-discovery-okta-idp'
  ]
};

//enroll QR Okta Verify
const enrollQROktaVerify  = {
  '/api/v1/authn': [
    'mfa-enroll-qr-okta-verify'
  ]
};

const enrollOVManually  = {
  '/api/v1/authn': [
    'mfa-enroll-ov-manual'
  ],
  '/idp/idx/activate/poll': [
    'identify-with-device-launch-authenticator',
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
const fastpassUnassignedApp = {
  '/idp/idx/introspect': [
    'error-400-user-not-assigned',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'error-400-user-not-assigned-2',
  ],
  '/idp/idx/identify': [
    'error-400-user-not-assigned-3',
  ],
};

// device probe: Windows authenticator with loopback server
//
// To mimic the loopback failure flow (ex. loopback server does not exist),
// update package.json's script for mock:device-authenticator and
// change port 6512 to 6518 (identify-with-device-probing-loopback does not list this port)
const windowAuthnLoopback = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback', // 1 (response order)
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback-2', // 2
    'identify-with-device-probing-loopback-3', // 3
    'identify', // 4: as a signal of success
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'authenticator-verification-select-authenticator',
  ]
};

// device probe: Windows authenticator with loopback server polling error (device not registered deny access)
const windowAuthnLoopbackPollingFail = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback', // 1 (response order)
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback-2', // 2
    'identify-with-device-probing-loopback-3', // 3
    'error-403-access-denied', // 4 as a signal of failure
    'error-403-access-denied', // 5 should not come here as it has error out in step 4
  ],
};

// device probe: Windows authenticator with loopback server failfast
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

// device probe: silent probe failed, but probing is still required
const desktopSmartProbe = {
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
    'smart-probing-required',
  ],
  '/idp/idx/enroll': [
    'enroll-profile-new'
  ],
};

// device probe: Windows/Android authenticator with custom URI, probing is not required
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

// device probe: Apple authenticator with Redirect SSO extension
const appleRedirectSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-redirect-sso-extension',
  ],
};

// device probe: Apple authenticator with Credential SSO extension
const appleCredentialSsoExtension = {
  '/idp/idx/introspect': [
    'identify-with-apple-credential-sso-extension',
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'
  ],
};

// device probe: Apple authenticator with universal link
const appleUniversalLink = {
  '/idp/idx/introspect': [
    'identify-with-apple-sso-extension-fallback',
    // 'identify-with-universal-link-w-session',
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

// device probe: Android authenticator with app link
const androidAuthnLoopbackFailfast = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback',
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-app-link',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-app-link',
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'identify-with-device-probing-loopback-challenge-not-received-android'
  ],
};

const identifierAndroidAppLink = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-app-link',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-app-link',
  ]
};

// user verification: Windows/Android authenticator with loopback server
//
// to mimic the challenge error flow (user does not respond to biometric request),
// change the path in challenge.js to a non-existing URL (ex. 'fake/challenge') and
// rerun `yarn mock:device-authenticator`
// the UI should ends on the MFA selection UI instead of the success UI
const userVerificationLoopback = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'success',
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'authenticator-verification-select-authenticator'
  ]
};

// user verification: loopback with biometrics error
const userVerificationLoopbackBiometricsError = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop',
    // 'error-okta-verify-uv-fastpass-verify-enable-biometrics-mobile',
  ],
};

// user verification: Windows authenticator with custom URI
const userVerificationCustomUri = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri',
  ]
};

// user verification: custom URI with biometrics error
const userVerificationCustomUriBiometricsError = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri',
  ],
  '/idp/idx/authenticators/poll': [
    'error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop',
  ],
};

// user verification: Android authenticator with app link
const userVerificationAppLink = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback-challenge-not-received',
  ],
  '/idp/idx/identify': [
    'authenticator-verification-okta-verify-signed-nonce-app-link',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-app-link',
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-app-link',
  ]
};

// user verification: App link with biometrics error
const userVerificationAppLinkBiometricsError = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-app-link',
  ],
  '/idp/idx/authenticators/poll': [
    'error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile',
  ],
};

// user verification: Apple authenticator with Credential SSO extension
const userVerificationCredentialSSOExtension = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'// see playground/mocks/spec-okta-api/idp/idx/index.js for details
  ],
};

// user verification: Credential SSO extension with biometrics error
const userVerificationCredentialSSOExtensionBiometricsError = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify': [
    'error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile'
    //'error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop'
  ],
};

// user verification: Apple authenticator with universal link
const userVerificationUniversalLink = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link',
    'authenticator-verification-okta-verify-signed-nonce-universal-link',
    'authenticator-verification-okta-verify-signed-nonce-universal-link',
    'success',
  ],
};

// user verification: universal link with biometrics error
const userVerificationUniversalLinkBiometricsError = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link',
  ],
  '/idp/idx/authenticators/poll': [
    'error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile'
  ],
};

// ov enroll
const ovEnroll = {
  '/idp/idx/introspect': [
    'authenticator-enroll-ov-qr',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-ov-via-email',
  ],
  '/idp/idx/challenge/send': [
    'authenticator-enroll-ov-email',
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-ov-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-ov-email',
    'success'
  ],
};

// ov challenge m2 totp - success
const ovTotpSuccess = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-totp'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

// ov challenge (3 methods) and no other authenticator available
const onlyOVAuthenticatorTOTPChallenge = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-select-method'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-totp-onlyOV'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

// ov challenge m2 totp - error
const ovTotpError = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-totp'
  ],
  '/idp/idx/challenge/answer': [
    'error-okta-verify-totp',
    //'error-okta-verify-uv-totp-verify-enable-biometrics',
  ],
};

const totpEnableBiometrics = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-totp'
  ],
  '/idp/idx/challenge/answer': [
    'error-okta-verify-uv-totp-verify-enable-biometrics',
  ],
};

// ov challenge m2 push - success
const ovPushSuccess = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'success',
  ],
};

// ov challenge m2 push - wait
const ovPushWait = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
  ],
};

// ov challenge m2 push - error
const ovPushError = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-reject-push',
  ],
};

// Okta Verify challenge signed nonce - loopback server
const ovSignedNonceLoopback = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-signed-nonce-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'success',
  ],
};

// Okta Verify challenge signed nonce - custom uri
const ovSignedNonceCustomUri = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-signed-nonce-custom-uri'
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'identify',
  ],
};

// Okta Verify challenge signed nonce - SSO Extension
const ovSignedNonceSsoExtension = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link'
  ],
};

// Okta Verify challenge signed nonce - universal link
const ovSignedNonceUniversalLink = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-signed-nonce-universal-link'
  ],
};

// no profile available for verification
const phoneVerificationNoPhoneNumber = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-no-profile'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-data-phone-sms-then-voice-no-profile',
    'authenticator-verification-phone-sms-no-profile',
    'authenticator-verification-data-phone-voice-then-sms-no-profile',
    'authenticator-verification-phone-voice-no-profile',
  ],
};

// no profile available for verification
const emailVerificationNoEmail = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-no-profile',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-email-no-profile',
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-no-profile',
  ],
};

// phone enroll safe mode
const phoneEnroll = {
  '/idp/idx/introspect': [
    'authenticator-enroll-phone',
  ],
  '/idp/idx/challenge/answer': [
    'safe-mode-optional-enrollment',
    'safe-mode-required-enrollment',
    'safe-mode-credential-enrollment-intent',
  ],
};

const duoMFAEnroll = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-duo',
  ],
  '/idp/idx/challenge/answer': [
    'success',
    //'error-authenticator-verification-duo',
  ],
};

const duoMFAVerify = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-duo',
  ],
  '/idp/idx/challenge/answer': [
    'success',
    //'error-authenticator-verification-duo',
  ],
};

const safeModePoll = {
  '/idp/idx/introspect': [
    'identify-with-password',
  ],
  '/idp/idx/identify': [
    'authenticator-enroll-select-authenticator',
  ],
  '/idp/idx/credential/enroll': [
    'safe-mode-polling',
  ],
  '/idp/idx/poll': [
    // 'safe-mode-polling',
    'safe-mode-polling',
    'safe-mode-polling-refreshed-interval',
    'error-safe-mode-polling',
    // 'authenticator-enroll-ov-via-sms',
    // 'terminal-polling-window-expired'
  ],
};

const onPremMFAEnroll = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-on-prem',
    //'authenticator-enroll-rsa',
  ],
  '/idp/idx/challenge/answer': [
    'success',
    //'error-authenticator-enroll-passcode-change-on-prem',
    //'error-authenticator-enroll-passcode-change-rsa',
  ],
};

const onPremMFAVerify = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-on-prem',
    //'authenticator-verification-rsa',
  ],
  '/idp/idx/challenge/answer': [
    'success',
    //'error-authenticator-verification-on-prem',
    //'error-authenticator-verification-passcode-change-on-prem',
    //'error-authenticator-verification-rsa',
    //'error-authenticator-verification-passcode-change-rsa'
  ],
};

const passwordRecovery = {
  '/idp/idx/introspect': [
    'identify-recovery',
  ],
  '/idp/idx/identify': [
    // 'error-identify-access-denied',
    'authenticator-verification-select-authenticator',
  ],
};

const idpAuthenticator = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator',
    // 'authenticator-verification-select-authenticator',
    // 'authenticator-verification-select-authenticator-custom-logo',
    'success',
    // Errors:
    //  - Unlike other authenticators, these occur during idx/introspect
    // 'error-authenticator-enroll-idp',
    // 'error-authenticator-enroll-idp-custom-logo',
    // 'error-authenticator-verification-idp',
    // 'error-authenticator-verification-idp-custom-logo'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-idp',
    // 'authenticator-verification-idp-custom-logo'
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-idp',
    // 'authenticator-enroll-idp-custom-logo'
  ]
};

const userUnlockAccount = {
  '/idp/idx/introspect': [
    'identify-with-unlock-account-link',
  ],
  '/idp/idx/unlock-account': [
    'user-unlock-account',
  ],
  '/idp/idx/challenge': [
    // 'error-400-unlock-account',
    // 'authenticator-verification-data-phone-sms-then-voice',
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/answer': [
    'user-account-unlock-success',
    //'user-account-unlock-success-land-on-app'
  ]
};

const symantecVipAuthenticator = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator',
    // 'authenticator-verification-select-authenticator',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-symantec-vip',
  ],
  '/idp/idx/challenge/answer': [
    // 'error-authenticator-verification-symantec-vip-invalid-passcode'
    'success',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-symantec-vip',
  ],
};

const emailChallengeConsent = {
  '/idp/idx/introspect': [
    'email-challenge-consent',
  ],
  '/idp/idx/consent': [
    'terminal-return-email-consent',
    'terminal-return-email-consent-denied',
  ],
};

const googleAuthenticatorVerify = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-google-authenticator',
  ],
  '/idp/idx/challenge/answer': [
    'success',
    //'error-authenticator-verification-on-google-otp-invalid-passcode',
    //'error-authenticator-verification-on-google-otp-used-passcode'
  ],
};

const pivAuth = {
  '/idp/idx/introspect': [
    'identify-with-third-party-idps',
    //'error-identify-with-piv',
    //'identify-with-piv-only',
  ],
};

const yubikeyAuthenticator = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator',
    // 'authenticator-verification-select-authenticator',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-yubikey',
  ],
  '/idp/idx/challenge/answer': [
    'success',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-yubikey',
  ],
};

const secondaryEmail = {
  '/idp/idx/introspect': [
    'identify-with-password'
  ],
  '/idp/idx/identify': [
    'enroll-profile-update-params',
    'enroll-profile-update-all-optional-params',
    'enroll-profile-update-params'
  ],
  '/idp/idx/skip': [
    'success-with-app-user'
  ],
  '/idp/idx/enroll/new': [
    'success-with-app-user'
  ]
};

const selfServiceRegistration = {
  '/api/v1/authn': [
    'success-001',
  ],
  '/api/v1/registration/form': [
    'form',
  ],
  '/api/v1/registration/:id/register': [
    'register',
  ],
  '/idp/idx/enroll/new': [
    'profile-enrollment-string-fields-options'
  ]
};

const oktaVerifyPushNotification = {
  '/idp/idx/introspect': [
    'identify-with-password',
  ],
  '/idp/idx/identify': [
    'authenticator-verification-select-authenticator-without-signed-nonce',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
};

const rememberLastUsedOktaVerify = {
  '/idp/idx/introspect': [
    'identify-with-password',
  ],
  '/idp/idx/identify': [
    'authenticator-verification-data-okta-verify-push-autoChallenge-off',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
};

const selectOktaVerifyMethod = {
  '/idp/idx/introspect': [
    'identify-with-password',
  ],
  '/idp/idx/identify': [
    'authenticator-enroll-ov-via-email',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-push-autoChallenge-on',
  ],
};

const smartCardEnrollOrVerify = {
  '/idp/idx/introspect': [
    'authenticator-enroll-smartcard',
    // 'authenticator-verification-smartcard',
  ],
};

module.exports = {
  mocks: idx
};
