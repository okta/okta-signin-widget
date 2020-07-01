const FORMS = {
  IDENTIFY: 'identify',
  SELECT_IDENTIFY: 'select-identify',
  SELECT_ENROLL_PROFILE: 'select-enroll-profile',
  ENROLL_PROFILE: 'enroll-profile',

  SELECT_AUTHENTICATOR_AUTHENTICATE: 'select-authenticator-authenticate',
  AUTHENTICATOR_VERIFICATION_DATA: 'authenticator-verification-data',
  CHALLENGE_AUTHENTICATOR: 'challenge-authenticator',

  SELECT_AUTHENTICATOR_ENROLL: 'select-authenticator-enroll',
  SELECT_AUTHENTICATOR_ENROLL_DATA: 'select-authenticator-enroll-data',
  AUTHENTICATOR_ENROLLMENT_DATA: 'authenticator-enrollment-data',
  ENROLL_AUTHENTICATOR: 'enroll-authenticator',
  RE_ENROLL_AUTHENTICATOR: 're-enroll-authenticator',
  SKIP: 'skip',

  SUCCESS_REDIRECT: 'success-redirect',
  REDIRECT_IDP: 'redirect-idp',

  DEVICE_CHALLENGE_POLL: 'device-challenge-poll',
  DEVICE_APPLE_SSO_EXTENSION: 'device-apple-sso-extension',
  CANCEL_TRANSACTION: 'cancel-transaction',
  LAUNCH_AUTHENTICATOR: 'launch-authenticator',
};

const FORMS_WITHOUT_SIGNOUT = [
  FORMS.IDENTIFY,
  FORMS.SUCCESS_REDIRECT,
  FORMS.ENROLL_PROFILE,
  FORMS.SELECT_AUTHENTICATOR_ENROLL,
  FORMS.AUTHENTICATOR_ENROLLMENT_DATA,
  FORMS.ENROLL_AUTHENTICATOR,
  FORMS.REDIRECT_IDP,
  FORMS.RE_ENROLL_AUTHENTICATOR,
  // TODO: remove following when deprecating `factor`
  'select-factor-enroll',
  'enroll-factor'
];

export {
  FORMS,
  FORMS_WITHOUT_SIGNOUT,
};
