// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  'Animations_spec.js',
  'EnrollCall_spec.js',
  'EnrollChoices_spec.js',
  'EnrollCustomFactor_spec.js',
  'EnrollDuo_spec.js',
  'EnrollHotpController_spec.js',
  'EnrollOnPrem_spec.js',
  'EnrollQuestions_spec.js',
  'EnrollSms_spec.js',
  'EnrollSymantecVip_spec.js',
  'EnrollTotpController_spec.js',
  'EnrollSymantecVip_spec.js',
  'EnrollU2F_spec.js',
  'EnrollWebauthn_spec.js',
  'EnrollWindowsHello_spec.js',
  'EnrollYubikey_spec.js',
  'ForgotPassword_spec.js',
  'IDPDiscovery_spec',
  'LoginRouter_spec.js',
  'MfaVerify_spec.js',
  'MfaVerifyEmail_spec.js',
  'PasswordQuestion_spec.js',
  'PasswordReset_spec.js',
  'PasswordExpired_spec.js',
  'PollController_spec.js',
  'PrimaryAuth_spec.js',
  'RecoveryChallenge_spec.js',
  'RecoveryQuestion_spec.js',
  'RefreshAuthState_spec.js',
  'UnlockAccount_spec.js',
  'VerifyPIV_spec.js',
  'VerifyWebauthn_spec.js'
];
