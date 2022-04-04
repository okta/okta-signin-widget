const pushWaitMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-custom-app-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-custom-app-push'
  ],
};

const pushRejectMock = {
  '/idp/idx/introspect': [
    'authenticator-verification-custom-app-push'
  ],
  '/idp/idx/challenge/poll': [
    'authenticator-verification-custom-app-push-reject'
  ],
  '/idp/idx/challenge': [
    'authenticator-verification-custom-app-push'
  ],
};

module.exports = {
  pushWaitMock,
  pushRejectMock
};