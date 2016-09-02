var CONTAINER_ID = 'okta-login-container',
    APP_ID = 'oidc-app';

function addMessageToPage(msg) {
  var appNode = document.createElement('div');
  appNode.setAttribute('id', APP_ID);
  appNode.innerHTML = msg;
  document.body.appendChild(appNode);

  document.getElementById(CONTAINER_ID).remove();
}

var oktaSignIn = new OktaSignIn({
  baseUrl: '{{{WIDGET_TEST_SERVER}}}',
  clientId: 'rW47c465c1wc3MKzHznu',
  redirectUri: 'http://localhost:3000/done',
  authParams: {
    responseType: 'id_token',
    responseMode: 'okta_post_message',
    scope: ['openid', 'email', 'profile', 'address', 'phone']
  },
  idpDisplay: 'SECONDARY',
  idps: [{
    'type': 'GOOGLE',
    'id': '0oaaix1twko0jyKik0g4'
  }, {
    'type': 'FACEBOOK',
    'id': '0oar25ZnMM5LrpY1O0g3'
  }, {
    'type': 'LINKEDIN',
    'id': '0oaaix1twko0jyKik0g4'
  }]
});

oktaSignIn.renderEl(
  { el: '#okta-login-container' },
  function (res) {
    if (res.status === 'SUCCESS') {
      addMessageToPage('user: ' + res.claims.name);
    }
  },
  function (err) {
    addMessageToPage(JSON.stringify(err));
  }
);
