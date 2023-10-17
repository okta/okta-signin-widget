// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  // 'Animations_spec.js', // migration is complete
  // 'EnrollCall_spec.js', // migration is complete
  // 'EnrollSms_spec.js', // migration is complete
  // 'PollController_spec.js' // migration is complete
  // 'EnrollTotpController_spec.js', // migration is complete
  // 'PrimaryAuth_spec.js', // migration is complete
  // 'LoginRouter_spec.js', // 6 skipped tests (need to understand why failing)
  // 'IDPDiscovery_spec.js', // 4 tests should be migrated to TestCafe
  // 'MfaVerify_spec.js', // 4 tests should be migrated to TestCafe
];
