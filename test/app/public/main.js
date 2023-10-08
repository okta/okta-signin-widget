function getOktaSignIn(options) {
  return new window.OktaSignIn(options);
}

function main() {
  const oktaSignIn = getOktaSignIn({
    baseUrl: 'http://localhost:3000',
    stateToken: 'dummy-state-token-wrc',
    authParams: {
      pkce: false // PKCE is enabled by default in okta-auth-js@3.0
    },
  });
  oktaSignIn.renderEl({
    el: '#okta-login-container'
  }, (res) => {
    
  });
}

main();