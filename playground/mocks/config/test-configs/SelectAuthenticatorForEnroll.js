const mockEnrollAuthenticatorCustomOTP = {
  '/idp/idx/introspect': [
    'authenticator-enroll-select-authenticator'
  ],
  '/idp/idx/credential/enroll': [
    'error-authenticator-enroll-custom-otp'
  ],
};

module.exports = {
  mockEnrollAuthenticatorCustomOTP,
};
