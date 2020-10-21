{{#> devLayout}}
{{> sharedFunctions }}

var options = {
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}',
  'el': '#okta-login-container',
  authParams: {
    pkce: false
  }
};
var oktaSignIn = new OktaSignIn(options);
{{/devLayout}}
