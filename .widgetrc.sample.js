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
  // Diagnostic feedback -> Sentry (gen3 only).
  // See src/v3/docs/terminal-feedback-diagnostics.md.
  // To verify end-to-end against a dev Sentry project, either paste your dev DSN
  // below, or (easier, no rebuild) pass it in the playground URL:
  //   http://localhost:3000/?sentryDsn=https://<key>@oXXX.ingest.sentry.io/<project>
  feedback: {
    enabled: true,
    sentryDsn: (typeof window !== 'undefined'
      && new URLSearchParams(window.location.search).get('sentryDsn')) || '',
    sentryEnvironment: 'dev',
    // POC: attach full raw IDX responses + request URLs (PII-bearing; trim later)
    includeRawResponses: true,
    // POC: on every completed flow (success OR terminal), emit one Sentry
    // *performance transaction* (init->finish timing + per-step waterfall) so you
    // can explore it in Sentry's traces dataset. 100% sampled — POC only.
    // Run a full flow to a success/terminal view, then look in Sentry:
    //   Explore -> Traces  (op:auth.flow) — root duration = init->finish time
    //   filter/group by attributes: authenticatorKey, flow, outcome, finalStep
    tracePoc: true
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
