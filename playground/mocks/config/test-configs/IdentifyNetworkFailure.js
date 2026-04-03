// Reproduce network/connection error scenarios on /idp/idx/identify.
//
// There are two distinct error paths depending on how the failure manifests:
//
// 1. Non-IDX error response (e.g. server returns 403 with a standard Okta error body):
//    auth-js catches the AuthApiError (which has xhr) in generateIdxAction,
//    creates an IdxTransaction with requestDidSucceed=false and no IDX messages.
//    The widget renders this through transformTerminalMessages → "error.unsupported.response".
//    → Use `error-non-idx-response` to reproduce this path.
//
// 2. Socket-level failure (e.g. TCP connection dropped, DNS failure):
//    fetch() throws TypeError("Failed to fetch"), which auth-js wraps as AuthApiError
//    and re-throws. The widget catches this in transformUnhandledErrors.
//    → Use withNetworkFailure() to reproduce this path.
//
// 3. Empty body response (e.g. server returns 403 with 0-byte body):
//    auth-js's generateIdxAction calls JSON.parse("") which throws SyntaxError.
//    SyntaxError is not AuthApiError, so it re-throws to transformUnhandledErrors.
//    → Use `error-empty-response` to reproduce this path.

const { withNetworkFailure } = require('../networkFailureHelper');

// Path 1: Server returns a non-IDX error response (empty body + error status).
// This is the scenario from the issue report where the user sees
// "There was an unsupported response from server."
const identifyNonIdxErrorMock = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'error-non-idx-response',
  ],
};

// Path 2: Socket destroyed (simulates "Failed to fetch" / true network failure).
const identifyNetworkFailureMock = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': withNetworkFailure(
    ['error-identify-access-denied'],
    { failOnRequests: [1] }
  ),
};

module.exports = {
  identifyNonIdxErrorMock,
  identifyNetworkFailureMock,
};
