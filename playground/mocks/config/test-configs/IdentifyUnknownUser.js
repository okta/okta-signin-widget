const mock = {
  '/idp/idx/introspect': [
    'identify'
  ],
  '/idp/idx/identify': [
    'identify-unknown-user',
    'authenticator-verification-select-authenticator'
  ],
};

const unassignedApplinkMock = {
  '/idp/idx/introspect': [
    'identify-unknown-user'
  ],
  '/idp/idx/identify': [
    'error-400-user-not-assigned'
  ],
};

module.exports = {
  mock,
  unassignedApplinkMock
};
