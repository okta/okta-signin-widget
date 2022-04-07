const nonIdxError = {
  '/idp/idx/introspect': [
    'identify-with-device-probing-loopback'
  ],
  '/idp/idx/authenticators/poll': [
    'error-empty-response'
  ],
  '/idp/idx/authenticators/poll/cancel': [
    'error-empty-response'
  ],
};

module.exports = {
  nonIdxError
};
