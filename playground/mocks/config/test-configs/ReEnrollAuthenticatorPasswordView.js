const mock = {
  '/idp/idx/introspect': [
    'authenticator-expired-password'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

const noComplexityMock = {
  '/idp/idx/introspect': [
    'authenticator-expired-password-no-complexity'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

const complexityInEnrollmentAuthenticatorMock = {
  '/idp/idx/introspect': [
    'authenticator-expired-password-with-enrollment-authenticator'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

const errorPostPasswordUpdateMock = {
  '/idp/idx/introspect': [
    'authenticator-expired-password'
  ],
  '/idp/idx/challenge/answer': [
    'authenticator-recovery-password-failure', // returns a 200 status
  ],
  '/idp/idx/cancel': [
    'identify'
  ]
};

module.exports = {
  mock,
  noComplexityMock,
  complexityInEnrollmentAuthenticatorMock,
  errorPostPasswordUpdateMock
};
