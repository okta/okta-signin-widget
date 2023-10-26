import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrIdentifyWithUnlock from '../../../playground/mocks/data/idp/idx/identify-with-unlock-account-link';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrAuthenticatorVerifySelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import xhrAuthenticatorOVTotp from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-totp';
import xhrIdentifyWithUser from '../../../playground/mocks/data/idp/idx/identify-with-user';
import xhrErrorIdentifyMultipleErrors from '../../../playground/mocks/data/idp/idx/error-identify-multiple-errors';

import config from '../../../src/config/config.json';

const baseIdentifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const identifyMockWithUnsupportedResponseError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond({}, 403);

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond((req, res) => {
    res.headers['content-type'] = 'application/json';
    if (userVariables.gen3) {
      res.statusCode = '200';
      res.setBody(xhrIdentify);
    } else {
      res.statusCode = '403';
      res.setBody(xhrErrorIdentify);
    }
  });

const identifyWithUnlockMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUnlock)
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

const identifyWithUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUser);

const errorsIdentifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrErrorIdentifyMultipleErrors);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

fixture('Identify');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMock)('should be able to submit identifier with rememberMe', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await t.expect(identityPage.getNextButton().exists).eql(true);
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
  await t.expect(reqHeaders['x-device-fingerprint']).notOk(); // only enabled if `features.deviceFingerprinting` is true
  await t.expect(reqHeaders['x-okta-user-agent-extended']).contains(` okta-signin-widget-${userVariables.gen3 ? 'g3-' : ''}${config.version}`);

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
  await checkA11y(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.getIdentifierErrorMessage()).eql('This field cannot be left blank');
});

test.requestHooks(identifyMockWithUnsupportedResponseError)('should show error if server response is unsupported', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.fillIdentifierField('test');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();
  await t.expect(identityPage.getErrorBoxText()).eql('There was an unsupported response from server.');
});

test.requestHooks(identifyMock)('should show customized error if required field identifier is empty', async t => {
  const identityPage = await setup(t, {
    i18n: {
      en: {
        'error.username.required': 'Username is required!',
      }
    }
  });
  await checkA11y(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.getIdentifierErrorMessage()).eql('Username is required!');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should not show custom error if password doesn\'t exist in remediation', async t => {
  const identityPage = await setup(t, {
    i18n: {
      en: {
        'error.username.required': 'Username is required!',
        'error.password.required': 'Password is required!',
      }
    }
  });
  await checkA11y(t);

  await identityPage.fillIdentifierField('test');
  await identityPage.clickNextButton();
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
});

test.requestHooks(identifyMock)('should have correct display text', async t => {
  // i18n values can be tested here.
  const identityPage = await setup(t);
  await checkA11y(t);

  const identityPageTitle = identityPage.getFormTitle();
  await t.expect(identityPageTitle).eql('Sign In');

  const rememberMeCheckbox = identityPage.getRememberMeCheckbox();
  await t.expect(rememberMeCheckbox.exists).eql(true);

  const rememberMeValue = identityPage.getRememberMeValue();
  await t.expect(rememberMeValue).eql(false);

  const signupLinkText = identityPage.getSignupLinkText();
  await t.expect(signupLinkText).eql('Sign up');
  if (userVariables.gen3) {
    await t.expect(identityPage.getFooterInfo()).eql('Don\'t have an account?');
  } else {
    await t.expect(identityPage.getFooterInfo()).eql('Don\'t have an account?Sign up');
  }

  const needhelpLinkText = identityPage.getNeedhelpLinkText();
  await t.expect(needhelpLinkText).eql('Help');

  await t.expect(await identityPage.signoutLinkExists()).notOk();
  await t.expect(await identityPage.hasForgotPasswordLinkText()).notOk();
});

test.requestHooks(identifyLockedUserMock)('should show global error for invalid user', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();
  if (userVariables.gen3) {
    // Gen3 follows the IDX response, this response is terminal and does not have remediations
    // hence why it will not display a button or fields, only the error message
    await t.expect(identityPage.form.queryButton('Next').exists).eql(false);
  } else {
    await t.expect(identityPage.getNextButton().exists).eql(true);
  }

  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action');
});

test.requestHooks(identifyThenSelectAuthenticatorMock)('navigate to other screen will not trigger "ready" event again', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await identityPage.clickNextButton();

  const selectAuthenticatorPage = new SelectFactorPageObject();

  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with a security method');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    'afterRender',
    {
      controller: null,
      formName: 'select-authenticator-authenticate'
    }
  ]);
});

