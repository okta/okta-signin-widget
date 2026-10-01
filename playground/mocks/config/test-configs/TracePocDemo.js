// Mock flows for demoing the gen3 tracing POC (feedback.tracePoc).
// See src/v3/src/util/sentryTracePoc.ts and docs/terminal-feedback-diagnostics.md.
//
// Unlike FeedbackDiagnosticsDemo (which ends on a terminal ERROR to show the
// "Send feedback" button), the tracing POC fires on any COMPLETED flow (SUCCESS
// or TERMINAL) and emits one Sentry performance transaction (op:auth.flow) with
// a per-step child span (op:auth.step). So these are happy-path flows that reach
// SUCCESS, giving a multi-step waterfall + a searchable `authenticatorKey`.
//
// Usage: ONE-LINE change at the bottom of ../responseConfig.js — replace
//   mocks: idx
// with one of:
//   mocks: Test.TracePocDemo.passwordSuccessMock       // recommended: 3-step success (okta_password)
//   mocks: Test.TracePocDemo.oktaVerifyTotpSuccessMock // okta_verify (TOTP) — for group-by-authenticator
//   mocks: Test.TracePocDemo.oktaVerifyPushSuccessMock // okta_verify (push) — collapsed polls + success
//   mocks: Test.TracePocDemo.oktaVerifyMfaPushMock     // COMPLEX: password + OV push MFA (deep funnel)
//   mocks: Test.TracePocDemo.oktaVerifySelectPushMock  // OV push via authenticator picker (no password)
//   mocks: Test.TracePocDemo.terminalErrorMock         // outcome:error trace
//
// Each export is a complete mocks object (incl. the oauth2 endpoints) so it
// fully replaces `idx` without 403s during bootstrap. `success-tokens` on the
// token endpoint lets the interaction-code exchange complete cleanly.

// Base endpoints needed to bootstrap the widget + complete the OAuth exchange.
const base = {
  '/oauth2/default/.well-known/openid-configuration': [
    'well-known-openid-configuration'
  ],
  '/oauth2/default/v1/interact': [
    'interact'
  ],
  '/oauth2/default/v1/token': [
    'success-tokens'
  ],
};

// RECOMMENDED: username -> password -> success. Three transactions in the trail
// (introspect/identify -> challenge-authenticator/password -> success), so the
// Sentry waterfall shows the full init->finish timing with per-step spans.
// authenticatorKey resolves to `okta_password`.
const passwordSuccessMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-password'
  ],
  '/idp/idx/challenge/answer': [
    'success-with-interaction-code'
  ],
};

// Okta Verify (TOTP): land directly on the OV code prompt -> enter code ->
// success. Two transactions; authenticatorKey resolves to `okta_verify`. Use
// this to demo the "how many flows use okta_verify" group-by in Sentry.
const oktaVerifyTotpSuccessMock = {
  ...base,
  '/idp/idx/introspect': [
    'authenticator-verification-okta-verify-totp'
  ],
  '/idp/idx/challenge/answer': [
    'success-with-interaction-code'
  ],
};

// Okta Verify (push) with polling: username -> push (auto-polls) -> the cycling
// sequencer returns "waiting" twice, then a SUCCESS. Exercises collapsed poll
// steps (single trail entry with `count`) plus a success outcome; authenticatorKey
// resolves to `okta_verify`.
const oktaVerifyPushSuccessMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-okta-verify-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'success-with-interaction-code'
  ],
};

// Terminal ERROR path: username -> ERROR terminal. Emits a trace with
// outcome:error (and also shows the "Send feedback" button if feedback.enabled).
const terminalErrorMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'terminal-return-error-email'
  ],
};

// COMPLEX (recommended): full MFA with Okta Verify PUSH.
//   username -> password (1st factor) -> pick a 2nd factor -> Okta Verify push
//   (auto-polls "waiting" x2, then approved) -> success.
// Trail (5 transactions): identify -> challenge-authenticator (okta_password) ->
// select-authenticator -> challenge-authenticator (okta_verify, polls collapse to
// one span) -> success. Gives a deep funnel + waterfall; final authenticatorKey
// resolves to okta_verify. Walk it: enter any username -> Next -> any password ->
// Verify -> choose "Okta Verify" -> it auto-polls then completes.
const oktaVerifyMfaPushMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-password'
  ],
  // After the password is answered, present the authenticator picker (2nd factor).
  '/idp/idx/challenge/answer': [
    'authenticator-verification-select-authenticator'
  ],
  // Selecting Okta Verify from the picker POSTs here -> the push challenge.
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push'
  ],
  // The push view auto-polls: two "waiting" ticks (collapsed into one span with a
  // count) then an approval that completes the flow.
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'success-with-interaction-code'
  ],
};

// SIMPLER OV variant (high-confidence fallback): username -> pick authenticator ->
// Okta Verify push (polls) -> success. No password factor.
// Trail: identify -> select-authenticator -> challenge-authenticator (okta_verify) ->
// success. Use this if the MFA chain above misbehaves with your fixtures.
const oktaVerifySelectPushMock = {
  ...base,
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'authenticator-verification-select-authenticator'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-okta-verify-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'authenticator-verification-okta-verify-push',
    'success-with-interaction-code'
  ],
};

module.exports = {
  passwordSuccessMock,
  oktaVerifyTotpSuccessMock,
  oktaVerifyPushSuccessMock,
  terminalErrorMock,
  oktaVerifyMfaPushMock,
  oktaVerifySelectPushMock,
};
