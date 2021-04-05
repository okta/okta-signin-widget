/* eslint no-unused-vars: 0 */

const idx = {
  // ===== IDX

  // PKCE must be enabled with "useInteractionCodeFlow" option
  '/oauth2/default/.well-known/openid-configuration': [
    'well-known-openid-configuration'
  ],

  '/oauth2/default/v1/interact': [
    'interact'
    // 'error-feature-not-enabled'
  ],

  '/idp/idx/introspect': [
    'identify',
    // 'error-feature-not-enabled',
    // 'error-403-security-access-denied',
    // 'authenticator-enroll-email',
    // 'error-internal-server-error',
    // 'authenticator-enroll-password',
    // 'authenticator-enroll-phone',
    // 'authenticator-enroll-phone-voice',
    // 'authenticator-enroll-data-phone',
    // 'authenticator-enroll-data-phone-voice',
    // 'authenticator-enroll-ov-local',
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
    // 'enroll-profile',
    // 'enroll-profile-new',
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
    // 'success',
    // 'success-with-app-user',
    // 'terminal-return-email',
    // 'terminal-return-error-email',
    // 'terminal-return-expired-email',
    // 'terminal-return-stale-email',
    // 'terminal-transfered-email',
    // 'terminal-registration',
    // 'terminal-enduser-email-consent-denied',
    // 'oda-enrollment-ios',
    // 'oda-enrollment-android',
    // 'mdm-enrollment',
  ],
  '/idp/idx/enroll': [
    'enroll-profile-new'
  ],
  '/idp/idx/credential/enroll': [
    // 'authenticator-enroll-ov-via-sms',
    'authenticator-enroll-security-question',
    // 'authenticator-enroll-google-authenticator',
  ],
  '/idp/idx/identify': [
    'authenticator-enroll-select-authenticator',
    // 'identify-with-only-one-third-party-idp',
    // 'error-identify-access-denied',
    // 'error-identify-user-locked-unable-challenge'
  ],
  '/idp/idx/challenge/answer': [
    // 'error-email-verify',
    // 'terminal-return-expired-email',
    // 'error-answer-passcode-invalid'
    'error-authenticator-enroll-security-question'
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
    'success',
    // 'enroll-profile-new'
    // 'authenticator-enroll-email',
    // 'authenticator-verification-okta-verify-push',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-webauthn',
    // 'authenticator-verification-password',
    // 'authenticator-verification-okta-verify-totp',
    // 'authenticator-verification-okta-verify-push',
    // 'authenticator-verification-google-authenticator',
  ],
  '/idp/idx/enroll/new': [
    'error-new-signup-email',
    'error-new-signup-email-exists'
  ],
  '/idp/idx/cancel': [
    'identify',
  ],
  '/idp/idx/recover': [
    'error-forgot-password',
  ],
};

const consent = {
  '/idp/idx/introspect': [
    // 'consent-admin',
    'consent-enduser',
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
    'admin-consent-required',
  ],
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
// device probe: Windows authenticator with loopback server
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

// device probe: Windows authenticator with loopback server polling error (device not registered deny access)
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

// user verification: Windows/Android authenticator with loopback server
const userVerificationLoopback = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'authenticator-verification-okta-verify-signed-nonce-loopback',
    'success',
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

// user verification: Apple authenticator with Credential SSO extension
const userVerificationCredentialSSOExtension = {
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-signed-nonce-credential-sso-extension'
  ],
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel': [
    'identify'
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

// ov challenge m2 totp - error
const ovTotpError = {
  '/idp/idx/introspect': [
    'authenticator-verification-select-authenticator-ov-m2'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-totp'
  ],
  '/idp/idx/challenge/answer': [
    'error-okta-verify-totp'
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
    'success',
    // Errors:
    //  - Unlike other authenticators, these occur during idx/introspect
    // 'error-authenticator-enroll-idp',
    // 'error-authenticator-verification-idp',
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-idp',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-idp',
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
    // 'authenticator-verification-data-phone-sms-then-voice',
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/answer': [
    'user-account-unlock-success'
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

module.exports = {
  mocks: idx,
};
