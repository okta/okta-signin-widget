const mockExpireInDays = {
  '/idp/idx/introspect': [
    'authenticator-expiry-warning-password'
  ],
  '/idp/idx/challenge/answer': [
    'success'
  ],
};

const mockChangePasswordNotAllowed = {
  '/idp/idx/introspect': [
    'authenticator-expiry-warning-password'
  ],
  '/idp/idx/challenge/answer': [
    'error-change-password-not-allowed'
  ],
  '/idp/idx/skip': [
    'success'
  ]
};


module.exports = {
  mockExpireInDays,
  mockChangePasswordNotAllowed
};