test.requestHooks(identifyRequestLogger, identifyMock)('should transform identifier using settings.transformUsername', async t => {
  const identityPage = await setup(t, {
    transformUsername: function(username, operation) {
      if (operation === 'PRIMARY_AUTH') {
        return `${username}@okta.com`;
      }
    }
  });
  await checkA11y(t);

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

test.requestHooks(identifyWithUnlockMock)('should render custom Unlock account link', async t => {
  const customUnlockLinkText = 'HELP I\'M LOCKED OUT';
  const identityPage = await setup(t, {
    helpLinks: {
      unlock: 'http://unlockaccount',
    },
    i18n: {
      en: {
        'unlockaccount': customUnlockLinkText
      }
    }
  });
  await checkA11y(t);

  await t.expect(identityPage.unlockAccountLinkExists(customUnlockLinkText)).eql(true);
  await t.expect(identityPage.getCustomUnlockAccountLinkUrl(customUnlockLinkText)).eql('http://unlockaccount');
});

test.requestHooks(identifyMock)('should not render custom forgot password link', async t => {
  const identityPage = await setup(t, {
    helpLinks: {
      forgotPassword: '/forgotpassword'
    }
  });
  await checkA11y(t);

  await t.expect(await identityPage.hasForgotPasswordLinkText()).notOk();
});

// Re-enable in OKTA-654456
test.meta('gen3', false).requestHooks(identifyRequestLogger, identifyMockWithFingerprint)('should compute device fingerprint and add to header', async t => {
  const identityPage = await setup(t, {
    features: {
      deviceFingerprinting: true,
    }
  });
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // Validate the fingerprint is added as a request header
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqHeaders = req.headers;
  await t.expect(reqHeaders['x-device-fingerprint']).eql('mock-device-fingerprint');

  // future requests will also contain the request header
  const selectAuthenticatorPage = new SelectFactorPageObject(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with a security method');
  await selectAuthenticatorPage.selectFactorByIndex(0);

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const factorReq = identifyRequestLogger.requests[1].request;
  const factorReqHeaders = factorReq.headers;
  await t.expect(factorReqHeaders['x-device-fingerprint']).eql('mock-device-fingerprint');
});

// Re-enable in OKTA-654456
test.meta('gen3', false).requestHooks(identifyRequestLogger, identifyMockWithFingerprintError)('should continue to compute device fingerprint and add to header when there are API errors', async t => {
  const identityPage = await setup(t, {
    features: {
      deviceFingerprinting: true,
    }
  });
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  // Validate the fingerprint is added as a request header
  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqHeaders = req.headers;
  await t.expect(reqHeaders['x-device-fingerprint']).eql('mock-device-fingerprint');

  // Validate that there is an error message
  await identityPage.waitForErrorBox();
  await t.expect(identityPage.getNextButton().exists).eql(true);
  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action');
});

test.requestHooks(identifyRequestLogger, baseIdentifyMock)('should pre-populate identifier field with username config', async t => {
  const identityPage = await setup(t, {
    username: 'myTestUsername@okta.com'
  });
  await checkA11y(t);

  // Ensure identifier field is pre-filled
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('myTestUsername@okta.com');
});

test.requestHooks(identifyRequestLogger, baseIdentifyMock)('should hide "Keep me signed in" checkbox with config', async t => {
  const identityPage = await setup(t, {
    features: { showKeepMeSignedIn: false }
  });
  await checkA11y(t);

  // Ensure checkbox is hidden
  const rememberMeCheckbox = identityPage.getRememberMeCheckbox();
  await t.expect(rememberMeCheckbox.exists).eql(false);
});

test.requestHooks(identifyRequestLogger, baseIdentifyMock)('should show "Keep me signed in" checkbox with config or by default', async t => {
  const identityPage = await setup(t, {
    features: {}
  });
  await checkA11y(t);

  // Ensure checkbox is shown
  let rememberMeCheckbox = identityPage.getRememberMeCheckbox();
  await t.expect(rememberMeCheckbox.exists).eql(true);

  await rerenderWidget({
    features: { showKeepMeSignedIn: true }
  });

  // Ensure checkbox is shown
  rememberMeCheckbox = identityPage.getRememberMeCheckbox();
  await t.expect(rememberMeCheckbox.exists).eql(true);
});

test.requestHooks(identifyRequestLogger, identifyWithUserMock)('should never render user\'s identifier even if there is user context', async t => {
  // identifyWithUserMock comes up when a user enters invalid credentials and sign in returns an error, along with a user object
  const identityPage = await setup(t);
  await checkA11y(t);

  const identifierContainer = identityPage.form.getElement('.identifier-container').exists;
  await t.expect(identifierContainer).eql(false);
});

test.requestHooks(identifyRequestLogger, errorsIdentifyMock)('should render each error message when there are multiple', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await t.expect(await identityPage.form.getErrorBoxTextByIndex(0)).eql('Please enter a username');
  await t.expect(await identityPage.form.getErrorBoxTextByIndex(1)).eql('Please enter a password');
  await t.expect(await identityPage.form.getErrorBoxTextByIndex(2)).eql('Your session has expired. Please try to sign in again.');
});

// Re-enable in OKTA-654458
test.meta('gen3', false).requestHooks(identifyRequestLogger, baseIdentifyMock)('should "autoFocus" form with config or by default', async t => {
  const identityPage = await setup(t, {
    features: {}
  });
  await checkA11y(t);

  let doesFormHaveFocus = identityPage.form.getElement('[data-se="o-form-input-identifier"] input').focused;
  await t.expect(doesFormHaveFocus).eql(true);


  await rerenderWidget({
    features: { autoFocus: true }
  });

  doesFormHaveFocus = identityPage.form.getElement('[data-se="o-form-input-identifier"] input').focused;
  await t.expect(doesFormHaveFocus).eql(true);


  await rerenderWidget({
    features: { autoFocus: false }
  });

  doesFormHaveFocus = identityPage.form.getElement('[data-se="o-form-input-identifier"] input').focused;
  await t.expect(doesFormHaveFocus).eql(false);
});

test.requestHooks(identifyRequestLogger, baseIdentifyMock)('should set autocomplete to off on username field when features.disableAutocomplete is true', async t => {
  const identityPage = await setup(t, {
    features: {
      disableAutocomplete: true,
    },
  });
  await checkA11y(t);

  await t.expect(identityPage.getFormTitle()).eql('Sign In');
  const userNameField = identityPage.getTextField('Username');
  await t.expect(userNameField.getAttribute('autocomplete')).eql('off');
});
