// These response configs match the mocks configured in ChallengeAuthenticatorEmail_spec.js

const { withNetworkFailure } = require('../networkFailureHelper');

const sendEmailMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-data-email'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email'
  ]
};

const sendEmailNoProfileMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-data-email-no-profile'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email'
  ]
};

const sendEmailMockWithoutEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-verification-data-email'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-email-no-profile-no-emailmagiclink'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-no-profile-no-emailmagiclink'
  ]
};

const tooManyRequestPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-429-authenticator-verification-email-polling'
  ]
};

const apiLimitExceededPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-429-api-limit-exceeded'
  ]
};

const dynamicRefreshShortIntervalMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-polling-short'
  ]
};

const dynamicRefreshLongIntervalMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-polling-long'
  ]
};

const stopPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-401-session-expired'
  ]
};

const invalidOTPMockWithPoll = {
  '/idp/idx/introspect': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/answer': [
    'error-401-invalid-email-otp-passcode'
  ]
};

const terrminalConsentDeniedPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling-very-short'
  ],
  '/idp/idx/challenge/poll': [
    'terminal-enduser-email-consent-denied',
  ],
};

// OKTA-1083742: Simulate network failure during polling to test recovery
const networkFailurePollingMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-data-email'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-email'
  ],
  '/idp/idx/challenge/poll': withNetworkFailure(
    ['authenticator-verification-email'],
    { failOnRequests: [2] }
  ),
};

module.exports = {
  sendEmailMock,
  sendEmailNoProfileMock,
  sendEmailMockWithoutEmailMagicLink,
  tooManyRequestPollMock,
  apiLimitExceededPollMock,
  dynamicRefreshShortIntervalMock,
  dynamicRefreshLongIntervalMock,
  stopPollMock,
  invalidOTPMockWithPoll,
  terrminalConsentDeniedPollMock,
  networkFailurePollingMock,
};
