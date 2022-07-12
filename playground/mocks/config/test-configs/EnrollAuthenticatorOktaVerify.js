const enrollViaEmailMocks = {
  '/idp/idx/introspect': [
    'authenticator-enroll-ov-qr'
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-ov-via-email'
  ],
  '/idp/idx/challenge/send': [
    'authenticator-enroll-ov-email'
  ],
  '/idp/idx/challenge/poll': [
    'success'
  ]
};

module.exports = {
  enrollViaEmailMocks
};
