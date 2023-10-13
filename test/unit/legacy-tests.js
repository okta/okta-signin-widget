// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  // 'Animations_spec.js', // migrated to TestCafe
  // 'EnrollCall_spec.js', // migration is complete
  // 'EnrollSms_spec.js', // migration is complete
  // 'MfaVerify_spec.js', // migration is complete
  // 'EnrollTotpController_spec.js', // migration is complete
  // 'LoginRouter_spec.js', // migration is complete
  // 'PollController_spec.js' // migration is complete
  // 'IDPDiscovery_spec.js', // 2 skipped tests (xit) - need a way to assert change with securityBeaconContainer.hide
  // 'PrimaryAuth_spec.js', // 2 skipped (xit) need a way to assert change with securityBeaconContainer.hide
];
