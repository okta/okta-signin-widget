import './karma/karma-enforce-precompile';

const karma = window.__karma__;
const testsContext = require.context('./spec/v1', true, /ForgotPassword_spec\.js$/);
const legacyTests = require('./legacy-tests');

testsContext.keys().filter(key => {
  // Filtered List
  if (karma.config.test && !key.includes(karma.config.test)) {
    return false;
  }
  if (legacyTests.find(regex => key.match(regex))) {
    return true;
  }
  return false;
}).forEach(key => {
  testsContext(key);
});
