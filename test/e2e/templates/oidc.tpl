{{#> cdnLayout}}

function _initialize(event) {
  event.preventDefault();
  var config = JSON.parse(document.getElementById('config-textarea').value);
  initialize(config);
}

var CONFIG = {
  baseUrl: '{{{WIDGET_TEST_SERVER}}}',
  clientId: '{{{WIDGET_CLIENT_ID}}}',
  redirectUri: 'http://localhost:3000/done',
  authParams: {
    issuer: '{{WIDGET_TEST_SERVER}}/oauth2/{{WIDGET_AUTH_SERVER_ID}}',
    responseType: 'id_token',
    scope: ['openid', 'email', 'profile', 'address', 'phone']
  },
  idps: [
    {
      'type': 'FACEBOOK',
      'id': '0oa85bk5q6KOPeHCT0h7'
    }
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  var formattedConfig = JSON.stringify(CONFIG, null, 2);
  formattedConfig = formattedConfig.replace(/\n/g, '\r\n');
  document.getElementById('config-textarea').value = formattedConfig;
});

  {{#*inline "body-block"}}
    <div>
      <a href="#" onclick="_initialize(event);">Initialize</a>
    </div>

    <textarea id="config-textarea" rows="20" cols="80" wrap="hard"></textarea>
  {{/inline}}



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
        res.forEach(function(token) {
          if (token.idToken) {
            addMessageToPage('idtoken_user', token.claims.name);
          } else if (token.accessToken) {
            addMessageToPage('accesstoken_type', token.tokenType);
          }
        });
      } else {
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
