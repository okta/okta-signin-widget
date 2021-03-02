import './karma/karma-enforce-precompile';

const karma = window.__karma__;
const testsContext = require.context('./spec/', true, /.*_spec\.js$/);

// Tests which are run in Jest do not need to be run in Karma
const jestTests = [
  /v2\/.*/,
  /widget\/.*/,
  /OktaSignIn_spec/
];

testsContext.keys().filter(key => {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return false;
  }
  if (jestTests.find(regex => key.match(regex))) {
    return false;
  }
  return true;
}).forEach(key => {
  testsContext(key);
});
