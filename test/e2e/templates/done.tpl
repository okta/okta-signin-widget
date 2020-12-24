{{#> cdnLayout}}
// OIDC Redirect Flow - this is the page that is redirected to with
// tokens in the parameters

// PKCE cannot be enabled because the test app is a "web" type. OKTA-246000 
var pkce = false;

{{> sharedFunctions }}

// auto-detect responseMode (when responseType is code)
var responseMode;
if (window.location.search.indexOf('code') >= 0) {
  responseMode = 'query';
} else if (window.location.hash.indexOf('code') >= 0) {
  responseMode = 'fragment';
}

var oktaSignIn = new OktaSignIn({
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}',
  // SPA clientId
  'clientId': '{{{WIDGET_SPA_CLIENT_ID}}}',
  authParams: {
    pkce: pkce,
    responseMode: responseMode
  }
});
addMessageToPage('page', 'oidc_app');

var authClient = new OktaAuth({
  issuer: '{{{WIDGET_TEST_SERVER}}}/oauth2/default',
  redirectUri: 'http://localhost:3000/done',
  pkce: pkce,
  responseMode: responseMode
});

if (authClient.token.isLoginRedirect()) {
  addMessageToPage('location_hash', window.location.hash);
  addMessageToPage('location_search', window.location.search);

  // We currently only process tokens with implicit flow.
  // For PKCE or authorization_code flow, the code will be left in the URL
  if (window.location.hash.indexOf('id_token') >= 0) {
    authClient.token.parseFromUrl()
      .then(function (res) {
        addTokensToPage(res.tokens);
      })
      .catch(function (err) {
        addMessageToPage('oidc_error', JSON.stringify(err));
      });
  }
}
{{/cdnLayout}}
