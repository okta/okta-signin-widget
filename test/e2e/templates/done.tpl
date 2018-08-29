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
  'clientId': 'rW47c465c1wc3MKzHznu'
});
addMessageToPage('page', 'oidc_app');

if (oktaSignIn.token.hasTokensInUrl()) {
  oktaSignIn.token.parseTokensFromUrl(
    function (res) {
      var tokens = Array.isArray(res) ? res : [res];
      for (var i = 0; i < tokens.length; ++i) {
        if (tokens[i].idToken) {
          addMessageToPage('idtoken_user', tokens[i].claims.name);
        }
      }
    },
    function (err) {
      addMessageToPage('oidc_error', JSON.stringify(err));
    }
  );
}
{{/cdnLayout}}
