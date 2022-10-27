import { RequestMock, RequestLogger, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrIdentifyRecovery from '../../../playground/mocks/data/idp/idx/identify-recovery';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrAuthenticatorVerifySelect from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';

const identifyRecoveryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyRecovery)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorVerifySelect);

const identifyRecoveryErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyRecovery)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403);

const identifyRequestLogger = RequestLogger(
  /idx\/identify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Identify Recovery - reset flow').meta('v3', true);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(Selector('form').exists).eql(true);
  await checkConsoleMessages({
    controller: 'forgot-password',
    formName: 'identify-recovery',
  });

  return identityPage;
}

test.requestHooks(identifyRecoveryMock)('should have correct display texts', async t => {
  // i18n values can be tested here.
  const identityPage = await setup(t);

  const identityPageTitle = identityPage.getPageTitle();
  await t.expect(identityPageTitle).eql('Reset your password');

  const saveButtonText = identityPage.getSaveButtonLabel();
  await t.expect(saveButtonText).eql('Next');

  await t.expect(await identityPage.signoutLinkExists()).ok();
});

test.requestHooks(identifyRequestLogger, identifyRecoveryMock)('should be able to submit identifier', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('test.identifier');
  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'test.identifier',
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImV',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

test.requestHooks(identifyRecoveryMock)('should show errors if required fields are empty', async t => {
  const identityPage = await setup(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});

test.requestHooks(identifyRecoveryErrorMock)('global errors will display', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('test.identifier');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action');
});
