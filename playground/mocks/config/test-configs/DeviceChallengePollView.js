const loopbackUserCancelLoggerMock = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback'
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'identify-with-device-probing-loopback-challenge-not-received'
  ],
};


const customURIMock = {
  '/idp/idx/introspect': [
    'identify-with-device-launch-authenticator'
  ],
  '/idp/idx/authenticators/okta-verify/launch': [
    'identify-with-device-launch-authenticator'
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-launch-authenticator'
  ],
};

const loopbackSuccessMock = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'identify-with-device-probing-loopback',
    'identify-with-device-probing-loopback',
    'identify',
  ],
  // TODO: need a way to mock probed ports in playground
};

module.exports = {
  loopbackUserCancelLoggerMock,
  customURIMock,
  loopbackSuccessMock
};