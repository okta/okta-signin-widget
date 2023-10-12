// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  // 'Animations_spec.js', // (DONE via testcafe) need rework in jest
  // 'EnrollTotpController_spec.js', // skipped 1 timeout flaky test (xit)
  // 'IDPDiscovery_spec.js', // 2 skipped tests (xit) - need a way to assert change with securityBeaconContainer.hide
  // 'PrimaryAuth_spec.js', // 2 skipped (xit) need a way to assert change with securityBeaconContainer.hide
];
