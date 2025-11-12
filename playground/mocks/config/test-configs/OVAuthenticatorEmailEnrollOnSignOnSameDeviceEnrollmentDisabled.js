const mock = {
  '/idp/idx/introspect': [
    'identify-with-password',
  ],
  '/idp/idx/identify': [
    'authenticator-enroll-select-authenticator',
  ],
  '/idp/idx/credential/enroll': [
    'authenticator-enroll-ov-qr',
    'authenticator-enroll-ov-via-email',
    'authenticator-enroll-ov-via-email',
  ],
  '/idp/idx/challenge/send': [
    'authenticator-enroll-ov-email',
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-enroll-ov-email-version-upgrade',
  ]
};

module.exports = {
  mock,
};
