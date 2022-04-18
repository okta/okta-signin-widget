const smsMock = {
  '/idp/idx/introspect': [
    'authenticator-enroll-phone'
  ],
  '/idp/idx/challenge/resend': [
    'authenticator-enroll-phone'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ]
};

module.exports = {
  smsMock
};
