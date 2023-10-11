import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y, oktaDashboardContent } from '../framework/a11y';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrConsentEnduser from '../../../playground/mocks/data/idp/idx/consent-enduser';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrConsentEnduserCustomScopes from '../../../playground/mocks/data/idp/idx/consent-enduser-custom-scopes';
import terminalResetPasswordNotAllowed from '../../../playground/mocks/data/idp/idx/error-reset-password-not-allowed';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

const consentEnduserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentEnduser)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess)
  // .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  // .respond(oktaDashboardContent);

const consentEnduserCustomScopesMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentEnduserCustomScopes)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const consentEnduserFailedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentEnduser)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(terminalResetPasswordNotAllowed);

const requestLogger = RequestLogger(/consent/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  await t.expect(consentPage.formExists()).ok();
  return consentPage;
}

async function testRedirect(t) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
}

fixture('EnduserConsent').meta('v3', true);

test.requestHooks(requestLogger, consentEnduserMock)('should render scopes', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await t.expect(consentPage.hasScopeText('View your email address.')).eql(true);
  await t.expect(consentPage.hasScopeText('View your phone number.')).eql(true);
});

test.requestHooks(requestLogger, consentEnduserCustomScopesMock)('should render custom scopes', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await t.expect(consentPage.hasScopeText('View your mobile phone data plan.')).eql(true);
  await t.expect(consentPage.hasScopeText('View your internet search history.')).eql(true);
});

test.requestHooks(requestLogger, consentEnduserCustomScopesMock)('should display correct titleText', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await t.expect(await consentPage.getHeaderTitleText()).eql('would like to:');
});

// TODO: TEST FAILED
test.requestHooks(requestLogger, consentEnduserMock)('should call /consent and send {consent: true} on "Allow Access" click', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(true);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

// TODO: TEST FAILED
test.requestHooks(requestLogger, consentEnduserMock)('should call /consent and send {consent: false} on "Don\'t Allow" click', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

test.requestHooks(requestLogger, consentEnduserFailedMock)('should go to Terminal View after giving consent and failed', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  const terminalPageObject = new TerminalPageObject(t);
  // in v3 Go back and Signout links are the same (in v2 they vary based on class name)
  if (!userVariables.v3) {
    await t.expect(await terminalPageObject.goBackLinkExists()).notOk();
  }
  await t.expect(await terminalPageObject.signoutLinkExists()).ok();
  await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
  await t.expect(terminalPageObject.getErrorMessages().getTextContent()).contains('Reset password is not allowed at this time. Please contact support for assistance.');
});
