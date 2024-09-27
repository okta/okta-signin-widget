const templateHelper = require('../../../config/templateHelper');
const verifyError = require('../../../data/idp/idx/error-401-apple-ssoe-verify.json');
const verifyCancel = require('../../../data/idp/idx/apple-ssoe-verify.json');

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
  '/idp/idx/authenticators/webauthn/launch',
].map(path => {
  return templateHelper({path});
});

let verifyCall = -1;

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
      verifyCall++;
      res.status(verifyCall % 2 === 0 ? 401 : 200); // To test biometrics error, change to 400
      res.append('WWW-Authenticate', 'Oktadevicejwt realm="Okta Device"');
      next();
    },
    // TODO: find a way to improve this, now the mock config is not always on responseConfig
    // To test biometrics error, use below two files
    // ../../../data/idp/idx/error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile
    // ../../../data/idp/idx/error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop
    template() {
      return verifyCall % 2 === 0 ? verifyError : verifyCancel;
    }
  })
];

module.exports = idx.concat(ssoExtension);
