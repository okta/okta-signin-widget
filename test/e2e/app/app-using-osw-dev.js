// This example app will test using the okta-sign-in.js file. It must
// be built after the okta-sign-in.js has been built in the build:release
// task.
//
// Options are currently not configurable - update this in the future if we
// want more granularity in testing the npm artifact vs. the cdn artifact.

var OktaSignIn = require('../../js/okta-sign-in');

var signIn = new OktaSignIn({
  baseUrl: '{{{WIDGET_TEST_SERVER}}}'
});

signIn.renderEl({el: '#okta-login-container'}, function (res) {
  if (res.status !== 'SUCCESS') {
    return;
  }
  res.session.setCookieAndRedirect('{{{WIDGET_TEST_SERVER}}}/app/UserHome');
});
