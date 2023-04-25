// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  'Animations_spec.js', // asserts styles
  'EnrollCall_spec.js', 
  'EnrollChoices_spec.js', // migrate jasmin.clock
  'EnrollSms_spec.js',
  'IDPDiscovery_spec.js',
  'LoginRouter_spec.js',
  'MfaVerify_spec.js',
  'PrimaryAuth_spec.js', // migrate jasmin.clock
  'VerifyWebauthn_spec.js' // asserts styles
];
