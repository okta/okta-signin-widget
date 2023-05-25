// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  'Animations_spec.js', // 1 test should be migrated to TestCafe
  // 'EnrollCall_spec.js', // migration is complete
  // 'EnrollSms_spec.js', // migration is complete
  // 'IDPDiscovery_spec.js', // 4 tests should be migrated to TestCafe
  'LoginRouter_spec.js', // 34 failed, login bundle + pkce + clock
  // 'MfaVerify_spec.js', // 4 tests should be migrated to TestCafe
  // 'PrimaryAuth_spec.js', // 7 tests should be migrated to TestCafe
  // 'EnrollTotpController_spec.js', // migration is complete
  // 'PollController_spec.js' // migration is complete
];
