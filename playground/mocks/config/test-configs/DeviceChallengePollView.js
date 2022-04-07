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

module.exports = {
  loopbackUserCancelLoggerMock
};
