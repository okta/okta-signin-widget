// Mock flows for demoing the gen3 "Send feedback" terminal diagnostics feature.
// See src/v3/docs/terminal-feedback-diagnostics.md.
//
// Usage: ONE-LINE change at the bottom of ../responseConfig.js — replace
//   mocks: idx
// with one of:
//   mocks: Test.FeedbackDiagnosticsDemo.identifyThenTerminalMock  // recommended
//   mocks: Test.FeedbackDiagnosticsDemo.simpleTerminalMock         // zero-click
//   mocks: Test.FeedbackDiagnosticsDemo.pollingTerminalMock        // multi-step + polling
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

// RECOMMENDED demo: /introspect -> a simple view (identify / username) -> terminal.
// Flow: load -> identify form -> enter any username -> Next -> ERROR terminal ->
// "Send feedback". Trail: identify -> terminal (two transactions).
const identifyThenTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'terminal-return-error-email'
  ],
};

// Simplest: land directly on an ERROR terminal on page load (zero clicks).
const simpleTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'terminal-return-error-email'
  ],
};

// Richer trail: identify -> email verification (auto-polls) -> the cycling
// sequencer returns "waiting" twice, then an ERROR terminal. Exercises collapsed
// poll steps in the trail.
const pollingTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email',
    'authenticator-verification-email',
    'terminal-polling-window-expired'
  ],
};

module.exports = {
  identifyThenTerminalMock,
  simpleTerminalMock,
  pollingTerminalMock,
};
