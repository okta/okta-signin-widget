{{#> devLayout}}
var options = {
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}'
};
var oktaSignIn = new OktaSignIn(options);

oktaSignIn.renderEl(
  { el: '#okta-login-container' },
  function (res) {
    if (res.status === 'SUCCESS') {
      res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
    }
  }
);
{{/devLayout}}
