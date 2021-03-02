import './karma/karma-enforce-precompile';

const karma = window.__karma__;
const testsContext = require.context('./spec/', true, /.*_spec\.js$/);

// Tests which are run in Jest do not need to be run in Karma
const jestTests = [
  /v2\/.*/,
  /OktaSignIn_spec/
];

testsContext.keys().forEach(key => {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return;
  }

  jestTests.forEach(regex => {
    if (key.match(regex)) {
      return;
    }
  });
  testsContext(key);
});
