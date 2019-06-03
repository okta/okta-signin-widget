{{#> cdnLayout}}
// OIDC Redirect Flow - this is the page that is redirected to with
// tokens in the parameters

function addMessageToPage(id, msg) {
  var appNode = document.createElement('div');
  appNode.setAttribute('id', id);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);
}

var oktaSignIn = new OktaSignIn({
  'baseUrl': '{{{WIDGET_TEST_SERVER}}}',
  'clientId': '{{{WIDGET_CLIENT_ID}}}'
});
addMessageToPage('page', 'oidc_app');

if (oktaSignIn.hasTokensInUrl()) {
  oktaSignIn.authClient.token.parseFromUrl()
    .then(function (res) {
      var tokens = Array.isArray(res) ? res : [res];
      for (var i = 0; i < tokens.length; ++i) {
        if (tokens[i].idToken) {
          addMessageToPage('idtoken_user', tokens[i].claims.name);
        }
      }
    })
    .catch(function (err) {
      addMessageToPage('oidc_error', JSON.stringify(err));
    });
}
{{/cdnLayout}}
