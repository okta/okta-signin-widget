const identifyMock = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'error-identify-access-denied'
  ],
};

module.exports = {
  identifyMock
};
