// These response configs match the mocks configured in EnrollAuthenticatorEmail_spec.js

const validOTPMock = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-email'
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-email'
  ]
};

const invalidOTPMock = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email'
  ],
  '/idp/idx/challenge': [
    'authenticator-enroll-email'
  ],
  '/idp/idx/challenge/answer': [
    'error-authenticator-enroll-email-invalid-otp'
  ]
};

const sendEmailMockWithoutEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-false'
  ],
  '/idp/idx/challenge': [
    'authenticator-enroll-email-emailmagiclink-false'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-email-emailmagiclink-false'
  ]
};

const sendEmailMockWithEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-true'
  ],
  '/idp/idx/challenge': [
    'authenticator-enroll-email-emailmagiclink-true'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-email-emailmagiclink-true'
  ]
};

const validOTPmockWithEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-true'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-email-emailmagiclink-true'
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-email-emailmagiclink-true'
  ]
};

const validOTPmockWithoutEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-false'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-email-emailmagiclink-false'
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-email-emailmagiclink-false'
  ]
};

const invalidOTPMockWithoutEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-false'
  ]
};

const invalidOTPMockWithEmailMagicLink = {
  '/idp/idx/introspect': [
    'authenticator-enroll-email-emailmagiclink-true'
  ]
};

module.exports = {
  validOTPMock,
  invalidOTPMock,
  sendEmailMockWithoutEmailMagicLink,
  sendEmailMockWithEmailMagicLink,
  validOTPmockWithEmailMagicLink,
  validOTPmockWithoutEmailMagicLink,
  invalidOTPMockWithoutEmailMagicLink,
  invalidOTPMockWithEmailMagicLink
};
