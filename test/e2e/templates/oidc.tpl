{{#> cdnLayout}}

{{#*inline "pre-widget-script-block"}}
(function iife() { 
  window.globalCspTrap = globalCspTrap = [];
  document.addEventListener("securitypolicyviolation", function(e) {
    globalCspTrap.push(e);
  });
})();
{{/inline}}

function _initialize(event) {
  event.preventDefault();
  var config = JSON.parse(document.getElementById('config-textarea').value);
  initialize(config);
}

var CONFIG = {
  baseUrl: '{{{WIDGET_TEST_SERVER}}}',
  // SPA clientId
  clientId: '{{{WIDGET_SPA_CLIENT_ID}}}',
  redirectUri: 'http://localhost:3000/done',
  authParams: {
    pkce: false,
    issuer: '{{WIDGET_TEST_SERVER}}/oauth2/{{WIDGET_AUTH_SERVER_ID}}',
    responseType: 'id_token',
    scopes: ['openid', 'email', 'profile', 'address', 'phone']
  },
  idps: [
    {
      'type': 'FACEBOOK',
      'id': '{{WIDGET_IDP_FACEBOOK_ID}}'
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

function replaceMessageOnPage(id, msg) {
  var containerNode = document.getElementById(id);
  if (containerNode) {
    containerNode.remove();
  }

  var appNode = document.createElement('div');
  appNode.setAttribute('id', id);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);
}

function initialize(options) {

  replaceMessageOnPage('csp-errors', globalCspTrap.map( function(err) { 
    return err.blockedURI + " blocked due to CSP rule " + err.violatedDirective + " from " + err.originalPolicy;
  }).join('')); 

  var oktaSignIn = new OktaSignIn(options);
  oktaSignIn.renderEl(
    { el: '#okta-login-container' },
    function (res) {
      if (res.status !== 'SUCCESS') {
        return;
      }
      
      var idToken = res.tokens.idToken;
      var accessToken = res.tokens.accessToken;

      if (idToken) {
        addMessageToPage('idtoken_user', idToken.claims.name);
      } 
      
      if (accessToken) {
        addMessageToPage('accesstoken_type', accessToken.tokenType);
      }
    },
    function (err) {
      addMessageToPage('oidc_error', JSON.stringify(err));
    }
  );
}

function triggerCspViolation() { 
  eval("var cspTrigger = true;");
}

if (window.location.search === '?fail-csp') { 
  try { 
    triggerCspViolation();
  } catch (e) { 
    console.warn(e);
  }
}

{{/cdnLayout}}
