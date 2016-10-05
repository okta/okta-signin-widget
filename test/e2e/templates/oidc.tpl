{{#> cdnLayout}}
var CONTAINER_ID = 'okta-login-container';

function addMessageToPage(id, msg) {
  var containerNode = document.getElementById(CONTAINER_ID);
  if (containerNode) {
    containerNode.remove();
  }

  var appNode = document.createElement('div');
  appNode.setAttribute('id', id);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);
}

function initialize(options) {
  var oktaSignIn = new OktaSignIn(options);
  oktaSignIn.renderEl(
    { el: '#okta-login-container' },
    function (res) {
      if (res.status !== 'SUCCESS') {
        return;
      }

      if (Array.isArray(res)) {
        // Assumes id_token is first, and accessToken is second
        addMessageToPage('idtoken_user', res[0].claims.name);
        addMessageToPage('accesstoken_type', res[1].tokenType);
      }

      else {
        // Simple idToken test case will just unpack the name and add it
        // to the page
        addMessageToPage('idtoken_user', res.claims.name);
      }

    },
    function (err) {
      addMessageToPage('oidc_error', JSON.stringify(err));
    }
  );
}
{{/cdnLayout}}
