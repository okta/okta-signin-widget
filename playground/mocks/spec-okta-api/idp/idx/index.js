const templateHelper = require('../../../config/templateHelper');
const cancelTransaction = require('../../../data/idp/idx/identify-with-no-sso-extension');

const idx = [
  '/idp/idx',
  '/idp/idx/device/activate',
  '/idp/idx/authenticators/okta-verify/launch',
  '/idp/idx/authenticators/poll',
  '/idp/idx/authenticators/poll/cancel',
  '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify/cancel',
  '/idp/idx/cancel',
  '/idp/idx/challenge',
  '/idp/idx/challenge/answer',
  '/idp/idx/challenge/poll',
  '/idp/idx/challenge/send',
  '/idp/idx/challenge/resend',
  '/idp/idx/consent',
  '/idp/idx/consent/deny',
  '/idp/idx/credential/enroll',
  '/idp/idx/enroll',
  '/idp/idx/enroll/new',
  '/idp/idx/identify',
  '/idp/idx/introspect',
  '/idp/idx/login/token/redirect',
  '/idp/idx/recover',
  '/idp/idx/skip',
  '/idp/idx/poll',
  '/idp/idx/unlock-account',
  '/idp/idx/request-activation',
].map(path => {
  return templateHelper({path});
});

const ssoExtension = [
  templateHelper({
    path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
    method: 'GET',
    /* eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates */
    template: '<html>Verifying the device...the login flow will be resumed afterwards</html>'
  }),
  templateHelper({
    path: '/idp/idx/authenticators/sso_extension/transactions/:transactionId/verify',
    method: 'POST',
    status: (req, res, next) => {
      res.status(401); // To test biometrics error, change to 400
      res.append('WWW-Authenticate', 'Oktadevicejwt realm="Okta Device"');
      next();
    },
    // TODO: find a way to improve this, now the mock config is not always on responseConfig
    // To test biometrics error, use below two files
    // ../../../data/idp/idx/error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile
    // ../../../data/idp/idx/error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop
    template: cancelTransaction,
  })
];

module.exports = idx.concat(ssoExtension);
