export const SHOW_RESEND_TIMEOUT = 30000;
export const WARNING_TIMEOUT = 30000;
export const CHALLENGE_TIMEOUT = 300000;
export const MS_PER_SEC = 1000;
export const UNIVERSAL_LINK_POST_DELAY = 500;
export const CANCEL_POLLING_ACTION = 'authenticatorChallenge-cancel';
export const AUTHENTICATOR_CANCEL_ACTION = 'currentAuthenticator-cancel';
export const WIDGET_FOOTER_CLASS = 'siw-main-footer';
export const FASTPASS_FALLBACK_SPINNER_TIMEOUT = 4000;
export const IDENTIFIER_FLOW = 'IDENTIFIER';
export const OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP 
  = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.desktop';
export const OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE 
  = 'oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.mobile';
export const AUTHENTICATOR_ALLOWED_FOR_OPTIONS = {
  ANY: 'any',
  SSO: 'sso',
  RECOVERY: 'recovery',
};
export const REQUEST_PARAM_AUTHENTICATION_CANCEL_REASON = 'reason';
export const LOOPBACK_RESPONSE_STATUS_CODE = 'statusCode';
export const AUTHENTICATION_CANCEL_REASONS = {
  LOOPBACK_FAILURE: 'OV_UNREACHABLE_BY_LOOPBACK',
  OV_ERROR: 'OV_RETURNED_ERROR',
  USER_CANCELED: 'USER_CANCELED',
};
