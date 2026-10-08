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
  // Host the assets (i.e. json files) locally
  assets: {
    baseUrl: '/'
  },
  // User feedback -> Sentry (gen3 only). When enabled, the widget exposes a
  // "Send feedback" action (invokable from any view) that flushes the Sentry
  // Session Replay buffer and emits a linked User Feedback entry.
  //
  // The widget does NOT bundle/init its own Sentry SDK — it REQUIRES the Sentry
  // "wrapper" that playground/index.html loads (js/sentry-wrapper.js) to have set
  // window.Sentry first. The wrapper owns the DSN/environment (via
  // window.okta.sentry in index.html, or ?sentryDsn=... in the URL).
  // See src/v3/docs/sentry-user-feedback-playground.md.
  feedback: {
    // Show the "Send feedback" entry point. Default off in production.
    enabled: true,
    // Embedded/self-hosted opt-out: force the entry point off even if `enabled`
    // is turned on by the host login page. Default false.
    optOut: false
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
