const templateHelper = require('../../../config/templateHelper');
const identify = require('./data/identify');

module.exports = templateHelper({
  path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
  method: 'POST',
  status: (req, res, next) => {
    res.status(401);
    res.append('WWW-Authenticate', 'Oktadevicejwt realm="Okta Device"');
    next();
  },
  template: identify, // TODO: find a way to improve this, now the mock config is not always on responseConfig
});

