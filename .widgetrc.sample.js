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
  // "wrapper" (see `sentryWrapper` below) to have set window.Sentry first.
  feedback: {
    // Show the "Send feedback" entry point. Off by default (as in production):
    // CI copies this file to .widgetrc.js, so turning it on here changes the
    // views every parity / VRT / English-leaks test renders. Enable it in your
    // local .widgetrc.js instead.
    enabled: false
  },
  // Playground-only (NOT a widget option; stripped before the widget is created).
  // Config for playground/sentry-wrapper.ts, the local stand-in for okta-core's
  // @okta/sentry-wrapper. Point `dsn` at your own dev Sentry project, or pass
  // ?sentryDsn=... in the URL. Empty DSN = Sentry disabled.
  sentryWrapper: {
    dsn: '',
    environment: 'dev'
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
