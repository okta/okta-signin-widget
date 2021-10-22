const config = {
  baseUrl: 'http://localhost:3000',
  logo: '/img/logo_widgico.png',
  logoText: 'Windico',
  features: {
    router: true,
    rememberMe: true,
    multiOptionalFactorEnroll: true
  },
  //Comment out stateToken to enable api/v1
  stateToken: 'dummy-state-token-wrc',
  authParams: {
    pkce: false // PKCE is enabled by default in okta-auth-js@3.0
  },
  // Host the assets (i.e. json files) locally
  assets: {
    baseUrl: '/'
  },
  // Hooks block processing and run custom logic before or after a form is rendered
  hooks: {
    'identify': {
      after: [
        // createDummyHook('after-identify', 0)
      ]
    },
    'success-redirect': {
      before: [
        // createDummyHook('before-success-redirect',  1000)
      ]
    }
  }
};

function createDummyHook(name, waitTimeMs) {
  // Hook functions receive no parameters. They may return a promise but the value is not used.
  return function() {
    console.log('hook started: ' + name);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('hook finished: ' + name);
        resolve();
      }, waitTimeMs);
    });
  };
}

module.exports = config;
