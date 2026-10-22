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
// The "Send feedback" link + dialog surface is available on this (and any) view.
const simpleTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'terminal-return-error-email'
  ],
};

// Crash surface: /introspect returns HTTP 500 (the filename's error-500- prefix
// drives the status), so bootstrap throws and the widget sets responseError.
// With feedback.enabled, the inline "Report issue to Okta" form renders in place
// of the plain "Unable to load page" error view. Submit is gated on the consent
// checkbox; a successful send swaps in the green "Report sent to Okta" confirmation.
const crashMock = {
  ...base,
  '/idp/idx/introspect': [
    'error-500-internal-server-error'
  ],
};

// "Send feedback" dialog surface: land on a normal, actionable step (identify)
// and STAY there (no identify route registered, so submitting does nothing).
// The bottom-of-view "Send feedback" link opens the dialog. Submit is gated on
// the consent checkbox; a successful send closes the dialog + shows a success toast.
const activeStepMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
};

// Realistic multi-step journey for exercising the Sentry event + Session Replay
// end to end. Two good actionable steps, then an error terminal:
//   1. introspect        -> identify (enter any username, Next)
//   2. identify          -> email verification w/ a direct OTP field
//                           (enter any code, Verify) — the no-magic-link variant
//                           lands straight on the passcode input so the next POST
//                           goes to /challenge/answer
//   3. challenge/answer  -> terminal-return-error-email (error terminal)
// On steps 1-2 the bottom-of-view "Send feedback" link + dialog is available; on
// step 3 the inline "Report issue to Okta" crash form renders. Either way the
// replay buffer has captured the full multi-request journey, so the feedback
// event in Sentry links a replay that walks through all three steps.
const multiStepThenTerminalMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-email-without-emailmagiclink'
  ],
  '/idp/idx/challenge/answer': [
    'terminal-return-error-email'
  ],
};

module.exports = {
  identifyThenTerminalMock,
  simpleTerminalMock,
  crashMock,
  activeStepMock,
  multiStepThenTerminalMock,
};
