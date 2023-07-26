const config = {
  baseUrl: 'http://localhost:3000',
  logo: '/img/logo_widgico.png',
  logoText: 'Windico',
  features: {
    router: true,
    rememberMe: true,
    multiOptionalFactorEnroll: true
  },
  // Do not bootstrap stateToken if you want to enable v1
  stateToken: 'dummy-state-token-wrc',
  authParams: {
    pkce: false // PKCE is enabled by default in okta-auth-js@3.0
  },
  i18n: {
    en: {
      'consent.scopes.profile.desc': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque nec nam aliquam sem et tortor. Amet consectetur adipiscing elit duis tristique sollicitudin nibh sit. Non tellus orci ac auctor augue mauris augue neque gravida. Mauris a diam maecenas sed enim. Felis eget velit aliquet sagittis. Nisl purus in mollis nunc sed. Risus pretium quam vulputate dignissim suspendisse in est ante. Metus aliquam eleifend mi in nulla. Volutpat maecenas volutpat blandit aliquam. Eu consequat ac felis donec et odio pellentesque diam volutpat. Interdum velit euismod in pellentesque massa placerat. Posuere lorem ipsum dolor sit amet. Venenatis cras sed felis eget velit aliquet sagittis id consectetur. Vitae suscipit tellus mauris a diam maecenas.'
    }
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
