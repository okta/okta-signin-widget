// This example app will test using the okta-sign-in.entry.js file. It must
// be built after the okta-sign-in.entry.js has been built in the build:release
// task.
//
// Options are currently not configurable - update this in the future if we
// want more granularity in testing the npm artifact vs. the cdn artifact.

// - To build, first copy to "target". Grunt will do variable substitution
// grunt copy:e2e
// - then webpack
// yarn build:webpack-e2e-app

var OktaSignIn = require('../../js/okta-sign-in.entry');

var signIn = new OktaSignIn({
  baseUrl: '{{{WIDGET_TEST_SERVER}}}'
});

signIn.renderEl({el: '#okta-login-container'}, function (res) {
  if (res.status !== 'SUCCESS') {
    return;
  }
  res.session.setCookieAndRedirect('{{{WIDGET_TEST_SERVER}}}/app/UserHome');
});
