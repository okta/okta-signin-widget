{{#> cdnLayout}}
// OIDC Redirect Flow - this is the page that is redirected to with
// tokens in the parameters

// PKCE cannot be enabled because the test app is a "web" type. OKTA-246000 
var pkce = false;

function addMessageToPage(id, msg) {
  var appNode = document.createElement('div');
  appNode.setAttribute('id', id);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);
}

// auto-detect responseMode (when responseType is code)
var responseMode;
if (window.location.search.indexOf('code') >= 0) {
  responseMode = 'query';
} else if (window.location.hash.indexOf('code') >= 0) {
  responseMode = 'fragment';
}

var oktaSignIn = new OktaSignIn({
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}',
  'clientId': '{{{WIDGET_CLIENT_ID}}}',
  authParams: {
    pkce: pkce,
    responseMode: responseMode
  }
});
addMessageToPage('page', 'oidc_app');

if (oktaSignIn.hasTokensInUrl()) {
  addMessageToPage('location_hash', window.location.hash);
  addMessageToPage('location_search', window.location.search);
  oktaSignIn.authClient.token.parseFromUrl()
    .then(function (res) {
      var idToken = res.tokens.idToken;
      if (idToken) {
        addMessageToPage('idtoken_user', idToken.claims.name);
      }
    })
    .catch(function (err) {
      addMessageToPage('oidc_error', JSON.stringify(err));
    });
}
{{/cdnLayout}}
