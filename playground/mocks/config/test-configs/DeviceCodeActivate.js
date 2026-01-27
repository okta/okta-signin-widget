const invalidCodeMock = {
  '/idp/idx/introspect': [
    'device-code-activate'
  ],
  '/idp/idx/device/activate': [
    'error-invalid-device-code'
  ]
};

module.exports = {
  invalidCodeMock
};
