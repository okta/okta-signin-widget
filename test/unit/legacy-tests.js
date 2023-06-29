// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  'Animations_spec.js', // need rework in jest
  // 'IDPDiscovery_spec.js', // 2 failed (xit) about window resize event
  // 'PrimaryAuth_spec.js', // 2 failed (xit) about window resize event
  // 'ErollCall', // timeout
  // 'ErollSms', // timeout
  // 'ErollTotp, // timeout
];
