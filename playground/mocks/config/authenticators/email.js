// These response configs match the mocks configured in ChallengeAuthenticatorEmail_spec.js

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
}

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
}

const tooManyRequestPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-429-authenticator-verification-email-polling'
  ]
}

const apiLimitExceededPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-429-api-limit-exceeded'
  ]
}

const dynamicRefreshShortIntervalMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-polling-short'
  ]
}

const dynamicRefreshLongIntervalMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-email-polling-long'
  ]
}

const stopPollMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-email-polling'
  ],
  '/idp/idx/challenge/poll': [
    'error-401-session-expired'
  ]
}

module.exports = {
  sendEmailMock,
  sendEmailMockWithoutEmailMagicLink,
  tooManyRequestPollMock,
  apiLimitExceededPollMock,
  dynamicRefreshShortIntervalMock,
  dynamicRefreshLongIntervalMock,
  stopPollMock
};
