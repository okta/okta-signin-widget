// These tests must still be run in Karma for some reason. Common reasons include:
// - UI assertions (DOM visibility) is failing (does it depend on CSS?)
// - events are missing properties such as "origin" that are bound to the source window
// - ???
module.exports = [
  'Animations_spec.js', // need rework in jest
  'EnrollCall_spec.js', // followup needed, spyon
  'EnrollSms_spec.js', // followup needed, spyon
  'IDPDiscovery_spec.js', // followup needed, 7 failed, jQuery :visible selector
  'LoginRouter_spec.js', // followup needed, 34 failed, login bundle + pkce + clock
  'MfaVerify_spec.js', // followup needed, 18 failed, isVisible + dropdown style + complex
  'PrimaryAuth_spec.js', // followup needed, 17 failed, css + clock + legacy function + isVisible
  'EnrollTotpController_spec.js'
];
