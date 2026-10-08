// Mock flows for exercising the gen3 "Send feedback" -> Sentry feature locally.
// See src/v3/docs/sentry-user-feedback-playground.md.
//
// The feature is invokable from ANY view (not just terminal errors). These mocks
// just give a tester a deterministic flow to click through and then send feedback
// from. Wire one in via a ONE-LINE change at the bottom of ../responseConfig.js:
//   mocks: Test.FeedbackDemo.identifyThenTerminalMock  // a short flow + a view
//   mocks: Test.FeedbackDemo.simpleTerminalMock        // land on a view immediately
//
// Each export is a complete mocks object (incl. the base oauth2 endpoints) so it
// fully replaces `idx` without 403s during bootstrap.

// Base endpoints needed to bootstrap the widget (match responseConfig.js).
const base = {
  '/oauth2/default/.well-known/openid-configuration': [
    'well-known-openid-configuration'
  ],
  '/oauth2/default/v1/interact': [
    'interact'
  ],
  '/oauth2/default/v1/token': [
    'error-token-invalid-grant-pkce'
  ],
};

// /introspect -> identify (username) view -> terminal. Load, enter any username,
// click Next, then "Send feedback" from the resulting view.
const identifyThenTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'terminal-return-error-email'
  ],
};

// Simplest: land directly on a view on page load (zero clicks before sending).
const simpleTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'terminal-return-error-email'
  ],
};

module.exports = {
  identifyThenTerminalMock,
  simpleTerminalMock,
};
