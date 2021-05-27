import { RequestMock, RequestLogger } from 'testcafe';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrAuthenticatorVerifySelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import xhrAuthenticatorOVTotp from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403);

const identifyMockWithFingerprint = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/auth/services/devicefingerprint')
  .respond(`
  <html>
    <script>
      const message = JSON.stringify({
        type: 'FingerprintAvailable',
        fingerprint: 'mock-device-fingerprint',
      });
      window.parent.postMessage(message, window.location.href);
    </script>
  </html>
  `)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorVerifySelect)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVTotp);

const identifyMockWithFingerprintError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/auth/services/devicefingerprint')
  .respond(`
  <html>
    <script>
      const message = JSON.stringify({
        type: 'FingerprintAvailable',
        fingerprint: 'mock-device-fingerprint',
      });
      window.parent.postMessage(message, window.location.href);
    </script>
  </html>
  `)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403);

const identifyLockedUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403);

const identifyThenSelectAuthenticatorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorVerifySelect);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

fixture('Identify');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMock)('should be able to submit identifier with rememberMe', async t => {
  const identityPage = await setup(t);

  await t.expect(identityPage.getSaveButtonLabel()).eql('Next');
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  const reqHeaders = req.headers;
  await t.expect(reqBody).eql({
    identifier: 'Test Identifier',
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
  await t.expect(reqHeaders['x-device-fingerprint']).notOk();

  identifyRequestLogger.clear();
  await identityPage.fillIdentifierField('another foobar');
  await identityPage.checkRememberMe();
  await identityPage.clickNextButton();
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req2 = identifyRequestLogger.requests[0].request;
  const reqBody2 = JSON.parse(req2.body);
  await t.expect(reqBody2).eql({
    identifier: 'another foobar',
    rememberMe: true,
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

test.requestHooks(identifyMock)('should show errors if required fields are empty', async t => {
  const identityPage = await setup(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierError()).eql(true);
  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});

test.requestHooks(identifyMock)('should have correct display text', async t => {
  // i18n values can be tested here.
  const identityPage = await setup(t);

  const identityPageTitle = identityPage.getPageTitle();
  await t.expect(identityPageTitle).eql('Sign In');

  const rememberMeText = identityPage.getRememberMeText();
  await t.expect(rememberMeText).eql('Keep me signed in');

  const rememberMeValue = identityPage.getRememberMeValue();
  await t.expect(rememberMeValue).eql(false);

  const signupLinkText = identityPage.getSignupLinkText();
  await t.expect(signupLinkText).eql('Sign up');
  await t.expect(identityPage.getFooterInfo()).eql('Don\'t have an account?Sign up');

  const needhelpLinkText = identityPage.getNeedhelpLinkText();
  await t.expect(needhelpLinkText).eql('Help');

  await t.expect(await identityPage.signoutLinkExists()).notOk();
  await t.expect(await identityPage.hasForgotPasswordLinkText()).notOk();
});

test.requestHooks(identifyLockedUserMock)('should show global error for invalid user', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();

  await t.expect(identityPage.getSaveButtonLabel()).eql('Next');

  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action');
});

test.requestHooks(identifyThenSelectAuthenticatorMock)('navigate to other screen will not trigger "ready" event again', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await identityPage.clickNextButton();

  const selectAuthenticatorPage = new SelectFactorPageObject();

  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log.length).eql(5);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'primary-auth',
    formName: 'identify',
  });
  await t.expect(log[3]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[4])).eql({
    controller: null,
    formName: 'select-authenticator-authenticate'
  });
});

test.requestHooks(identifyRequestLogger, identifyMock)('should transform identifier using settings.transformUsername', async t => {
  const identityPage = await setup(t);

  await rerenderWidget({
    transformUsername: function(username, operation) {
      if (operation === 'PRIMARY_AUTH') {
        return `${username}@okta.com`;
      }
    }
  });

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'Test Identifier@okta.com',
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
});

test.requestHooks(identifyMock)('should render custom Unlock account link', async t => {
  const identityPage = await setup(t);

  await rerenderWidget({
    helpLinks: {
      unlock: 'http://unlockaccount',
    },
    i18n: {
      en: {
        'unlockaccount': 'HELP I\'M LOCKED OUT'
      }
    }
  });

  await t.expect(identityPage.getUnlockAccountLinkText()).eql('HELP I\'M LOCKED OUT');
  await t.expect(identityPage.getCustomUnlockAccountLink()).eql('http://unlockaccount');
});

test.requestHooks(identifyMock)('should not render custom forgot password link', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    helpLinks: {
      forgotPassword: '/forgotpassword'
    }
  });

  await t.expect(await identityPage.hasForgotPasswordLinkText()).notOk();
});

test.requestHooks(identifyRequestLogger, identifyMockWithFingerprint)('should compute device fingerprint and add to header', async t => {
  const identityPage = await setup(t);

  await rerenderWidget({
    features: {
      deviceFingerprinting: true,
    }
  });

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // Validate the fingerprint is added as a request header
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqHeaders = req.headers;
  await t.expect(reqHeaders['x-device-fingerprint']).eql('mock-device-fingerprint');

  // Validate future requests do NOT contain the request header
  const selectAuthenticatorPage = new SelectFactorPageObject(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await selectAuthenticatorPage.selectFactorByIndex(0);

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const factorReq = identifyRequestLogger.requests[1].request;
  const factorReqHeaders = factorReq.headers;
  await t.expect(factorReqHeaders['x-device-fingerprint']).notOk();
});

test.requestHooks(identifyRequestLogger, identifyMockWithFingerprintError)('should continue to compute device fingerprint and add to header when there are API errors', async t => {
  const identityPage = await setup(t);

  await rerenderWidget({
    features: {
      deviceFingerprinting: true,
    }
  });

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // Validate the fingerprint is added as a request header
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqHeaders = req.headers;
  await t.expect(reqHeaders['x-device-fingerprint']).eql('mock-device-fingerprint');

  // Validate that there is an error message
  await identityPage.waitForErrorBox();
  await t.expect(identityPage.getSaveButtonLabel()).eql('Next');
  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action');
});
