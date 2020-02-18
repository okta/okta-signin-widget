const templateHelper = require('../../../config/templateHelper');

module.exports = templateHelper({
  path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
  method: 'GET',
  template: '<html>Verifying the device...the login flow will be resumed afterwards</html>'
});
