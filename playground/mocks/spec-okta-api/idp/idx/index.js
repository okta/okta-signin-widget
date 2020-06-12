const templateHelper = require('../../../config/templateHelper');
const cancelTransaction = require('../../../data/idp/idx/identify-with-no-sso-extension');

const idx = [
  '/idp/idx',
  '/idp/idx/authenticators/okta-verify/launch',
  '/idp/idx/authenticators/poll',
  '/idp/idx/authenticators/poll/cancel',
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel',
  '/idp/idx/cancel',
  '/idp/idx/challenge',
  '/idp/idx/challenge/answer',
  '/idp/idx/challenge/poll',
  '/idp/idx/challenge/resend',
  '/idp/idx/credential/enroll',
  '/idp/idx/enroll',
  '/idp/idx/enroll/new',
  '/idp/idx/identify',
  '/idp/idx/introspect',
  '/idp/idx/login/token/redirect',
  '/idp/idx/recover',
  '/idp/idx/skip',
].map(path => {
  return templateHelper({path});
});

const ssoExtension = [
  templateHelper({
    path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
    method: 'GET',
    template: '<html>Verifying the device...the login flow will be resumed afterwards</html>'
  }),
  templateHelper({
    path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
    method: 'POST',
    status: (req, res, next) => {
      res.status(401);
      res.append('WWW-Authenticate', 'Oktadevicejwt realm="Okta Device"');
      next();
    },
    // TODO: find a way to improve this, now the mock config is not always on responseConfig
    template: cancelTransaction,
  })
];

module.exports = idx.concat(ssoExtension);
