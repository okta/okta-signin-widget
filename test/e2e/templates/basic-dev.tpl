{{#> devLayout}}
var oktaSignIn;

function initialize(options) {
  oktaSignIn = new OktaSignIn(options);
  oktaSignIn.renderEl({ el: '#okta-login-container' });
}
{{/devLayout}}
